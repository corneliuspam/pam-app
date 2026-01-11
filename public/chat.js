const socket = io();

let username = localStorage.getItem("pam_username") || "Guest_" + Math.floor(Math.random()*999);
localStorage.setItem("pam_username", username);

document.getElementById("username").innerText = username;

socket.emit("join", username);

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("messageInput");

// Send message
function sendMessage() {
  if (!input.value.trim()) return;

  socket.emit("chatMessage", {
    user: username,
    message: input.value
  });
  input.value = "";
}

document.getElementById("sendBtn").onclick = sendMessage;

// Receive message
socket.on("chatMessage", (data) => {
  const div = document.createElement("div");
  div.className = "message";

  div.innerHTML = `
    <strong>${data.user}</strong>
    <small>${data.time}</small><br>
    ${data.message}
    <div class="reactions">
      <span onclick="react('❤️')">❤️</span>
      <span onclick="react('👍')">👍</span>
      <span onclick="react('😂')">😂</span>
    </div>
  `;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Reactions
function react(emoji) {
  socket.emit("reaction", { emoji });
}

socket.on("reaction", (data) => {
  chatBox.innerHTML += `<div>${data.emoji}</div>`;
});

// Online status
socket.on("status", (users) => {
  document.querySelector(".status").innerText =
    users[username] ? "Online" : "Offline";
});

// Dark mode
document.getElementById("darkToggle").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark", document.body.classList.contains("dark"));
};

if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
}

// Profile upload
document.getElementById("avatarInput").onchange = async (e) => {
  const form = new FormData();
  form.append("avatar", e.target.files[0]);

  const res = await fetch("/upload", { method: "POST", body: form });
  const data = await res.json();
  document.getElementById("avatar").src = data.image;
};
