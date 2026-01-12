const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

// ===== Serve dashboard and index =====
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

// ===== SOCKET.IO =====
io.on("connection", (socket) => {

  console.log("A user connected");

  // When a chat message is sent
  socket.on("chat message", (data) => {
    console.log("Message received:", data);
    io.emit("chat message", data); // broadcast to all users
  });

  socket.on("user connected", (username) => {
    console.log(username + " is online");
  });

  socket.on("user disconnected", (username) => {
    console.log(username + " disconnected");
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
