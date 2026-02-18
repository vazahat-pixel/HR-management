const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }

        if (user.status !== 'Active') {
            return res.status(403).json({ error: 'Account is inactive.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};

const authorizeEmployee = (req, res, next) => {
    if (req.user.role !== 'employee') {
        return res.status(403).json({ error: 'Access denied. Employee only.' });
    }
    next();
};

module.exports = { authenticate, authorizeAdmin, authorizeEmployee };
