const jwt = require('jsonwebtoken');
const { isTokenExpired } = require('../utils/tokenUtils');
const prisma = require('../config/db');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing' });
  }

  if (isTokenExpired(token)) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Assuming the token contains userId
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticate }