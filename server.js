const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

let users = {};

io.on("connection", (socket) => {
  socket.on("join", (user) => {
    users[socket.id] = user;
    io.emit("online-users", Object.values(users));
    io.emit("system", `${user.name} is online`);
  });

  socket.on("message", (data) => {
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      io.emit("system", `${user.name} went offline`);
      delete users[socket.id];
      io.emit("online-users", Object.values(users));
    }
  });
});
