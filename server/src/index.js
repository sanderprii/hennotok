// server/src/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const likeRoutes = require('./routes/likeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
require('dotenv').config();

const app = express();
const PORT = 3001; // Kasutame porti 3001, kuna 5000 on juba kasutusel

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    // Disable request timeout for large file uploads
    req.setTimeout(3600000); // 1 hour in milliseconds
    next();
});

// Serve static files from uploads directory and its subdirectories
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/images', express.static(path.join(__dirname, '../uploads/images')));
app.use('/uploads/videos', express.static(path.join(__dirname, '../uploads/videos')));
app.use('/uploads/thumbnails', express.static(path.join(__dirname, '../uploads/thumbnails')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});