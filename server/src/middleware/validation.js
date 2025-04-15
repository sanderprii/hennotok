// Middleware to validate signup data
const validateSignUp = (req, res, next) => {
    const { username, password, confirmPassword } = req.body;

    // Check if all fields are provided
    if (!username || !password || !confirmPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check password length
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    next();
};

module.exports = {
    validateSignUp
};