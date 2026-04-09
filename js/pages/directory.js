/**
 * BLACKLINE — Directory Page Module (students.html)
 */
BL.pages.students = function(data) {
  const { txt, esc, ea, titleCase, getSkills, getCerts, mkAvatar, bindScrollHideNav } = BL;
  const students = data.students;
  txt("dir-total-count", students.length);

  let activeFilter = "all";
  let activeSubFilter = null;
  let searchQuery = "";
  const PAGE_SIZE = 12;
  let displayCount = PAGE_SIZE;

  function getFiltered() {
    let list = [...students];
    if (activeFilter === "semester" && activeSubFilter) {
      list = list.filter(s => s.semesters?.[activeSubFilter]?.sgpa !== undefined);
    } else if (activeFilter === "skill" && activeSubFilter) {
      list = list.filter(s => getSkills(s).some(sk => sk.toLowerCase() === activeSubFilter.toLowerCase()));
    } else if (activeFilter === "cert" && activeSubFilter) {
      list = list.filter(s => getCerts(s).some(c => c.badge.toLowerCase() === activeSubFilter.toLowerCase()));
    }
    if (searchQuery) {
      list = list.filter(s =>
        s.name.toLowerCase().includes(searchQuery) ||
        s.uid.toLowerCase().includes(searchQuery) ||
        getSkills(s).some(sk => sk.toLowerCase().includes(searchQuery))
      );
    }
    return list.sort((a, b) => b.sgpa - a.sgpa);
  }

  function renderCards() {
    const filtered = getFiltered();
    const showing = filtered.slice(0, displayCount);
    const grid = document.getElementById("dir-card-grid");
    const summary = document.getElementById("dir-results-count");
    const filterLabel = document.getElementById("dir-active-filter");
    const loadMore = document.getElementById("dir-load-more");
    summary.textContent = `${filtered.length} student${filtered.length !== 1 ? 's' : ''}`;
    filterLabel.textContent = activeSubFilter ? `· ${activeSubFilter}` : "";
    grid.innerHTML = showing.map((s, i) => {
      const skills = getSkills(s).slice(0, 3);
      const certs = getCerts(s);
      return `<a href="profile.html?id=${esc(s.uid)}" class="dir-student-card" style="animation-delay:${(i % PAGE_SIZE) * 30}ms">
        <div class="dir-card-top">
          <img class="dir-card-avatar" src="${mkAvatar(titleCase(s.name), s.uid)}" alt="">
          <div><p class="dir-card-name">${esc(titleCase(s.name))}</p><p class="dir-card-uid">${esc(s.uid)}</p></div>
        </div>
        <div class="dir-card-badges">
          <span class="dir-card-semester-badge">Sem ${data.meta.semesterLabel.charAt(0)}</span>
          ${certs.slice(0, 2).map(c => `<span class="cert-badge cert-badge-${c.badge.toLowerCase()}">${esc(c.badge)}</span>`).join("")}
        </div>
        <div class="dir-card-skills">${skills.map(sk => `<span class="dir-card-skill">${esc(sk)}</span>`).join("")}</div>
        <div class="dir-card-bottom">
          <span class="dir-card-sgpa">CGPA ${(s.cgpa||0).toFixed(2)}</span>
          <span class="dir-card-link">View Profile →</span>
        </div>
      </a>`;
    }).join("");
    if (displayCount >= filtered.length) loadMore.classList.add("is-hidden");
    else loadMore.classList.remove("is-hidden");
  }

  function renderSubFilters() {
    const subEl = document.getElementById("dir-sub-filters");
    if (activeFilter === "semester") {
      subEl.innerHTML = ["1","2","3","4","5","6"].map(id =>
        `<button class="sub-filter-pill ${activeSubFilter === id ? 'is-active' : ''}" data-sub="${id}">Semester ${id}</button>`
      ).join("");
    } else if (activeFilter === "skill") {
      const sc = {};
      students.forEach(s => getSkills(s).forEach(sk => { sc[sk] = (sc[sk]||0)+1; }));
      const top = Object.entries(sc).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([sk])=>sk);
      subEl.innerHTML = top.map(sk => `<button class="sub-filter-pill ${activeSubFilter===sk?'is-active':''}" data-sub="${ea(sk)}">${esc(sk)}</button>`).join("");
    } else if (activeFilter === "cert") {
      const cb = {};
      students.forEach(s => getCerts(s).forEach(c => { cb[c.badge]=(cb[c.badge]||0)+1; }));
      subEl.innerHTML = Object.entries(cb).sort((a,b)=>b[1]-a[1]).map(([b])=>`<button class="sub-filter-pill ${activeSubFilter===b?'is-active':''}" data-sub="${ea(b)}">${esc(b)}</button>`).join("");
    } else {
      subEl.innerHTML = "";
    }
  }

  document.getElementById("dir-filter-tabs").addEventListener("click", e => {
    const btn = e.target.closest(".filter-tab");
    if (!btn) return;
    document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeFilter = btn.dataset.filter;
    activeSubFilter = null;
    displayCount = PAGE_SIZE;
    renderSubFilters(); renderCards();
  });

  document.getElementById("dir-sub-filters").addEventListener("click", e => {
    const btn = e.target.closest(".sub-filter-pill");
    if (!btn) return;
    const val = btn.dataset.sub;
    activeSubFilter = activeSubFilter === val ? null : val;
    displayCount = PAGE_SIZE;
    renderSubFilters(); renderCards();
  });

  document.getElementById("dir-search").addEventListener("input", e => {
    searchQuery = e.target.value.trim().toLowerCase();
    displayCount = PAGE_SIZE;
    renderCards();
  });

  document.getElementById("dir-load-more-btn").addEventListener("click", () => {
    displayCount += PAGE_SIZE;
    renderCards();
  });

  renderSubFilters(); renderCards();
  bindScrollHideNav();
};
