const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) return res.status(401).json({ error: "Invalid token" });
      req.user = payload; // contains { id, email, role }
      next();
    });
  } catch (err) {
    console.error("verifyToken error:", err);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// ✅ Allow multiple roles
const requireRole = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  // Convert single string to array
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ error: "Forbidden: insufficient role permission" });
  }

  next();
};

module.exports = { verifyToken, requireRole };
