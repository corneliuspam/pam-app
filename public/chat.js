const socket = io();
const username = localStorage.getItem("pam_user");

if (!username) {
  window.location.href = "/";
}

socket.emit("join", username);

socket.on("message", (data) => {
  addMessage(`${data.user}: ${data.text}`);
});

socket.on("system", (msg) => {
  addMessage(`🔔 ${msg}`);
});

function sendMessage() {
  const msg = document.getElementById("msg").value;
  if (!msg) return;

  socket.emit("message", { user: username, text: msg });
  document.getElementById("msg").value = "";
}

function addMessage(text) {
  const div = document.createElement("div");
  div.textContent = text;
  document.getElementById("messages").appendChild(div);
}
