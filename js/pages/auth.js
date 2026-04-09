/**
 * BLACKLINE — Auth Page Module (login.html)
 */
BL.pages.login = function(data) {
  const { txt, esc, titleCase, getSkills, clearSession, saveSession, feedback, clearFb, nav } = BL;
  clearSession();
  const students = data.students;

  txt("login-student-count", students.length);
  txt("login-session-label", data.meta.session);
  txt("login-semester-label", data.meta.semesterLabel);

  // Top Skills Among Students (no progress bars)
  const el = document.getElementById("top-skills-list");
  if (el) {
    const skillMap = {};
    students.forEach(s => {
      getSkills(s).forEach(sk => { skillMap[sk] = (skillMap[sk] || 0) + 1; });
    });
    const topSkills = Object.entries(skillMap).sort((a,b) => b[1] - a[1]).slice(0, 8);
    el.innerHTML = topSkills.map(([skill, count], i) =>
      `<article class="top-skill-item" style="animation-delay:${i * 40}ms">
        <span class="top-skill-rank">${String(i+1).padStart(2,"0")}</span>
        <div class="top-skill-info">
          <p class="top-skill-name">${esc(titleCase(skill))}</p>
          <p class="top-skill-meta">${count} student${count !== 1 ? 's' : ''}</p>
        </div>
        <span class="top-skill-count">${count}</span>
      </article>`
    ).join("");
  }

  // Password toggle
  const toggle = document.getElementById("password-toggle");
  const passInput = document.getElementById("login-password");
  if (toggle && passInput) {
    toggle.addEventListener("click", () => {
      const isPass = passInput.type === "password";
      passInput.type = isPass ? "text" : "password";
      toggle.querySelector(".eye-icon").textContent = isPass ? "Hide" : "Show";
    });
  }

  // Login form
  const form = document.getElementById("login-form");
  const uid = document.getElementById("login-id");
  const pw = document.getElementById("login-password");
  const btn = document.getElementById("login-submit");
  const fb = document.getElementById("login-feedback");

  uid.addEventListener("input", () => { uid.value = uid.value.toUpperCase(); clearFb(fb); });
  pw.addEventListener("input", () => clearFb(fb));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const u = uid.value.trim().toUpperCase(), p = pw.value;
    const s = students.find(s => s.loginId.toUpperCase() === u && s.password === p);
    if (!s) { feedback(fb, "Invalid UID or password.", "error"); form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake"); return; }
    btn.disabled = true; btn.classList.add("is-loading");
    btn.querySelector(".btn-text").textContent = "Signing In…";
    saveSession(s.uid);
    feedback(fb, "Success. Opening dashboard…", "success");
    setTimeout(() => nav("dashboard.html"), 500);
  });
};
