// server/src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
const uploadsImagesDir = path.join(uploadDir, 'images');
const uploadsVideosDir = path.join(uploadDir, 'videos');
const thumbnailsDir = path.join(uploadDir, 'thumbnails');

[uploadDir, uploadsImagesDir, uploadsVideosDir, thumbnailsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isImage = file.mimetype.startsWith('image');
        const dest = isImage ? uploadsImagesDir : uploadsVideosDir;
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter for images and videos
const fileFilter = (req, file, cb) => {
    // Allow only images and videos
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

    if ([...allowedImageTypes, ...allowedVideoTypes].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images and videos are allowed'), false);
    }
};

// Create multer upload object with size limits
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 1024, // 1GB max for initial check, we'll compress later
    }
});

// Function to compress image to be under 2MB
const compressImage = async (filePath, originalSize) => {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    // Start with quality 80 and gradually decrease if needed
    let quality = 80;
    let compressedBuffer;
    let compressedSize = originalSize;

    while (compressedSize > MAX_SIZE && quality > 10) {
        // Get image format
        const format = path.extname(filePath).toLowerCase().replace('.', '');
        const sharpInstance = sharp(filePath);

        // Compress based on format
        if (format === 'png') {
            compressedBuffer = await sharpInstance
                .png({ quality, compressionLevel: 9 })
                .toBuffer();
        } else if (format === 'webp') {
            compressedBuffer = await sharpInstance
                .webp({ quality })
                .toBuffer();
        } else if (format === 'gif') {
            // For GIF, resize dimensions to reduce size
            const metadata = await sharpInstance.metadata();
            const newWidth = Math.round(metadata.width * 0.8);
            compressedBuffer = await sharpInstance
                .resize(newWidth)
                .gif()
                .toBuffer();
        } else {
            // Default to JPEG compression
            compressedBuffer = await sharpInstance
                .jpeg({ quality })
                .toBuffer();
        }

        compressedSize = compressedBuffer.length;

        // If still too large, reduce quality further
        quality -= 10;
    }

    // If we can't compress enough with quality, try resizing
    if (compressedSize > MAX_SIZE) {
        const metadata = await sharp(filePath).metadata();
        let scale = 0.9;

        while (compressedSize > MAX_SIZE && scale > 0.3) {
            const newWidth = Math.round(metadata.width * scale);

            compressedBuffer = await sharp(filePath)
                .resize(newWidth)
                .jpeg({ quality: 70 })
                .toBuffer();

            compressedSize = compressedBuffer.length;
            scale -= 0.1;
        }
    }

    // Write the compressed file back to the original path
    await fs.promises.writeFile(filePath, compressedBuffer);

    return compressedSize;
};

// Function to compress video to be under 2MB
const compressVideo = async (filePath, originalSize) => {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const fileDir = path.dirname(filePath);
    const fileExt = path.extname(filePath);
    const compressedPath = path.join(fileDir, `compressed_${path.basename(filePath, fileExt)}${fileExt}`);

    console.log(`Compressing video: ${filePath} to ${compressedPath}`);

    // Verify the input file exists and is readable
    if (!fs.existsSync(filePath)) {
        throw new Error(`Input file does not exist: ${filePath}`);
    }

    // Check output directory is writable
    try {
        fs.accessSync(fileDir, fs.constants.W_OK);
    } catch (error) {
        throw new Error(`Output directory is not writable: ${fileDir}`);
    }

    // Try different compression levels
    const compressionLevels = [
        { crf: 28, preset: 'medium', scale: '1280:-1' },  // HD
        { crf: 30, preset: 'faster', scale: '854:-1' },   // 480p
        { crf: 32, preset: 'veryfast', scale: '640:-1' }, // 360p
        { crf: 35, preset: 'superfast', scale: '426:-1' } // 240p
    ];

    let compressedSize = originalSize;
    let level = 0;
    let success = false;

    while (compressedSize > MAX_SIZE && level < compressionLevels.length) {
        const { crf, preset, scale } = compressionLevels[level];

        // Remove previous compressed file if it exists
        if (fs.existsSync(compressedPath)) {
            fs.unlinkSync(compressedPath);
        }

        try {
            // Use simpler, more reliable ffmpeg settings
            await new Promise((resolve, reject) => {
                ffmpeg(filePath)
                    .outputOptions([
                        '-c:v libx264',         // Use H.264 codec
                        `-preset ${preset}`,     // Compression speed
                        `-crf ${crf}`,           // Quality (higher = lower quality)
                        `-vf scale=${scale}`,    // Resize video
                        '-c:a aac',             // Audio codec
                        '-b:a 64k',             // Audio bitrate
                        '-movflags +faststart'  // Web optimization
                    ])
                    .output(compressedPath)
                    .on('progress', (progress) => {
                        console.log(`Processing: ${progress.percent?.toFixed(2)}% done`);
                    })
                    .on('end', () => {
                        console.log(`Successfully compressed video at level ${level}`);
                        resolve();
                    })
                    .on('error', (err) => {
                        console.error(`Error compressing video at level ${level}:`, err.message);
                        reject(err);
                    })
                    .run();
            });

            // Check if output file exists
            if (fs.existsSync(compressedPath)) {
                const stats = fs.statSync(compressedPath);
                compressedSize = stats.size;
                console.log(`Compressed size: ${compressedSize} bytes at level ${level}`);
                success = true;
            } else {
                console.error(`Output file was not created at level ${level}`);
                level++;
            }
        } catch (error) {
            console.error(`Compression failed at level ${level}:`, error.message);
            level++;
        }
    }

    // If we got a compressed file, use it
    if (success) {
        try {
            fs.unlinkSync(filePath);
            fs.renameSync(compressedPath, filePath);
            return compressedSize;
        } catch (error) {
            console.error('Error replacing original file:', error);
            throw error;
        }
    } else {
        // If all compression attempts failed, we need to handle this situation
        console.error('All compression attempts failed');
        throw new Error('Could not compress video file to under 2MB');
    }
};

