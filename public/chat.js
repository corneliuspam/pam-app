// ===============================
// PAM APP – CHAT.JS (SAFE VERSION)
// ===============================

// Connect to socket.io
const socket = io();

// Elements
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Get username (fallback to Guest)
let username = localStorage.getItem("pam_username");
if (!username) {
  username = "Guest_" + Math.floor(Math.random() * 1000);
  localStorage.setItem("pam_username", username);
}

// Show username in header if element exists
const usernameEl = document.getElementById("username");
if (usernameEl) {
  usernameEl.textContent = username;
}

// ===============================
// SEND MESSAGE
// ===============================
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  socket.emit("chatMessage", {
    user: username,
    message: text,
  });

  messageInput.value = "";
}

// Button click
if (sendBtn) {
  sendBtn.addEventListener("click", sendMessage);
}

// Enter key
if (messageInput) {
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

// ===============================
// RECEIVE MESSAGE
// ===============================
socket.on("chatMessage", (data) => {
  if (!chatBox) return;

  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");

  if (data.user === username) {
    msgDiv.classList.add("you");
  }

  msgDiv.innerHTML = `<strong>${data.user}:</strong><br>${data.message}`;
  chatBox.appendChild(msgDiv);

  // Auto scroll
  chatBox.scrollTop = chatBox.scrollHeight;
});

// ===============================
// ABOUT MODAL (SAFE VERSION)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const infoBtn = document.getElementById("infoBtn");
  const infoModal = document.getElementById("infoModal");
  const closeModal = document.getElementById("closeModal");

  if (!infoBtn || !infoModal || !closeModal) {
    console.warn("About modal elements missing");
    return;
  }

  infoBtn.addEventListener("click", () => {
    infoModal.style.display = "block";
  });

  closeModal.addEventListener("click", () => {
    infoModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === infoModal) {
      infoModal.style.display = "none";
    }
  });
});

// ===============================
// CONNECTION STATUS (OPTIONAL)
// ===============================
socket.on("connect", () => {
  console.log("Connected to PAM server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
