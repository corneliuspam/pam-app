function login() {
  const username = document.getElementById("username").value;
  const photo = document.getElementById("photo").files[0];

  if (!username || !photo) {
    alert("Enter name and upload picture");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem("user", username);
    localStorage.setItem("photo", reader.result);
    window.location.href = "/dashboard";
  };
  reader.readAsDataURL(photo);
}
