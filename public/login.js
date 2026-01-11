function login() {
  const username = document.getElementById("username").value.trim();
  const file = document.getElementById("avatar").files[0];

  if (!username) {
    alert("Enter a username");
    return;
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("pam_avatar", reader.result);
      saveUser(username);
    };
    reader.readAsDataURL(file);
  } else {
    saveUser(username);
  }
}

function saveUser(username) {
  localStorage.setItem("pam_user", username);
  window.location.href = "/dashboard";
}
