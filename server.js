const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* ROOT */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ONLINE USERS */
const onlineUsers = new Set();

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    socket.username = username;
    onlineUsers.add(username);
    io.emit("online", Array.from(onlineUsers));
  });

  socket.on("chatMessage", (data) => {
    io.emit("chatMessage", {
      user: data.user,
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

server.listen(process.env.PORT || 3000, () => {
  console.log("PAM App running");
});
