const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded user:", decoded); // Debugging line to check decoded user
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: User not authenticated" });
  }

  console.log("User role:", req.user.role);

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  next();
};
