const jwt = require('jsonwebtoken');
const { findUserById, toSafeUser } = require('../models/User');

// Verifies the JWT and attaches the logged-in user to req.user
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    req.user = user; // full row (controllers strip sensitive fields via toSafeUser when responding)
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
};

module.exports = protect;
