const socket = io();

// Auto-generate username
let username = localStorage.getItem("pamUser");
if (!username) {
  username = "Guest_" + Math.floor(Math.random() * 10000);
  localStorage.setItem("pamUser", username);
}

// Elements
const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");
const status = document.getElementById("status");

// Join chat
socket.emit("join", username);

// Send message
sendBtn.addEventListener("click", () => {
  if (!input.value.trim()) return;
  socket.emit("chatMessage", { user: username, message: input.value });
  input.value = "";
});

// Send on Enter key
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// Receive message
socket.on("chatMessage", (data) => {
  const div = document.createElement("div");
  div.className = data.user === username ? "me" : "other";
  div.innerHTML = `<b>${data.user}</b><br>${data.message}<br><small>${data.time}</small>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

// Online status
socket.on("online", (users) => {
  status.textContent = users.includes(username) ? "● Online" : "● Offline";
});

// Dark mode
const darkBtn = document.getElementById("darkBtn");
darkBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark", document.body.classList.contains("dark"));
});
if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
}
