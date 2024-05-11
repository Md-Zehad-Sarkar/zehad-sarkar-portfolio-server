const jwt = require("jsonwebtoken");

const authGuard = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized Access" });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, email } = decoded;
    req.name = name;
    req.email = email;
    next();
  } catch (error) {
    console.log(error);

    res.status(401).json({ success: false, message: "Unauthorized Access" });
  }
};

module.exports = authGuard;
