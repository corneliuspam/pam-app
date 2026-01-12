// ===== SOCKET CONNECTION =====
const socket = io({
  transports: ["websocket"]
});

// ===== DOM ELEMENTS =====
const chatContainer = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");
const themeToggle = document.getElementById("themeToggle");
const aboutBtn = document.getElementById("aboutBtn");
const aboutModal = document.getElementById("aboutModal");
const closeAbout = document.getElementById("closeAbout");

// ===== USER DATA =====
const username = localStorage.getItem("user");
const photo = localStorage.getItem("photo");

// ===== SAFETY CHECK =====
if (!username) {
  window.location.href = "/";
}

// ===== INITIAL LOAD =====
window.addEventListener("load", () => {
  document.getElementById("usernameDisplay").textContent = username;
  document.getElementById("userPic").src = photo;
  document.getElementById("status").textContent = "● Online";
});

// ===== MESSAGE RENDER FUNCTION =====
function renderMessage(data, isMe) {
  const wrapper = document.createElement("div");
  wrapper.className = isMe ? "me" : "other";

  wrapper.innerHTML = `
    <img class="avatar" src="${photo}" />
    <div class="bubble">
      <span>${data.message}</span>
      <small class="time">${data.time}</small>
    </div>
  `;

  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ===== SEND MESSAGE =====
function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  const data = {
    username,
    message: text,
    time: new Date().toLocaleTimeString()
  };

  // ✅ Show instantly
  renderMessage(data, true);

  // Send to server
  socket.emit("chat message", data);

  msgInput.value = "";
}

// ===== EVENTS =====
sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ===== RECEIVE MESSAGE =====
socket.on("chat message", (data) => {
  // Prevent duplicate self-message
  if (data.username === username) return;

  renderMessage(data, false);
});

// ===== DARK MODE =====
themeToggle.onclick = () => {
  document.body.classList.toggle("light");
};

// ===== ABOUT MODAL =====
aboutBtn.onclick = () => {
  aboutModal.style.display = "flex";
};
closeAbout.onclick = () => {
  aboutModal.style.display = "none";
};
window.onclick = (e) => {
  if (e.target === aboutModal) aboutModal.style.display = "none";
};

// Profile Modal Elements
const profileModal = document.getElementById("profileModal");
const profileName = document.getElementById("profileName");
const profilePicLarge = document.getElementById("profilePicLarge");
const profileStatus = document.getElementById("profileStatus");
const closeProfile = document.getElementById("closeProfile");

// Open modal when clicking avatar
document.getElementById("userPic").addEventListener("click", () => {
  profilePicLarge.src = localStorage.getItem("photo");
  profileName.textContent = localStorage.getItem("user");
  profileStatus.textContent = "Online"; // you can use your online/offline logic here
  profileModal.style.display = "flex";
});

// Close modal
closeProfile.addEventListener("click", () => {
  profileModal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === profileModal) profileModal.style.display = "none";
});

// ===== PROFILE BIO (SAFE FEATURE) =====
(function () {
  const bioText = document.getElementById("profileBio");
  const editBtn = document.getElementById("editBioBtn");
  const bioEditor = document.getElementById("bioEditor");
  const bioInput = document.getElementById("bioInput");
  const saveBio = document.getElementById("saveBioBtn");

  if (!bioText || !editBtn) return; // safety guard

  // Load bio
  const savedBio = localStorage.getItem("profileBio") || "Hey there! I am using PAM App.";
  bioText.textContent = savedBio;

  editBtn.onclick = () => {
    bioEditor.style.display = "block";
    bioInput.value = bioText.textContent;
  };

  saveBio.onclick = () => {
    const bio = bioInput.value.trim() || "Hey there! I am using PAM App.";
    localStorage.setItem("profileBio", bio);
    bioText.textContent = bio;
    bioEditor.style.display = "none";
  };
})();

// ===== EMOJI PICKER =====
(function () {
  const picker = document.querySelector(".emoji-picker");
  const input = document.getElementById("messageInput");
  if (!picker || !input) return;

  picker.querySelectorAll("span, text").forEach(emoji => {
    emoji.addEventListener("click", () => {
      input.value += emoji.textContent; // append emoji to input
      input.focus();
    });
  });
})();
