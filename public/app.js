const socket = io();
const profilePic = document.getElementById("profile-pic");
const profileName = document.getElementById("profile-name");
const profileStatus = document.getElementById("profile-status");
const usersList = document.getElementById("users-list");
const chatHeader = document.getElementById("chat-header");
const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const imageInput = document.getElementById("image-input");

let currentUser = null;
let currentChatUser = null;

async function init() {
  const res = await fetch("/api/me");
  currentUser = await res.json();
  profilePic.src = currentUser.photo;
  profileName.innerText = currentUser.name;
  profileStatus.innerText = currentUser.status;

  const usersRes = await fetch("/api/users");
  const users = await usersRes.json();
  usersList.innerHTML = "";
  users.forEach(user => {
    if(user._id === currentUser._id) return;
    const div = document.createElement("div");
    div.classList.add("user");
    div.dataset.id = user._id;
    div.innerHTML = `<img src="${user.photo}"><div>${user.name} <br><small>${user.status}</small></div><div class="online-dot"></div>`;
    div.onclick = () => openChat(user);
    usersList.appendChild(div);
  });

  socket.emit("user online", currentUser._id);
}

function openChat(user) {
  currentChatUser = user;
  chatHeader.innerText = user.name;
  chatMessages.innerHTML = "";
  loadHistory(user._id);
}

// Load chat history
async function loadHistory(userId) {
  const res = await fetch(`/api/messages?userId=${userId}`);
  const messages = await res.json();
  messages.forEach(msg => addMessage(msg, msg.from === currentUser._id ? "self" : "other"));
}

sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text && !imageInput.files[0]) return;
  const msg = { to: currentChatUser._id, text, from: currentUser._id };
  socket.emit("private message", msg);
  addMessage(msg, "self");
  messageInput.value = "";
};

imageInput.onchange = async e => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/upload", { method:"POST", body: formData });
  const data = await res.json();
  if(currentChatUser) socket.emit("private message", { to: currentChatUser._id, text:"", image: data.imageUrl, from: currentUser._id });
};

function addMessage(msg, type) {
  const div = document.createElement("div");
  div.classList.add("message", type);
  if(msg.text) div.innerText = msg.text;
  if(msg.image) {
    const img = document.createElement("img");
    img.src = msg.image;
    div.appendChild(img);
  }
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Receive messages
socket.on("private message", msg => {
  if(currentChatUser && msg.from === currentChatUser._id) addMessage(msg, "other");
});

// Online users indicator
socket.on("update online", onlineIds => {
  document.querySelectorAll(".user").forEach(div => {
    const dot = div.querySelector(".online-dot");
    dot.style.backgroundColor = onlineIds.includes(div.dataset.id) ? "green" : "gray";
  });
});

init();