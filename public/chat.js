const socket = io();

const name = localStorage.getItem("pam_user");
const avatar = localStorage.getItem("pam_avatar");

if (!name) location.href = "/";

document.getElementById("usernameLabel").innerText = name;

if (avatar) {
  document.getElementById("avatarImg").src = avatar;
} else {
  document.getElementById("avatarImg").src =
    "https://ui-avatars.com/api/?name=" + name;
}

socket.emit("join", { name, avatar });

socket.on("message", (data) => {
  addMessage(data);
});

socket.on("system", (msg) => {
  const div = document.createElement("div");
  div.className = "system";
  div.innerText = msg;
  messages.appendChild(div);
});

socket.on("online-users", (users) => {
  document.getElementById("statusText").innerText =
    "Online users: " + users.length;
});

function sendMessage() {
  const input = document.getElementById("msg");
  if (!input.value.trim()) return;

  socket.emit("message", {
    name,
    avatar,
    text: input.value
  });

  input.value = "";
}

function addMessage(data) {
  const div = document.createElement("div");
  div.className = "message " + (data.name === name ? "me" : "other");

  const img = document.createElement("img");
  img.src = data.avatar || "https://ui-avatars.com/api/?name=" + data.name;

  const span = document.createElement("span");
  span.innerText =
    data.name === name ? data.text : `${data.name}: ${data.text}`;

  div.appendChild(img);
  div.appendChild(span);

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
