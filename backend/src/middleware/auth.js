// src/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(400).json({ error: 'UnAuthorized Access' });
    req.users = payload; // { id, email, role }
    next();
  });
};

const requireRole = (role) => (req, res, next) => {
  if (!req.users) return res.status(401).json({ error: 'Unauthorized' });
  if (req.users.role !== role) return res.status(403).json({ error: 'Forbidden: insufficient role' });
  next();
};

module.exports = { verifyToken, requireRole };
