/**
 * BLACKLINE — Home Page Module (index.html)
 */
BL.pages.home = function(data) {
  const { txt, htm, esc, titleCase, getSkills, getCerts, mkAvatar, computePerformanceInsights, compRankFor, seed, bindScrollHideNav } = BL;
  const students = data.students;

  // Stats
  txt("home-student-count", students.length);
  const avgSgpa = students.length ? (students.reduce((s, x) => s + x.sgpa, 0) / students.length).toFixed(2) : "0.00";
  txt("home-avg-sgpa", avgSgpa);
  const avgCgpa = students.length ? (students.reduce((s, x) => s + (x.cgpa || 0), 0) / students.length).toFixed(2) : "0.00";
  txt("home-avg-cgpa", avgCgpa);
  txt("home-session", data.meta.session);

  initHeroSearch(data);
  renderPopularTech(data);
  renderSkillSpotlight(data);
  renderStudentBody(data);
  bindHomeReveal();
  bindScrollHideNav();

  // === HERO SEARCH ===
  function initHeroSearch(data) {
    const input = document.getElementById("hero-student-search");
    const results = document.getElementById("hero-search-results");
    if (!input || !results) return;
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (!q || q.length < 2) { results.classList.remove("is-open"); results.innerHTML = ""; return; }
      const filtered = data.students.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.uid.toLowerCase().includes(q) ||
        getSkills(s).some(sk => sk.toLowerCase().includes(q))
      ).sort((a, b) => b.sgpa - a.sgpa).slice(0, 8);

      if (!filtered.length) {
        results.innerHTML = `<div class="student-search-empty">No students found.</div>`;
        results.classList.add("is-open");
        return;
      }
      results.classList.add("is-open");
      results.innerHTML = filtered.map((s, i) =>
        `<a href="profile.html?id=${esc(s.uid)}" class="student-result-card" style="animation-delay:${i * 30}ms">` +
          `<img class="avatar avatar-sm" src="${mkAvatar(titleCase(s.name), s.uid)}" alt="">` +
          `<div><p class="student-result-name">${esc(titleCase(s.name))}</p>` +
          `<p class="student-result-uid">${esc(s.uid)} | SGPA ${s.sgpa.toFixed(2)} | CGPA ${(s.cgpa||0).toFixed(2)}</p></div>` +
          `<div class="student-result-sgpa">${s.sgpa.toFixed(2)}</div>` +
        `</a>`
      ).join("");
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#hero-search-wrap")) results.classList.remove("is-open");
    });
  }

  // === POPULAR TECH (no progress bars) ===
  function renderPopularTech(data) {
    const grid = document.getElementById("popular-tech-grid");
    if (!grid) return;
    const tc = {};
    data.students.forEach(s => getSkills(s).forEach(k => { tc[k] = (tc[k]||0)+1; }));
    const topTech = Object.entries(tc).sort((a,b) => b[1]-a[1]).slice(0, 8);
    grid.innerHTML = topTech.map(([name, count], i) =>
      `<div class="popular-tech-card" style="animation-delay:${i * 40}ms">
        <p class="popular-tech-name">${esc(titleCase(name))}</p>
        <p class="popular-tech-count">${count} student${count !== 1 ? 's' : ''}</p>
      </div>`
    ).join("");
  }

  // === SKILL SPOTLIGHT (qualitative insights, no scores) ===
  function renderSkillSpotlight(data) {
    const grid = document.getElementById("skill-spotlight-grid");
    if (!grid) return;
    const sorted = [...data.students].sort((a, b) => b.sgpa - a.sgpa);
    const topSkilled = sorted
      .filter(s => s.sgpa > 0 && getCerts(s).length > 0 && getSkills(s).length > 5)
      .slice(0, 6);

    grid.innerHTML = topSkilled.map((s, i) => {
      const certs = getCerts(s);
      const skills = getSkills(s);
      const rank = compRankFor(sorted, s.uid);
      const name = titleCase(s.name);
      const domain = s.subjects[0]?.name || "General Computing";
      const ins = computePerformanceInsights(s);
      const semCount = s.semesters ? Object.keys(s.semesters).filter(k => s.semesters[k]?.sgpa > 0).length : 1;
      const expLevel = semCount >= 5 ? "Advanced" : semCount >= 3 ? "Mid-Level" : "Beginner";
      const projectCount = (s.courses || []).length + 2;

      let badgeClass = "", badgeLabel = "";
      if (rank <= 3) { badgeClass = "spotlight-badge-top"; badgeLabel = "★ Top Performer"; }
      else if (ins.momentum === "Improving") { badgeClass = "spotlight-badge-fast"; badgeLabel = "↑ Improving"; }
      else if (ins.tier === "Strong Performer" || ins.tier === "Elite Performer") { badgeClass = "spotlight-badge-consistent"; badgeLabel = "✓ Consistent"; }

      const techIcons = skills.slice(0, 4).map(sk => {
        const words = sk.split(/[\s\/]+/);
        return words.length > 1 ? words.map(w => w[0]).join("").toUpperCase() : sk.substring(0, 3).toUpperCase();
      });

      return `<a href="profile.html?id=${esc(s.uid)}" class="spotlight-card" style="animation-delay:${i * 50}ms" data-tooltip="${esc(name)} — ${esc(ins.tier)}">
        <span class="spotlight-rank">#${rank}</span>
        ${badgeLabel ? `<span class="spotlight-badge ${badgeClass}">${badgeLabel}</span>` : ""}
        <div class="spotlight-card-header">
          <img class="avatar avatar-sm" src="${mkAvatar(name, s.uid)}" alt="">
          <div>
            <p class="spotlight-card-name">${esc(name)}</p>
            <p class="spotlight-card-domain">${esc(domain)}</p>
          </div>
          <span class="spotlight-tier-pill ${ins.tierTone}">${esc(ins.tier)}</span>
        </div>
        <div class="spotlight-insights-row">
          ${ins.strengths.slice(0, 2).map(st => `<span class="spotlight-insight-tag">${esc(st)}</span>`).join("")}
          ${ins.momentum !== "Stable" ? `<span class="spotlight-insight-tag spotlight-insight-tag--${ins.momentum === 'Improving' ? 'up' : 'down'}">${esc(ins.momentum)}</span>` : ""}
        </div>
        <div class="spotlight-tech-stack">${techIcons.map(ic => `<span class="spotlight-tech-icon">${esc(ic)}</span>`).join("")}</div>
        <div class="spotlight-footer">
          <span class="spotlight-stat"><span class="spotlight-stat-value">${projectCount}</span> proj</span>
          <span class="spotlight-stat-dot"></span>
          <span class="spotlight-stat">${esc(expLevel)}</span>
          <span class="spotlight-stat-dot"></span>
          <span class="spotlight-stat"><span class="spotlight-stat-value">${certs.length}</span> cert${certs.length !== 1 ? "s" : ""}</span>
          ${certs.length > 0 ? `<span class="spotlight-stat-dot"></span><span class="spotlight-card-badges">${certs.slice(0,2).map(c => `<span class="cert-badge cert-badge-${c.badge.toLowerCase()}">${esc(c.badge)}</span>`).join("")}</span>` : ""}
        </div>
      </a>`;
    }).join("");
  }

  // === STUDENT BODY OVERVIEW ===
  function renderStudentBody(data) {
    const tabsEl = document.getElementById("semester-tabs");
    const gridEl = document.getElementById("semester-overview-grid");
    if (!tabsEl || !gridEl) return;
    const semLabels = { "1": "Sem 1", "2": "Sem 2", "3": "Sem 3", "4": "Sem 4", "5": "Sem 5", "6": "Sem 6" };
    tabsEl.innerHTML = ["1","2","3","4","5","6"].map((id, i) =>
      `<button class="semester-tab ${i === 2 ? 'is-active' : ''}" data-sem-id="${id}">${semLabels[id]}</button>`
    ).join("");

    function renderOverview(semId) {
      gridEl.classList.add("semester-content-exit");
      setTimeout(() => {
        const ss = data.students;
        const sgpas = ss.map(s => s.semesters?.[semId]?.sgpa).filter(v => v !== undefined && v > 0);
        const passed = ss.filter(s => { const rem = s.semesters?.[semId]?.remark; return rem && /PASS/i.test(rem); }).length;
        const count = sgpas.length;
        const avg = count ? (sgpas.reduce((a, b) => a + b, 0) / count).toFixed(2) : "0.00";
        const top = count ? Math.max(...sgpas).toFixed(2) : "0.00";
        const passRate = count ? Math.round(passed / ss.length * 100) : 0;
        gridEl.innerHTML = `
          <div class="semester-stat-card"><span class="semester-stat-value">${ss.length}</span><span class="semester-stat-label">Students</span></div>
          <div class="semester-stat-card"><span class="semester-stat-value">${avg}</span><span class="semester-stat-label">Avg SGPA</span></div>
          <div class="semester-stat-card"><span class="semester-stat-value">${passRate}%</span><span class="semester-stat-label">Pass Rate</span></div>
          <div class="semester-stat-card"><span class="semester-stat-value">${top}</span><span class="semester-stat-label">Top SGPA</span></div>
        `;
        gridEl.classList.remove("semester-content-exit");
        gridEl.classList.add("semester-content-enter");
        gridEl.addEventListener("animationend", () => gridEl.classList.remove("semester-content-enter"), { once: true });
      }, 130);
    }
    renderOverview("3");
    tabsEl.addEventListener("click", e => {
      const btn = e.target.closest(".semester-tab");
      if (!btn || btn.classList.contains("is-active")) return;
      tabsEl.querySelectorAll(".semester-tab").forEach(t => t.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderOverview(btn.dataset.semId);
    });
  }

  function bindHomeReveal() {
    const obs = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
    }), { threshold: .1 });
    document.querySelectorAll(".home-section, .home-hero, .home-footer").forEach(el => obs.observe(el));
  }
};
