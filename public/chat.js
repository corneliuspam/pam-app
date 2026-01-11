const socket = io();
const username = localStorage.getItem("pam_user");

if (!username) location.href = "/";

document.getElementById("profile").innerText =
  username.charAt(0).toUpperCase();

socket.emit("join", username);

socket.on("message", (data) => {
  addMessage(data.user, data.text);
});

socket.on("system", (msg) => {
  const div = document.createElement("div");
  div.className = "system";
  div.innerText = msg;
  messages.appendChild(div);
});

function sendMessage() {
  const input = document.getElementById("msg");
  if (!input.value.trim()) return;

  socket.emit("message", {
    user: username,
    text: input.value
  });

  input.value = "";
}

function addMessage(user, text) {
  const div = document.createElement("div");
  div.className = "message " + (user === username ? "me" : "other");
  div.innerText = user === username ? text : `${user}: ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
