const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// IMPORTANT: Render provides PORT
const PORT = process.env.PORT || 10000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// In-memory users (NO DB)
let users = {};

// Socket.io
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (user) => {
    // user = { name, avatar }
    users[socket.id] = user;

    // Notify everyone
    io.emit("system", `${user.name} is online`);
    io.emit("online-users", Object.values(users));
  });

  socket.on("message", (data) => {
    // data = { name, avatar, text }
    io.emit("message", data);
  });
  
socket.on("chatMessage", (data) => {
  io.emit("chatMessage", {
    user: data.user,
    message: data.message,
    time: new Date().toLocaleTimeString()
  });
});
  
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      io.emit("system", `${user.name} went offline`);
      delete users[socket.id];
      io.emit("online-users", Object.values(users));
    }
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log("✅ PAM APP running on port", PORT);
});
