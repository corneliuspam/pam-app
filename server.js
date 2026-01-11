const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fileUpload = require("express-fileupload");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static("public"));

// Ensure uploads folder exists
if (!fs.existsSync("./uploads")) fs.mkdirSync("./uploads");

// In-memory users
let users = [];

// LOGIN / REGISTER
app.post("/login", (req, res) => {
  const { username, phone } = req.body;
  let profile = null;

  if (req.files && req.files.profilePic) {
    const file = req.files.profilePic;
    const filename = `${Date.now()}_${file.name}`;
    const filepath = path.join(__dirname, "uploads", filename);
    file.mv(filepath);
    profile = `/uploads/${filename}`;
  }

  let user = users.find(u => u.username === username || u.phone === phone);
  if (!user) {
    user = { username, phone, profile };
    users.push(user);
  } else if (profile) {
    user.profile = profile;
  }

  res.json({ success: true, user });
});

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DASHBOARD
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// SOCKET.IO
const onlineUsers = new Set();

io.on("connection", socket => {
  socket.on("join", username => {
    socket.username = username;
    onlineUsers.add(username);
    io.emit("online", Array.from(onlineUsers));
  });

  socket.on("chatMessage", data => {
    io.emit("chatMessage", {
      user: data.user,
      profile: data.profile || null,
      message: data.message,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      onlineUsers.delete(socket.username);
      io.emit("online", Array.from(onlineUsers));
    }
  });
});

// PORT
server.listen(process.env.PORT || 3000, () => {
  console.log("PAM App running");
});
