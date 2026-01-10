require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");

require("./auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Home (login page)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Google login
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("pam_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });

    res.redirect("/dashboard");
  }
);

// Protected route test
app.get("/dashboard", (req, res) => {
  const token = req.cookies.pam_token;
  if (!token) return res.redirect("/");

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.send("LOGIN SUCCESSFUL ✅ (Dashboard coming next)");
  } catch {
    res.redirect("/");
  }
});

app.listen(PORT, () => {
  console.log(`PAM APP running on port ${PORT}`);
});