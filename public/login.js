function login() {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Enter a username or phone number");
    return;
  }

  localStorage.setItem("pam_user", username);
  window.location.href = "/dashboard";
}
