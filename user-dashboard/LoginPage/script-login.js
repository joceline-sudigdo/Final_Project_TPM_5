const togglePass = document.getElementById("togglePass");
const passwordInput = document.getElementById("password");

togglePass.addEventListener("click", function () {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  this.style.opacity = type === "text" ? "0.6" : "1";
});

const form = document.getElementById("loginForm");
const teamGroup = document.getElementById("teamGroup");
const passGroup = document.getElementById("passGroup");
const teamInput = document.getElementById("teamName");
const passInput = document.getElementById("password");
const generalError = document.getElementById("generalError");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  let isValid = true;

  teamGroup.classList.remove("has-error");
  passGroup.classList.remove("has-error");
  generalError.style.display = "none";

  if (teamInput.value.trim() === "") {
    teamGroup.classList.add("has-error");
    isValid = false;
  }

  if (passInput.value.trim() === "") {
    passGroup.classList.add("has-error");
    isValid = false;
  }

  if (!isValid) {
    generalError.style.display = "block";
  } else {
    alert("Login Successful! Redirecting...");
  }
});
