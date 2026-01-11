const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const profilePic = document.getElementById("profilePic").files[0];

  if (!username && !phone) return alert("Enter username or phone");

  const formData = new FormData();
  formData.append("username", username);
  formData.append("phone", phone);
  if (profilePic) formData.append("profilePic", profilePic);

  const res = await fetch("/login", { method: "POST", body: formData });
  const data = await res.json();

  if (data.success) {
    localStorage.setItem("pamUser", JSON.stringify(data.user));
    window.location.href = "/dashboard";
  }
});