// Middleware to validate uploaded file
const validateFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const file = req.file;
        const isImage = file.mimetype.startsWith('image');
        let fileSize = file.size;
        const MAX_SIZE = 2 * 1024 * 1024; // 2MB

        // Check if file exceeds 2MB and compress if needed
        if (fileSize > MAX_SIZE) {
            console.log(`File size (${fileSize} bytes) exceeds 2MB limit. Compressing...`);

            try {
                if (isImage) {
                    // Compress image
                    fileSize = await compressImage(file.path, fileSize);
                } else {
                    // Compress video
                    fileSize = await compressVideo(file.path, fileSize);
                }

                console.log(`After compression: ${fileSize} bytes`);
            } catch (compressionError) {
                console.error('Error during compression:', compressionError);
                fs.unlinkSync(file.path);
                return res.status(400).json({
                    error: `Could not compress file below 2MB limit. Please upload a smaller file or reduce quality before uploading.`
                });
            }
        }

        // For videos, check duration
        if (!isImage) {
            const getDuration = (videoPath) => {
                return new Promise((resolve, reject) => {
                    ffmpeg.ffprobe(videoPath, (err, metadata) => {
                        if (err) return reject(err);
                        resolve(metadata.format.duration);
                    });
                });
            };

            const duration = await getDuration(file.path);

            // If video is longer than 60 seconds, trim it
            if (duration > 60) {
                console.log(`Video duration (${duration}s) exceeds 60 seconds limit. Trimming...`);

                try {
                    const fileDir = path.dirname(file.path);
                    const fileExt = path.extname(file.path);
                    const trimmedPath = path.join(fileDir, `trimmed_${path.basename(file.path, fileExt)}${fileExt}`);

                    // Trim video to first 60 seconds
                    await new Promise((resolve, reject) => {
                        ffmpeg(file.path)
                            .outputOptions([
                                '-t 60',              // Trim to 60 seconds
                                '-c:v copy',          // Copy video codec (fast)
                                '-c:a copy'           // Copy audio codec (fast)
                            ])
                            .output(trimmedPath)
                            .on('progress', (progress) => {
                                console.log(`Trimming: ${progress.percent?.toFixed(2)}% done`);
                            })
                            .on('end', () => {
                                console.log('Successfully trimmed video to 60 seconds');
                                resolve();
                            })
                            .on('error', (err) => {
                                console.error('Error trimming video:', err.message);
                                reject(err);
                            })
                            .run();
                    });

                    // Replace original with trimmed version
                    fs.unlinkSync(file.path);
                    fs.renameSync(trimmedPath, file.path);

                    // Update duration
                    duration = 60;
                    console.log('Video trimmed to 60 seconds');

                    // Check file size after trimming
                    const stats = fs.statSync(file.path);
                    fileSize = stats.size;

                    // Compress if still over 2MB
                    if (fileSize > MAX_SIZE) {
                        console.log(`Trimmed video size (${fileSize} bytes) still exceeds 2MB limit. Compressing...`);
                        fileSize = await compressVideo(file.path, fileSize);
                        console.log(`After compression: ${fileSize} bytes`);
                    }
                } catch (trimError) {
                    console.error('Error during video trimming:', trimError);
                    fs.unlinkSync(file.path);
                    return res.status(400).json({
                        error: `Could not process video. Please upload a shorter video or reduce quality before uploading.`
                    });
                }
            }

            // Store duration in request for later use
            req.fileDuration = Math.round(duration);
        }

        // Create thumbnail for both images and videos
        const thumbnailFileName = `thumbnail-${path.basename(file.path)}`;
        const thumbnailPath = path.join(thumbnailsDir, thumbnailFileName);

        if (isImage) {
            // For images, just resize
            await sharp(file.path)
                .resize(300, 300, { fit: 'inside' })
                .toFile(thumbnailPath);
        } else {
            // For videos, extract a frame at 0.5 seconds
            await new Promise((resolve, reject) => {
                ffmpeg(file.path)
                    .screenshots({
                        count: 1,
                        folder: thumbnailsDir,
                        filename: thumbnailFileName,
                        size: '300x?'
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });
        }

        // Add thumbnail path to request
        req.thumbnailPath = thumbnailPath;

        // Add file metadata to request
        req.fileDetails = {
            fileUrl: file.path.replace(path.join(__dirname, '../..'), ''),
            fileType: isImage ? 'image' : 'video',
            fileSize: fileSize,  // Use updated file size after compression
            thumbnailUrl: thumbnailPath.replace(path.join(__dirname, '../..'), ''),
            duration: isImage ? null : req.fileDuration
        };

        next();
    } catch (error) {
        console.error('File validation error:', error);
        // Cleanup any file if there was an error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ error: 'Error validating file' });
    }
};

module.exports = {
    upload,
    validateFile
};