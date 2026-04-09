/**
 * BLACKLINE — Dashboard Module (dashboard.html)
 * Hash-based SPA with: profile, academic, skills, projects, courses, settings
 * All progress bars and emoji icons removed.
 */
BL.pages.dashboard = function(data) {
  const {
    txt, htm, attr, val, esc, ea, eav, titleCase,
    getSession, clearSession, getEdits, saveEdits, clearEdits, clean,
    mkCourses, mkModel, computePerformanceInsights, compRankFor, animatedSemSwitch,
    feedback, clearFb, readFile, mkAvatar, getSkills, getCerts, getStatusNote,
    nav, tone, bindScrollHideNav
  } = BL;

  const session = getSession();
  const student = session ? data.students.find(s => s.uid === session.uid) : null;
  if (!student) { window.location.replace("login.html"); return; }

  const state = mkState(data, student);
  
  const profileLink = document.getElementById("nav-profile-link");
  if (profileLink && session) {
    profileLink.href = `profile.html?id=${session.uid}`;
  }
  
  renderAll(state);
  populateEditor(state);
  bindInteractions(state);
  bindSpaRouter();
  bindMobileNav();
  const hash = location.hash.replace("#", "");
  if (hash) switchPage(hash);

  // === STATE ===
  function mkState(data, student) {
    const edits = getEdits(student.uid), courses = mkCourses(student);
    const sorted = [...data.students].sort((a, b) => b.sgpa - a.sgpa);
    const rank = compRankFor(sorted, student.uid);
    return { data, student, edits, model: mkModel(student, data.meta, courses, rank, edits), pendingAvatar: edits.avatarDataUrl || null };
  }

  // === RENDER ALL ===
  function renderAll(st) {
    renderHeader(st.model);
    renderHeroDash(st.model);
    renderPerformanceInsights(st.model);
    renderProfileDash(st.model, st.edits);
    renderAcademic(st.model, st.student, st.data);
    renderSkillsDash(st.model);
    renderProjectsDash(st.model);
    renderCoursesDash(st.model);
  }

  function renderHeader(m) {
    attr("header-avatar", "src", m.avatarUrl);
    txt("header-name", m.displayName);
    txt("header-meta", `${m.uid} | ${m.semesterLabel}`);
  }

  function renderHeroDash(m) {
    const h = new Date().getHours(), g = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    txt("hero-title", `${g}, ${m.displayName}`);
    txt("hero-description", `${m.program}, ${m.session}. Focus: ${m.learningFocus}.`);
    htm("hero-metrics", [
      { l: "Latest SGPA", v: m.sgpa.toFixed(2), t: `Remark: ${m.remark}` },
      { l: "CGPA", v: m.cgpa.toFixed(2), t: "Cumulative GPA" },
      { l: "Rank", v: `#${m.rank}`, t: "Class Rank" }
    ].map(x => `<article class="metric-card interactive-surface is-compact"><span class="metric-label">${esc(x.l)}</span><strong class="metric-value">${esc(x.v)}</strong><p class="metric-trend">${esc(x.t)}</p></article>`).join(""));
    txt("search-summary", "Search subjects, skills, projects, or certifications.");
  }

  // === PERFORMANCE INSIGHTS (qualitative, text-based) ===
  function renderPerformanceInsights(m) {
    const el = document.getElementById("performance-breakdown");
    if (!el) return;
    const ins = m.insights;

    // Momentum icon
    const momentumIcon = ins.momentum === "Improving" ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
      : ins.momentum === "Needs Focus" ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

    const momentumTone = ins.momentum === "Improving" ? "tone-success" : ins.momentum === "Needs Focus" ? "tone-danger" : "";

    el.innerHTML = `
      <div class="insights-card">
        <div class="insights-tier-wrap">
          <span class="insights-tier-badge ${ins.tierTone}">${esc(ins.tier)}</span>
          <span class="insights-momentum ${momentumTone}">${momentumIcon} ${esc(ins.momentum)}</span>
        </div>

        <div class="insights-section">
          <p class="insights-section-label">Strengths</p>
          <div class="insights-tags">
            ${ins.strengths.map(s => `<span class="insights-tag">${esc(s)}</span>`).join("")}
          </div>
        </div>

        ${ins.growthAreas.length ? `<div class="insights-section">
          <p class="insights-section-label">Growth Areas</p>
          <div class="insights-tags">
            ${ins.growthAreas.map(g => `<span class="insights-tag insights-tag--growth">${esc(g)}</span>`).join("")}
          </div>
        </div>` : ""}

        <div class="insights-section">
          <p class="insights-section-label">Highlights</p>
          <div class="insights-highlights">
            ${ins.highlights.map(h => `<div class="insights-highlight"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>${esc(h)}</span></div>`).join("")}
          </div>
        </div>
      </div>
    `;
  }

  // === PROFILE DASH ===
  function renderProfileDash(m, e) {
    attr("profile-avatar", "src", m.avatarUrl);
    txt("profile-name", m.displayName);
    txt("profile-headline", m.headline);
    txt("profile-about", m.about);
    htm("profile-details", [["UID", m.uid], ["Program", m.program], ["Department", m.department], ["Session", m.session], ["Email", m.email], ["Phone", m.phone], ["Location", m.location], ["CGPA", m.cgpa.toFixed(2)]]
      .map(([l, v]) => `<article class="detail-card is-compact interactive-surface" data-searchable data-search-index="${ea(`${l} ${v}`)}"><p class="detail-label">${esc(l)}</p><p class="detail-value">${esc(v)}</p></article>`).join(""));

    // Education
    const edu = m.education;
    if (edu) {
      htm("education-grid", `<article class="detail-card is-compact">
        <h3 class="course-title">${esc(edu.school)}</h3>
        <p class="subtle-text mb-sm">${esc(edu.highestQualification)} in ${esc(edu.fieldOfStudy)}</p>
        <div class="meta-row"><span>${esc(edu.startDate)} – ${esc(edu.endDate)}</span><span>Grade: <strong>${esc(edu.grade)}</strong></span></div>
      </article>`);
    }

    // Experience
    if (m.experience.length) {
      htm("experience-grid", m.experience.map(e => `<article class="detail-card is-compact">
        <div class="course-header mb-0"><div><h3 class="course-title">${esc(e.title)}</h3><p class="course-meta">${esc(e.organization)} · ${esc(e.employmentType)}</p></div></div>
        <div class="meta-row"><span>${esc(e.startDate)} – ${esc(e.endDate)}</span><span class="status-pill ${e.currentlyWorking?'tone-success':''}">${esc(e.locationType)}</span></div>
      </article>`).join(""));
    } else {
      htm("experience-grid", `<p class="subtle-text">No experience details available.</p>`);
    }

    // Languages
    const langGrid = document.getElementById("languages-grid");
    if (langGrid) {
      if (m.languages.length) {
        langGrid.innerHTML = m.languages.map(l => {
          const lvl = l.level || l.proficiency || 'Beginner';
          return `<article class="detail-card is-compact"><div class="course-header mb-0"><div><h3 class="course-title">${esc(l.name)}</h3></div><span class="level-badge level-${lvl.toLowerCase().replace(/\s+/g,'-')}">${esc(lvl)}</span></div></article>`;
        }).join("");
      } else {
        langGrid.innerHTML = `<p class="subtle-text">No programming languages added yet.</p>`;
      }
    }

    // Technologies
    const techGrid = document.getElementById("technologies-grid");
    if (techGrid) {
      if (m.technologies.length) {
        techGrid.innerHTML = m.technologies.map(t => {
          const lvl = t.level || t.proficiency || 'Beginner';
          return `<article class="detail-card is-compact"><div class="course-header mb-0"><div><h3 class="course-title">${esc(t.name)}</h3></div><span class="level-badge level-${lvl.toLowerCase().replace(/\s+/g,'-')}">${esc(lvl)}</span></div></article>`;
        }).join("");
      } else {
        techGrid.innerHTML = `<p class="subtle-text">No technologies added yet.</p>`;
      }
    }

    // Certifications
    htm("certifications-grid", m.certifications.map(c => `<article class="detail-card is-compact" data-searchable data-search-index="${ea(`${c.title} ${c.issuer}`)}">
      <div class="course-header mb-0"><div><h3 class="course-title">${esc(c.title)}</h3><p class="course-meta">${esc(c.issuer)}</p></div><span class="cert-badge cert-badge-${(c.badge||'core').toLowerCase()}">${esc(c.badge||'Core')}</span></div>
      <div class="meta-row"><span>Issued: ${esc(c.issueDate)}</span><span class="status-pill tone-success">${esc(c.status)}</span></div>
      ${c.credentialId ? `<div class="mt-sm"><a href="${esc(c.credentialUrl)}" target="_blank" class="subtle-text link-underline">Credential: ${esc(c.credentialId)}</a></div>` : ''}
    </article>`).join(""));
  }

  // === ACADEMIC ===
  function renderAcademic(m, student, data) {
    htm("academic-summary", [["Latest SGPA", m.sgpa.toFixed(2), `Status: ${m.remark}`], ["Course Count", m.courses.length, "Theory & Lab"], ["Best Subject", m.bestCourse.name, `Grade: ${m.bestCourse.grade}`], ["CGPA", m.cgpa.toFixed(2), "All semesters"]]
      .map(([l,v,n]) => `<article class="summary-card interactive-surface is-compact"><p class="detail-label">${esc(l)}</p><h3 class="course-title mb-0">${esc(String(v))}</h3><p class="subtle-text">${esc(n)}</p></article>`).join(""));
    const dTabs = document.getElementById("dash-academic-tabs");
    const dGrid = document.getElementById("academic-grid");
    if(dTabs) {
      dTabs.innerHTML = ["1","2","3","4","5","6"].map(id => `<button class="semester-tab" data-sem-id="${id}">Sem ${id}</button>`).join("");
      animatedSemSwitch(dGrid, dTabs, student, data, "3");
    }
  }

  // === COURSES (no progress bars) ===
  function renderCoursesDash(m) {
    if (m.additionalCourses.length) {
      htm("courses-grid", m.additionalCourses.map(c => `<article class="detail-card is-compact" data-searchable data-search-index="${ea(`${c.name} ${c.code} ${c.description}`)}">
        <div class="course-header mb-0"><div><h3 class="course-title">${esc(c.name)}</h3><p class="course-meta">${esc(c.code)} | ${esc(c.duration)}</p></div><span class="status-pill ${c.status==='Completed'?'tone-success':'tone-warning'}">${esc(c.status)}</span></div>
        <p class="subtle-text my-xs">${esc(c.description)}</p>
        <div class="meta-row"><span>${esc(c.startDate)} – ${esc(c.endDate)}</span>${c.grade?`<span>Grade: <strong>${esc(c.grade)}</strong></span>`:''}</div>
      </article>`).join(""));
    } else {
      htm("courses-grid", `<p class="subtle-text">No additional courses enrolled.</p>`);
    }
  }

  function renderSkillsDash(m) { htm("skills-grid", m.skills.map(s => `<span class="skill-tag" data-searchable data-search-index="${ea(s)}">${esc(s)}</span>`).join("")); }

  function renderProjectsDash(m) {
    htm("projects-grid", m.projects.map(p => `<article class="detail-card is-compact" data-searchable data-search-index="${ea(`${p.title} ${p.description} ${p.tags.join(" ")} ${p.status}`)}">
      <div class="project-header"><div><h3 class="project-title">${esc(p.title)}</h3><p class="project-meta">${esc(p.timeline)}</p></div><span class="status-pill ${p.tone}">${esc(p.status)}</span></div>
      <p class="project-description">${esc(p.description)}</p>
      <div class="project-tags">${p.tags.map(t=>`<span class="project-tag tag-sm">${esc(t)}</span>`).join("")}</div>
    </article>`).join(""));
  }

  // === EDITOR ===
  function populateEditor(st) {
    const { model: m, edits: e } = st;
    attr("editor-avatar", "src", m.avatarUrl); txt("editor-name-preview", m.displayName);
    val("display-name", e.displayName || m.displayName); val("headline", e.headline || m.headline);
    val("email", e.email || m.email); val("phone", e.phone || m.phone);
    val("location", e.location || m.location); val("learning-focus", e.learningFocus || m.learningFocus);
    val("skills-input", (e.skills || m.skills).join(", ")); val("about-input", e.about || m.about);
    populateEducationEntries(e.education || m.education);
    populateExperienceEntries(e.experience || m.experience);
    populateCertificationEntries(e.certificationEdits || m.certifications);
    populateLanguageEntries(e.languages || m.languages);
    populateTechnologyEntries(e.technologies || m.technologies);
  }

  // === STRUCTURED FORM HELPERS ===
  function populateEducationEntries(edu) {
    const container = document.getElementById("education-entries");
    if (!container) return;
    container.innerHTML = "";
    if (edu && !Array.isArray(edu)) edu = [edu];
    if (!edu || edu.length === 0) edu = [{ school: "", highestQualification: "", fieldOfStudy: "", startDate: "", endDate: "", grade: "" }];
    edu.forEach((entry, idx) => container.appendChild(createEducationEntry(entry, idx)));
  }
  function createEducationEntry(entry, idx) {
    const div = document.createElement("div");
    div.className = "settings-entry-card"; div.dataset.entryType = "education"; div.dataset.entryIdx = idx;
    div.innerHTML = `
      <button type="button" class="remove-entry-btn" data-remove="education" data-idx="${idx}">×</button>
      <div class="settings-entry-fields">
        <div class="field-group"><label>School / Institution</label><input type="text" name="edu_school_${idx}" value="${eav(entry.school)}" placeholder="School name"></div>
        <div class="field-group"><label>Highest Qualification</label><input type="text" name="edu_qual_${idx}" value="${eav(entry.highestQualification)}" placeholder="e.g. Senior Secondary (XII)"></div>
        <div class="field-group"><label>Field of Study</label><input type="text" name="edu_field_${idx}" value="${eav(entry.fieldOfStudy)}" placeholder="e.g. Science (PCM)"></div>
        <div class="field-group"><label>Grade</label><input type="text" name="edu_grade_${idx}" value="${eav(entry.grade)}" placeholder="e.g. First Division"></div>
        <div class="field-group"><label>Start Date</label><input type="text" name="edu_start_${idx}" value="${eav(entry.startDate)}" placeholder="e.g. April 2021"></div>
        <div class="field-group"><label>End Date</label><input type="text" name="edu_end_${idx}" value="${eav(entry.endDate)}" placeholder="e.g. March 2023"></div>
      </div>`;
    return div;
  }

  function populateExperienceEntries(exp) {
    const container = document.getElementById("experience-entries");
    if (!container) return; container.innerHTML = "";
    if (!exp || exp.length === 0) exp = [{ title: "", employmentType: "Full-time", organization: "", currentlyWorking: false, startDate: "", endDate: "", locationType: "On-site" }];
    exp.forEach((entry, idx) => container.appendChild(createExperienceEntry(entry, idx)));
  }
  function createExperienceEntry(entry, idx) {
    const div = document.createElement("div");
    div.className = "settings-entry-card"; div.dataset.entryType = "experience"; div.dataset.entryIdx = idx;
    div.innerHTML = `
      <button type="button" class="remove-entry-btn" data-remove="experience" data-idx="${idx}">×</button>
      <div class="settings-entry-fields">
        <div class="field-group"><label>Title</label><input type="text" name="exp_title_${idx}" value="${eav(entry.title)}" placeholder="Job title"></div>
        <div class="field-group"><label>Employment Type</label>
          <select name="exp_type_${idx}">
            <option value="Full-time" ${entry.employmentType==='Full-time'?'selected':''}>Full-time</option>
            <option value="Part-time" ${entry.employmentType==='Part-time'?'selected':''}>Part-time</option>
            <option value="Internship" ${entry.employmentType==='Internship'?'selected':''}>Internship</option>
            <option value="Contract" ${entry.employmentType==='Contract'?'selected':''}>Contract</option>
            <option value="Freelance" ${entry.employmentType==='Freelance'?'selected':''}>Freelance</option>
          </select></div>
        <div class="field-group"><label>Organization</label><input type="text" name="exp_org_${idx}" value="${eav(entry.organization)}" placeholder="Company name"></div>
        <div class="field-group"><label>Location Type</label>
          <select name="exp_loc_${idx}">
            <option value="On-site" ${entry.locationType==='On-site'?'selected':''}>On-site</option>
            <option value="Remote" ${entry.locationType==='Remote'?'selected':''}>Remote</option>
            <option value="Hybrid" ${entry.locationType==='Hybrid'?'selected':''}>Hybrid</option>
          </select></div>
        <div class="field-group"><label>Start Date</label><input type="text" name="exp_start_${idx}" value="${eav(entry.startDate)}" placeholder="e.g. Jan 2024"></div>
        <div class="field-group"><label>End Date</label><input type="text" name="exp_end_${idx}" value="${eav(entry.endDate)}" placeholder="e.g. Present"></div>
        <div class="field-group field-group-wide">
          <div class="checkbox-wrap"><input type="checkbox" id="exp_cw_${idx}" name="exp_cw_${idx}" ${entry.currentlyWorking?'checked':''}><label for="exp_cw_${idx}">Currently Working</label></div>
        </div>
      </div>`;
    return div;
  }

  function populateCertificationEntries(certs) {
    const container = document.getElementById("certification-entries");
    if (!container) return; container.innerHTML = "";
    if (!certs || certs.length === 0) certs = [{ title: "", issuer: "", issueDate: "", endDate: "", credentialId: "", credentialUrl: "" }];
    certs.forEach((entry, idx) => container.appendChild(createCertificationEntry(entry, idx)));
  }
  function createCertificationEntry(entry, idx) {
    const div = document.createElement("div");
    div.className = "settings-entry-card"; div.dataset.entryType = "certification"; div.dataset.entryIdx = idx;
    div.innerHTML = `
      <button type="button" class="remove-entry-btn" data-remove="certification" data-idx="${idx}">×</button>
      <div class="settings-entry-fields">
        <div class="field-group"><label>Certification Name</label><input type="text" name="cert_name_${idx}" value="${eav(entry.title)}" placeholder="Certification name"></div>
        <div class="field-group"><label>Issuing Organization</label><input type="text" name="cert_issuer_${idx}" value="${eav(entry.issuer)}" placeholder="e.g. Google, AWS"></div>
        <div class="field-group"><label>Issue Date</label><input type="text" name="cert_issue_${idx}" value="${eav(entry.issueDate)}" placeholder="e.g. May 2024"></div>
        <div class="field-group"><label>Expiration Date</label><input type="text" name="cert_end_${idx}" value="${eav(entry.endDate)}" placeholder="e.g. May 2026 or No Expiry"></div>
        <div class="field-group"><label>Credential ID</label><input type="text" name="cert_id_${idx}" value="${eav(entry.credentialId)}" placeholder="Credential ID"></div>
        <div class="field-group"><label>Certification URL</label><input type="url" name="cert_url_${idx}" value="${eav(entry.credentialUrl)}" placeholder="https://..."></div>
      </div>`;
    return div;
  }

  function renderTagChips(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    if (!items) return;
    items.forEach(item => {
      const chip = document.createElement("span");
      chip.className = "tag-chip";
      const lvl = item.level || item.proficiency || "Intermediate"; // Handle legacy proficiency mappings
      chip.dataset.name = item.name;
      chip.dataset.level = lvl;
      chip.innerHTML = `${eav(item.name)} <span class="tag-chip-level">${eav(lvl)}</span> <button type="button" class="tag-chip-remove" title="Remove tag">×</button>`;
      container.appendChild(chip);
    });
  }
  function populateLanguageEntries(langs) { renderTagChips("language-entries", langs); }
  function populateTechnologyEntries(techs) { renderTagChips("technology-entries", techs); }

  // Collect entries from DOM
  function collectEducationEntries() {
    return [...document.querySelectorAll('#education-entries .settings-entry-card')].map(card => {
      const get = (prefix) => { const el = card.querySelector(`input[name^="${prefix}"]`); return el ? el.value.trim() : ""; };
      return { school: get("edu_school"), highestQualification: get("edu_qual"), fieldOfStudy: get("edu_field"), grade: get("edu_grade"), startDate: get("edu_start"), endDate: get("edu_end") };
    }).filter(e => e.school || e.highestQualification || e.fieldOfStudy);
  }
  function collectExperienceEntries() {
    return [...document.querySelectorAll('#experience-entries .settings-entry-card')].map(card => {
      const get = (prefix) => { const el = card.querySelector(`input[name^="${prefix}"]`); return el ? el.value.trim() : ""; };
      const getSel = (prefix) => { const el = card.querySelector(`select[name^="${prefix}"]`); return el ? el.value : ""; };
      const getCb = (prefix) => { const el = card.querySelector(`input[name^="${prefix}"][type="checkbox"]`); return el ? el.checked : false; };
      return { title: get("exp_title"), employmentType: getSel("exp_type") || "Full-time", organization: get("exp_org"), currentlyWorking: getCb("exp_cw"), startDate: get("exp_start"), endDate: get("exp_end"), locationType: getSel("exp_loc") || "On-site" };
    }).filter(e => e.title || e.organization);
  }
  function collectCertificationEntries() {
    return [...document.querySelectorAll('#certification-entries .settings-entry-card')].map(card => {
      const get = (prefix) => { const el = card.querySelector(`input[name^="${prefix}"]`); return el ? el.value.trim() : ""; };
      return { title: get("cert_name"), issuer: get("cert_issuer"), issueDate: get("cert_issue"), endDate: get("cert_end"), credentialId: get("cert_id"), credentialUrl: get("cert_url"), badge: "Core", status: "Verified" };
    }).filter(e => e.title || e.issuer);
  }
  function collectLanguageEntries() {
    const container = document.getElementById('language-entries');
    if (!container) return [];
    return [...container.children].map(chip => ({ name: chip.dataset.name, level: chip.dataset.level }));
  }
  function collectTechnologyEntries() {
    const container = document.getElementById('technology-entries');
    if (!container) return [];
    return [...container.children].map(chip => ({ name: chip.dataset.name, level: chip.dataset.level }));
  }

  function reIndexEntries(container, type) {
    [...container.children].forEach((card, i) => {
      card.dataset.entryIdx = i;
      const removeBtn = card.querySelector(".remove-entry-btn");
      if (removeBtn) removeBtn.dataset.idx = i;
      card.querySelectorAll("input, select").forEach(input => {
        const name = input.name;
        if (name) input.name = name.substring(0, name.lastIndexOf("_") + 1) + i;
        if (input.type === "checkbox") {
          input.id = input.id.replace(/_\d+$/, `_${i}`);
          const label = card.querySelector(`label[for]`);
          if (label && label.getAttribute("for").includes(type.substring(0,3))) label.setAttribute("for", input.id);
        }
      });
    });
  }

  // === INTERACTIONS ===
  function bindInteractions(state) {
    const search = document.getElementById("dashboard-search"), fb = document.getElementById("profile-feedback");
    if(search) search.addEventListener("input", () => applySearch(search.value));
    const clbtn = document.getElementById("clear-search");
    if(clbtn) clbtn.addEventListener("click", () => { search.value = ""; applySearch(""); search.focus(); });
    document.getElementById("logout-button").addEventListener("click", () => { clearSession(); window.location.replace("index.html"); });
    document.getElementById("avatar-upload").addEventListener("change", async e => {
      const [f] = e.target.files || []; if (!f) return;
      state.pendingAvatar = await readFile(f);
      attr("editor-avatar", "src", state.pendingAvatar);
      feedback(fb, "Image ready. Save to apply.", "success");
    });

    // Add entry buttons
    const addBtns = [
      ["add-education-btn", "education-entries", () => createEducationEntry({ school: "", highestQualification: "", fieldOfStudy: "", startDate: "", endDate: "", grade: "" }, 0)],
      ["add-experience-btn", "experience-entries", () => createExperienceEntry({ title: "", employmentType: "Full-time", organization: "", currentlyWorking: false, startDate: "", endDate: "", locationType: "On-site" }, 0)],
      ["add-certification-btn", "certification-entries", () => createCertificationEntry({ title: "", issuer: "", issueDate: "", endDate: "", credentialId: "", credentialUrl: "" }, 0)]
    ];
    addBtns.forEach(([btnId, containerId, createFn]) => {
      const btn = document.getElementById(btnId);
      if (btn) btn.addEventListener("click", () => {
        const container = document.getElementById(containerId);
        const idx = container.children.length;
        const el = createFn();
        el.dataset.entryIdx = idx;
        container.appendChild(el);
      });
    });

    // Setup Tag Editors
    const setupTagEditor = (btnId, inputId, selectId, containerId) => {
      const btn = document.getElementById(btnId);
      const input = document.getElementById(inputId);
      const select = document.getElementById(selectId);
      const container = document.getElementById(containerId);
      if (!btn || !input || !container) return;
      
      const addTag = () => {
        const name = input.value.trim();
        const level = select ? (select.value || "Intermediate") : "Intermediate";
        if (!name) return;
        if ([...container.children].some(c => c.dataset.name.toLowerCase() === name.toLowerCase())) {
          input.value = ""; return; // Prevent duplicate
        }
        const chip = document.createElement("span");
        chip.className = "tag-chip";
        chip.dataset.name = name;
        chip.dataset.level = level;
        chip.innerHTML = `${eav(name)} <span class="tag-chip-level">${eav(level)}</span> <button type="button" class="tag-chip-remove" title="Remove tag">×</button>`;
        container.appendChild(chip);
        input.value = "";
        if (select) select.selectedIndex = 0;
      };
      
      btn.addEventListener("click", addTag);
      input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } });
    };

    setupTagEditor("add-language-btn", "lang-input", "lang-level", "language-entries");
    setupTagEditor("add-technology-btn", "tech-input", "tech-level", "technology-entries");

    // Remove entry delegation
    document.addEventListener("click", e => {
      const tagRemBtn = e.target.closest(".tag-chip-remove");
      if (tagRemBtn) {
        tagRemBtn.closest(".tag-chip").remove();
        return;
      }
      
      const removeBtn = e.target.closest(".remove-entry-btn");
      if (!removeBtn) return;
      const card = removeBtn.closest(".settings-entry-card");
      if (card) {
        card.style.opacity = "0";
        card.style.transform = "scale(.95)";
        card.style.transition = "opacity 200ms ease, transform 200ms ease";
        setTimeout(() => {
          card.remove();
          const type = removeBtn.dataset.remove;
          const container = document.getElementById(`${type === 'certification' ? 'certification' : type}-entries`);
          if (container) reIndexEntries(container, type);
        }, 200);
      }
    });

    // Form submit
    document.getElementById("profile-form").addEventListener("submit", e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const next = clean({
        displayName: fd.get("displayName"),
        headline: fd.get("headline"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        location: fd.get("location"),
        learningFocus: fd.get("learningFocus"),
        about: fd.get("about"),
        skills: fd.get("skills").split(",").map(s=>s.trim()).filter(Boolean),
        avatarDataUrl: state.pendingAvatar,
        education: collectEducationEntries().length ? (collectEducationEntries().length === 1 ? collectEducationEntries()[0] : collectEducationEntries()) : undefined,
        experience: collectExperienceEntries().length ? collectExperienceEntries() : undefined,
        certificationEdits: collectCertificationEntries().length ? collectCertificationEntries() : undefined,
        languages: collectLanguageEntries().length ? collectLanguageEntries() : undefined,
        technologies: collectTechnologyEntries().length ? collectTechnologyEntries() : undefined
      });
      if (!state.pendingAvatar && state.edits.avatarDataUrl) next.avatarDataUrl = state.edits.avatarDataUrl;
      saveEdits(state.student.uid, next); state.edits = next;
      rebuild(state, next); feedback(fb, "Profile saved.", "success");
    });

    document.getElementById("reset-profile").addEventListener("click", () => {
      clearEdits(state.student.uid); state.pendingAvatar = null; state.edits = {};
      rebuild(state, {}); feedback(fb, "Reset to defaults.", "success");
    });

    const dashTabs = document.getElementById("dash-academic-tabs");
    if(dashTabs) { dashTabs.addEventListener("click", e => { const btn = e.target.closest(".semester-tab"); if(btn) animatedSemSwitch(document.getElementById("academic-grid"), dashTabs, state.student, state.data, btn.dataset.semId); }); }
  }

  function rebuild(state, edits) {
    const sorted = [...state.data.students].sort((a, b) => b.sgpa - a.sgpa);
    state.model = mkModel(state.student, state.data.meta, mkCourses(state.student), compRankFor(sorted, state.student.uid), edits);
    renderAll(state); populateEditor(state);
    const sh = document.getElementById("dashboard-search");
    if(sh) applySearch(sh.value || "");
  }

  function applySearch(q) {
    const n = q.trim().toLowerCase(), sum = document.getElementById("search-summary");
    const nodes = [...document.querySelectorAll("[data-searchable]")];
    if (!n) { nodes.forEach(el => el.classList.remove("is-dimmed", "is-match")); if (sum) sum.textContent = "Search subjects, skills, projects, or certifications."; return; }
    let m = 0;
    nodes.forEach(el => { const hit = (el.dataset.searchIndex || "").toLowerCase().includes(n); el.classList.toggle("is-match", hit); el.classList.toggle("is-dimmed", !hit); if (hit) m++; });
    if (sum) sum.textContent = m ? `${m} item${m===1?"":"s"} for "${q.trim()}".` : `No matches for "${q.trim()}".`;
  }

  // === SPA ROUTER ===
  function switchPage(pageId) {
    document.querySelectorAll(".dash-page").forEach(p => p.classList.remove("is-active-page"));
    document.querySelectorAll("[data-page-link]").forEach(l => l.classList.toggle("is-active", l.dataset.pageLink === pageId));
    const target = document.querySelector(`[data-page-id="${pageId}"]`);
    if (target) { target.classList.add("is-active-page"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }
  function bindSpaRouter() {
    document.querySelectorAll("[data-page-link]").forEach(link => {
      link.addEventListener("click", e => { e.preventDefault(); switchPage(link.dataset.pageLink); history.replaceState(null, "", `#${link.dataset.pageLink}`); });
    });
    window.addEventListener("hashchange", () => { const h = location.hash.replace("#",""); if (h) switchPage(h); });
  }

  // === MOBILE NAV ===
  function bindMobileNav() {
    const hb = document.getElementById("hamburger-btn");
    const nv = document.getElementById("main-nav");
    const ov = document.getElementById("mobile-nav-overlay");
    const closeBtn = document.getElementById("nav-close-btn");
    if (!hb || !nv) return;
    let isNavOpen = false;
    const toggleSidebar = (state) => {
      isNavOpen = typeof state === "boolean" ? state : !isNavOpen;
      nv.classList.toggle("is-open", isNavOpen);
      hb.classList.toggle("is-open", isNavOpen);
      hb.setAttribute("aria-expanded", String(isNavOpen));
      if (ov) ov.classList.toggle("is-visible", isNavOpen);
    };

    hb.addEventListener("click", () => toggleSidebar());
    if (closeBtn) closeBtn.addEventListener("click", () => toggleSidebar(false));
    if (ov) ov.addEventListener("click", () => toggleSidebar(false));
    nv.querySelectorAll(".nav-link, .nav-button").forEach(l => l.addEventListener("click", () => toggleSidebar(false)));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && isNavOpen) toggleSidebar(false); });
  }
};
