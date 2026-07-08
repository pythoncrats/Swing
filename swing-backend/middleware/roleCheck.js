// Usage: authorize('admin') or authorize('trainer', 'admin')
// Must run AFTER the `protect` middleware, since it relies on req.user.
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This page is restricted to: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
};

module.exports = authorize;
