const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pulse_secret_key'; 

const verifyToken = (req, res, next) => {
  if (req.path.startsWith('/auth') || req.path.startsWith('/api/auth')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.headers['x-user-id'] = decoded.userId;
    next();
  } catch (_err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = verifyToken;
