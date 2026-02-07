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

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  let isValid = true;

  teamGroup.classList.remove("has-error");
  passGroup.classList.remove("has-error");
  generalError.style.display = "none";
  generalError.innerText = "Invalid credentials. Please try again."; // Default error

  if (teamInput.value.trim() === "") {
    teamGroup.classList.add("has-error");
    isValid = false;
  }

  if (passInput.value.trim() === "") {
    passGroup.classList.add("has-error");
    isValid = false;
  }

  if (isValid) {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          team_name: teamInput.value.trim(),
          password: passInput.value
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        localStorage.setItem('teamToken', data.token); //Store token
        localStorage.setItem('team_name', teamInput.value.trim());
        alert("Login Successful! Redirecting...");
        window.location.href = "../../TeamDashboard/index.html"; // URL encoded for spaces
      } else {
        // Login failed
        generalError.innerText = data.error || "Login failed";
        generalError.style.display = "block";
      }
    } catch (error) {
      console.error("Error logging in:", error);
      generalError.innerText = "Network error. Please ensure the backend server is running on port 3000.";
      generalError.style.display = "block";
    }
  }
});
