const socket = io({
  transports: ["websocket"]
});

// Load user info
window.onload = () => {
  const username = localStorage.getItem("user");
  const photo = localStorage.getItem("photo");

  if (!username) return window.location.href = "/";

  document.getElementById("usernameDisplay").textContent = username;
  if (photo) document.getElementById("userPic").src = photo;
  document.getElementById("status").textContent = "● Online";
  document.getElementById("status").style.color = "#25d366";
};

// About modal
const aboutBtn = document.getElementById("aboutBtn");
const aboutModal = document.getElementById("aboutModal");
const closeAbout = document.getElementById("closeAbout");

aboutBtn.onclick = () => { aboutModal.style.display = "flex"; };
closeAbout.onclick = () => { aboutModal.style.display = "none"; };
window.onclick = e => { if(e.target===aboutModal) aboutModal.style.display="none"; };

// Dark/light mode
const themeToggle = document.getElementById("themeToggle");
themeToggle.onclick = () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
};

// Chat functionality
const chatContainer = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keyup", e => { if(e.key==="Enter") sendMessage(); });

function sendMessage() {
  const msg = msgInput.value.trim();
  if (!msg) return;

  const data = {
    username: localStorage.getItem("user"),
    photo: localStorage.getItem("photo"),
    message: msg,
    time: new Date().toLocaleTimeString()
  };

  // ✅ SHOW MESSAGE INSTANTLY (no delay)
  renderMessage(data, true);

  // Send to server
  socket.emit("chat message", data);

  msgInput.value = "";
}

  const username = localStorage.getItem("user");
  const photo = localStorage.getItem("photo");

  socket.emit("chat message", {
    username, photo, message: msg, time: new Date().toLocaleTimeString()
  });

  msgInput.value = "";
}

// Receive messages
socket.on("chat message", (data) => {
  const wrapper = document.createElement("div");
  wrapper.className = data.username === localStorage.getItem("user") ? "me" : "other";

  wrapper.innerHTML = `
    <img class="avatar" src="${localStorage.getItem("photo")}" />
    <div class="bubble">
      <span class="msgText">${data.message}</span>
      <small class="time">${data.time}</small>
    </div>
  `;

  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
});

function renderMessage(data, isMe = false) {
  const wrapper = document.createElement("div");
  wrapper.className = isMe ? "me" : "other";

  wrapper.innerHTML = `
    <img class="avatar" src="${localStorage.getItem("photo")}" />
    <div class="bubble">
      <span>${data.message}</span>
      <small class="time">${data.time}</small>
    </div>
  `;

  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
