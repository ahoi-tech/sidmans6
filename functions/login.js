// ===============================
// SET API URL WORKER / CLOUDFLARE ROUTE
// ===============================
const API_URL = "https://YOUR_WORKER_DOMAIN.workers.dev"; 
// contoh: https://ptis-api.tyourname.workers.dev

// Dapatkan elemen
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

// Submit login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email.endsWith("@moe.gov.my") && !email.endsWith("@moe.edu.my")) {
    alert("Emel log masuk mesti berakhir dengan @moe.gov.my atau @moe.edu.my");
    return;
  }

  try {
    const res = await fetch(API_URL + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();

    if (result.success) {
      sessionStorage.setItem("userSection", result.section);
      window.location.href = "dashboard.html";
    } else {
      alert("Log masuk gagal: " + result.error);
    }
  } catch (err) {
    alert("Ralat server. Sila cuba lagi.");
    console.error(err);
  }
});

// ===============================
// TOGGLE PASSWORD
// ===============================
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const targetId = icon.getAttribute("data-target");
    const input = document.getElementById(targetId);
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