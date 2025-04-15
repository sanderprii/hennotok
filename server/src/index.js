// server/src/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    // Disable request timeout for large file uploads
    req.setTimeout(3600000); // 1 hour in milliseconds
    next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});