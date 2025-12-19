const auth = require("./auth");

// Admin middleware that chains auth + role check
module.exports = (req, res, next) => {
  // First run auth middleware
  auth(req, res, (err) => {
    if (err) return next(err);

    // Then check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  });
};
