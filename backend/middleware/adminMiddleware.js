const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: 'Admin account is deactivated.' });
    }

    // Add admin info to request
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check specific permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(403).json({ message: 'Admin authentication required' });
    }

    if (!req.admin.permissions.includes(permission)) {
      return res.status(403).json({ 
        message: `Access denied. ${permission} permission required.` 
      });
    }

    next();
  };
};

module.exports = {
  adminMiddleware,
  checkPermission
};