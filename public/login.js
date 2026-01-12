function login() {
  const username = document.getElementById("username").value;
  const photo = document.getElementById("photo").files[0];

  if (!username || !photo) {
    alert("Enter name and upload picture");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem("user", username);       // store username
    localStorage.setItem("photo", reader.result); // store image as Base64
    window.location.href = "/dashboard";          // go to dashboard
  };
  reader.readAsDataURL(photo);
}
