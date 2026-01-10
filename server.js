require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");

require("./auth");
const User = require("./models/User");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const upload = multer({ dest: "uploads/" });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(passport.initialize());

// MongoDB
mongoose.connect(process.env.MONGO_URI).then(()=>console.log("MongoDB connected"));

// JWT Auth
function authMiddleware(req,res,next){
  const token = req.cookies.pam_token;
  if(!token) return res.status(401).send("Unauthorized");
  try{
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  }catch{
    return res.status(401).send("Unauthorized");
  }
}

// Google OAuth
app.get("/auth/google", passport.authenticate("google",{ scope:["profile","email"] }));
app.get("/auth/google/callback", passport.authenticate("google",{ session:false }), async (req,res)=>{
  const token = jwt.sign({ id:req.user._id }, process.env.JWT_SECRET, { expiresIn:"7d" });
  res.cookie("pam_token", token, { httpOnly:true, secure:true, sameSite:"lax" });
  res.redirect("/dashboard");
});

// Dashboard
app.get("/dashboard", authMiddleware, (req,res)=>{
  res.sendFile(path.join(__dirname,"public/dashboard.html"));
});

// Current user API
app.get("/api/me", authMiddleware, async (req,res)=>{
  const user = await User.findById(req.user.id);
  res.json(user);
});

// All users API
app.get("/api/users", authMiddleware, async (req,res)=>{
  const users = await User.find();
  res.json(users);
});

// Messages API
app.get("/api/messages", authMiddleware, async (req,res)=>{
  const otherId = req.query.userId;
  const messages = await Message.find({
    $or:[
      { from:req.user.id, to:otherId },
      { from:otherId, to:req.user.id }
    ]
  }).sort({ createdAt:1 });
  res.json(messages);
});

// Image upload
app.post("/api/upload", authMiddleware, upload.single("image"), (req,res)=>{
  if(!req.file) return res.status(400).json({ error:"No file uploaded" });
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Socket.IO
let onlineUsers = {};
io.on("connection", socket=>{
  socket.on("user online", userId=>{
    onlineUsers[userId] = socket.id;
    io.emit("update online", Object.keys(onlineUsers));
  });
  socket.on("private message", async ({ to, text, image, from })=>{
    const msg = await Message.create({ from, to, text, image });
    const socketId = onlineUsers[to];
    if(socketId) io.to(socketId).emit("private message", msg);
    socket.emit("private message", msg);
  });
  socket.on("disconnect", ()=>{
    for(let userId in onlineUsers){
      if(onlineUsers[userId]===socket.id) delete onlineUsers[userId];
      io.emit("update online", Object.keys(onlineUsers));
    }
  });
});

// Start server
server.listen(PORT, ()=>console.log(`PAM APP running on port ${PORT}`));
