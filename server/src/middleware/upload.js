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
        fileSize: 20 * 1024 * 1024, // 20MB max for initial check (we'll validate specific sizes after)
    }
});

// Middleware to validate uploaded file
const validateFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const file = req.file;
        const isImage = file.mimetype.startsWith('image');
        const fileSize = file.size;

        // Check image size limit (2MB)
        if (isImage && fileSize > 2 * 1024 * 1024) {
            // Remove the file
            fs.unlinkSync(file.path);
            return res.status(400).json({ error: 'Image size exceeds 2MB limit' });
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

            // If video is longer than 60 seconds, delete it and return error
            if (duration > 60) {
                fs.unlinkSync(file.path);
                return res.status(400).json({ error: 'Video duration exceeds 60 seconds limit' });
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
            fileSize: fileSize,
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