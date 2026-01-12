const socket = io();

let user = JSON.parse(localStorage.getItem("pamUser"));
if (!user) location.href = "/";

document.getElementById("userPic").src = user.profile || "https://via.placeholder.com/40";
document.getElementById("usernameDisplay").textContent = user.username;

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");
const status = document.getElementById("status");

// JOIN
socket.emit("join", user.username);

// SEND MESSAGE
sendBtn.addEventListener("click", () => {
  if (!input.value.trim()) return;
  socket.emit("chatMessage", { user: user.username, profile: user.profile, message: input.value });
  input.value = "";
});
input.addEventListener("keydown", e => { if (e.key==="Enter") sendBtn.click(); });

// RECEIVE
socket.on("chatMessage", data => {
  const div = document.createElement("div");
  div.className = data.user===user.username?"me":"other";
  div.innerHTML=`
    <img src="${data.profile||'https://via.placeholder.com/30'}">
    <div>
      <b>${data.user}</b><br>${data.message}<br>
      <small>${data.time}</small>
    </div>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

// ONLINE
socket.on("online", users => {
  status.textContent = users.includes(user.username) ? "● Online" : "● Offline";
});

// DARK MODE TOGGLE
const toggle = document.getElementById("themeToggle");

toggle.onclick = () => {
  document.body.classList.toggle("light");
  toggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
};

// ===== ABOUT MODAL =====
const aboutBtn = document.getElementById("aboutBtn");
const aboutModal = document.getElementById("aboutModal");
const closeAbout = document.getElementById("closeAbout");

if (aboutBtn && aboutModal && closeAbout) {
  aboutBtn.onclick = () => {
    aboutModal.style.display = "flex"; // show modal
  };

  closeAbout.onclick = () => {
    aboutModal.style.display = "none"; // hide modal
  };

  // Optional: click outside modal to close
  window.onclick = (e) => {
    if (e.target === aboutModal) {
      aboutModal.style.display = "none";
    }
  };
}
