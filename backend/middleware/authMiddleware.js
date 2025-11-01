const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'megajobnepal_jwt_secret_key_2024', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // Keep userId as string; Postgres adapter will match by id string
    if (user.userId && typeof user.userId !== 'string') {
      user.userId = String(user.userId);
    }
    
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
  // Require a specific role (e.g., 'admin') on authenticated requests
  requireRole: (role) => (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access token required' });
    }
    if (role && req.user.user_type !== role) {
      return res.status(403).json({ error: `Forbidden: requires ${role} role` });
    }
    next();
  }
};