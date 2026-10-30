const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nest_and_nova_super_secret_jwt_key_2026_change_in_production';

function extractToken(req) {
  if (req.cookies && (req.cookies.token || req.cookies.auth_token)) {
    return req.cookies.token || req.cookies.auth_token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

function authenticateUser(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to continue.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.'
    });
  }
}

function requireAdmin(req, res, next) {
  authenticateUser(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrative privileges required.'
    });
  });
}

function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      // Ignore invalid token in optional auth
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

module.exports = {
  authenticateUser,
  requireAdmin,
  optionalAuth
};
