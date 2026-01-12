const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve public folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

// Socket.IO for chat
io.on("connection", (socket) => {
  console.log("A user connected");

  // Receive chat message
  socket.on("chat message", (data) => {
    io.emit("chat message", data); // broadcast to all
  });

  // Handle online/offline
  socket.on("user connected", (username) => console.log(username + " online"));
  socket.on("user disconnected", (username) => console.log(username + " offline"));

  socket.on("disconnect", () => console.log("A user disconnected"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
