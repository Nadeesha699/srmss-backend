const jwt = require('jsonwebtoken');
require("dotenv").config();

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded; 
    next(); 
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed: Invalid token' });
  }
};