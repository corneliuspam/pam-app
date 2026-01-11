const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fileUpload = require("express-fileupload");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const usersOnline = {};

// Upload profile picture
app.post("/upload", (req, res) => {
  if (!req.files) return res.status(400).send("No file");

  const file = req.files.avatar;
  const name = Date.now() + "_" + file.name;
  file.mv(path.join(__dirname, "uploads", name));

  res.json({ image: "/uploads/" + name });
});

// Socket.io
io.on("connection", (socket) => {
  socket.on("join", (username) => {
    usersOnline[username] = true;
    io.emit("status", usersOnline);
  });

  socket.on("disconnect", () => {
    for (let user in usersOnline) {
      if (usersOnline[user]) delete usersOnline[user];
    }
    io.emit("status", usersOnline);
  });

  socket.on("chatMessage", (data) => {
    io.emit("chatMessage", {
      ...data,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("reaction", (data) => {
    io.emit("reaction", data);
  });
});

server.listen(process.env.PORT || 3000, () =>
  console.log("PAM App running")
);
