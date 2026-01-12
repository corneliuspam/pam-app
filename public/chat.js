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
    <img class="avatar" src="${data.photo}" data-status="Online"/>
    <div class="bubble">
      <span data-username="${data.username}">${data.message}</span>
      <small class="time">${data.time}</small>
    </div>
  `;

  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

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

// ===== PROFILE MODAL =====
(function() {
  const profileModal = document.getElementById("profileModal");
  const profileName = document.getElementById("profileName");
  const profilePicLarge = document.getElementById("profilePicLarge");
  const profileStatus = document.getElementById("profileStatus");
  const closeProfile = document.getElementById("closeProfile");

  // Close modal safely
  closeProfile.addEventListener("click", () => profileModal.style.display = "none");
  window.addEventListener("click", e => {
    if (e.target === profileModal) profileModal.style.display = "none";
  });

  // Safe click listener for avatars
  chatContainer.addEventListener("click", (e) => {
    const avatar = e.target.closest(".avatar");
    if (!avatar) return; // ignore other clicks

    const bubble = avatar.closest(".me, .other")?.querySelector(".bubble span");
    if (!bubble) return;

    const username = bubble.dataset.username || bubble.textContent;
    const photoSrc = avatar.src;
    const status = avatar.dataset.status || "Online";

    // Populate modal
    profilePicLarge.src = photoSrc;
    profileName.textContent = username;
    profileStatus.textContent = status;

    profileModal.style.display = "flex";
  });
})();
