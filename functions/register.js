const API_URL = "YOUR_CLOUDFLARE_API_URL"; // Guna Environment variable bila deploy

const registerForm = document.getElementById("registerForm");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const strengthBar = document.getElementById("strengthBar");
const passwordError = document.getElementById("passwordError");

// Password strength
function checkStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  return score;
}

password.addEventListener("input", () => {
  const score = checkStrength(password.value);
  if (score <= 1) { strengthBar.style.width = "25%"; strengthBar.style.background = "red"; }
  else if (score === 2) { strengthBar.style.width = "50%"; strengthBar.style.background = "orange"; }
  else { strengthBar.style.width = "100%"; strengthBar.style.background = "green"; }
});

// Toggle password eye icon
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = icon.previousElementSibling;
    const svg = icon.querySelector("svg");

    if (input.type === "password") {
      input.type = "text";
      svg.innerHTML = `
        <path d="M17.94 17.94L6.06 6.06M1 1l22 22"></path>
        <circle cx="12" cy="12" r="3"></circle>
      `;
    } else {
      input.type = "password";
      svg.innerHTML = `
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"></path>
      `;
    }
  });
});

// Submit
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();

  if (!email.endsWith("@moe.gov.my") && !email.endsWith("@moe.edu.my")) {
    passwordError.textContent = "Emel mesti berakhir dengan @moe.gov.my atau @moe.edu.my";
    passwordError.style.display = "block";
    return;
  }

  if (password.value !== confirmPassword.value) {
    passwordError.textContent = "Kata laluan dan pengesahan tidak sepadan.";
    passwordError.style.display = "block";
    return;
  }

  if (checkStrength(password.value) < 3) {
    passwordError.textContent = "Kata laluan terlalu lemah.";
    passwordError.style.display = "block";
    return;
  }

  passwordError.style.display = "none";

  const data = {
    fullname: document.getElementById("fullname").value.trim(),
    position: document.getElementById("position").value,
    section: document.getElementById("section").value,
    email,
    password: password.value
  };

  try {
    const res = await fetch(API_URL + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
      alert("Pendaftaran berjaya! Anda boleh log masuk sekarang.");
      window.location.href = "login.html";
    } else {
      alert("Pendaftaran gagal: " + result.error);
    }

  } catch (err) {
    alert("Ralat server. Sila cuba lagi.");
    console.error(err);
  }
});