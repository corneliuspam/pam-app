const socket = io();

// ===== LOAD USER INFO =====
window.onload = () => {
  const username = localStorage.getItem("user");
  const photo = localStorage.getItem("photo");

  if (!username) {
    window.location.href = "/"; // redirect if not logged in
    return;
  }

  document.getElementById("usernameDisplay").textContent = username;
  if (photo) document.getElementById("userPic").src = photo;

  // Set status online
  document.getElementById("status").textContent = "● Online";
  document.getElementById("status").style.color = "#25d366";

  // Notify server user is online
  socket.emit("user connected", username);
};

// ===== ABOUT MODAL =====
const aboutBtn = document.getElementById("aboutBtn");
const aboutModal = document.getElementById("aboutModal");
const closeAbout = document.getElementById("closeAbout");

if (aboutBtn && aboutModal && closeAbout) {
  aboutBtn.onclick = () => { aboutModal.style.display = "flex"; };
  closeAbout.onclick = () => { aboutModal.style.display = "none"; };
  window.onclick = (e) => { if (e.target === aboutModal) aboutModal.style.display = "none"; };
}

// ===== DARK/LIGHT MODE =====
const themeToggle = document.getElementById("themeToggle");
themeToggle.onclick = () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
};

// ===== SEND MESSAGE =====
const chatContainer = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", () => {
  const msg = msgInput.value.trim();
  if (!msg) return;

  const username = localStorage.getItem("user");
  const photo = localStorage.getItem("photo");

  // Emit message to server
  socket.emit("chat message", {
    username,
    photo,
    message: msg,
    time: new Date().toLocaleTimeString()
  });

  msgInput.value = "";
});

sendBtn.addEventListener("click", () => {
  const msg = msgInput.value.trim();
  if (!msg) return;

  const username = localStorage.getItem("user");
  const photo = localStorage.getItem("photo");

  socket.emit("chat message", { username, photo, message: msg, time: new Date().toLocaleTimeString() });
  msgInput.value = "";
});

socket.on("chat message", (data) => {
  const div = document.createElement("div");
  div.classList.add(data.username === localStorage.getItem("user") ? "me" : "other");

  div.innerHTML = `
    <img src="${data.photo}" />
    <div>
      ${data.message}
      <small>${data.time}</small>
    </div>
  `;

  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
});

// ===== STATUS ONLINE/OFFLINE =====
window.addEventListener("beforeunload", () => {
  socket.emit("user disconnected", localStorage.getItem("user"));
});
