function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(403).json({ error: "No token provided" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    req.user = user;
    next();
  });
}
const router = require("express").Router()
const jwt = require("jsonwebtoken")

router.post("/login", (req, res) => {

  const { password } = req.body

  if (password === process.env.ADMIN_PASSWORD) {

    const token = jwt.sign(
      { admin: true },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    )

    res.json({ token })

  } else {

    res.status(401).json({ message: "Invalid password" })

  }

})

module.exports = router