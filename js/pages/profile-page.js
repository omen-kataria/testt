/**
 * BLACKLINE — Profile Page Module (profile.html)
 * All progress bars removed. All inline styles replaced with CSS classes.
 */
BL.pages["profile-page"] = function(data) {
  const {
    txt, htm, attr, esc, ea, eav, titleCase,
    getSkills, getCerts, mkCourses, mkModel, mkAvatar, mkPhone,
    compRankFor, getEdits, getSession, getStatusNote, tone,
    animatedSemSwitch, bindScrollHideNav
  } = BL;

  const params = new URLSearchParams(window.location.search);
  const uid = params.get("id");
  if (!uid) { window.location.replace("students.html"); return; }

  const student = data.students.find(s => s.uid === uid);
  if (!student) {
    document.querySelector(".profile-shell").innerHTML = `<div class="glass-panel centered-panel"><h2>Student Not Found</h2><p class="subtle-text">UID "${esc(uid)}" was not found.</p><a class="primary-button mt-md" href="students.html"><span class="btn-text">Back to Directory</span></a></div>`;
    return;
  }

  const sorted = [...data.students].sort((a, b) => b.sgpa - a.sgpa);
  const rank = compRankFor(sorted, student.uid);
  const edits = getEdits(student.uid);
  const m = mkModel(student, data.meta, mkCourses(student), rank, edits);

  document.title = `${m.displayName} — Blackline Profile`;

  // Hero
  attr("pf-avatar", "src", m.avatarUrl);
  txt("pf-name", m.displayName);
  txt("pf-headline", m.headline);
  txt("pf-semester-badge", m.semesterLabel);
  const statusEl = document.getElementById("pf-status-badge");
  if (statusEl) { statusEl.textContent = m.remark; statusEl.classList.add(tone(m.remark, m.sgpa).replace('tone-','')); }
  txt("pf-sgpa", m.sgpa.toFixed(2));
  txt("pf-cgpa", m.cgpa.toFixed(2));

  // Owner check
  const session = getSession();
  if (session && session.uid === student.uid) {
    const editBar = document.getElementById("profile-edit-bar");
    if (editBar) editBar.style.display = "";
  }

  // Details grid
  htm("pf-details-grid", [
    ["UID", m.uid], ["Program", m.program], ["Semester", m.semesterLabel],
    ["Session", m.session], ["Rank", `#${m.rank} of ${data.students.length}`],
    ["CGPA", m.cgpa.toFixed(2)], ["Status", m.remark]
  ].map(([l, v]) => `<article class="detail-card"><p class="detail-label">${esc(l)}</p><p class="detail-value">${esc(v)}</p></article>`).join(""));

  // Education
  const edu = student.education;
  if (edu) {
    htm("pf-education-grid", `<article class="detail-card is-compact">
      <h3 class="course-title">${esc(edu.school)}</h3>
      <p class="subtle-text mb-sm">${esc(edu.highestQualification)} in ${esc(edu.fieldOfStudy)}</p>
      <div class="meta-row"><span>${esc(edu.startDate)} – ${esc(edu.endDate)}</span><span>Grade: <strong>${esc(edu.grade)}</strong></span></div>
    </article>`);
  }

  // Experience
  const exp = student.experience || [];
  const expSec = document.getElementById("pf-experience-section");
  if (exp.length > 0) {
    htm("pf-experience-grid", exp.map(e => `<article class="detail-card is-compact">
      <div class="course-header mb-0"><div><h3 class="course-title">${esc(e.title)}</h3><p class="course-meta">${esc(e.organization)} · ${esc(e.employmentType)}</p></div></div>
      <div class="meta-row"><span>${esc(e.startDate)} – ${esc(e.endDate)}</span><span class="status-pill ${e.currentlyWorking?'tone-success':''}">${esc(e.locationType)}</span></div>
    </article>`).join(""));
  } else if (expSec) expSec.style.display = "none";

  // Certifications
  htm("pf-certs-grid", m.certifications.map(c => `<article class="detail-card is-compact">
    <div class="course-header mb-0"><div><h3 class="course-title">${esc(c.title)}</h3><p class="course-meta">${esc(c.issuer)}</p></div><span class="cert-badge cert-badge-${(c.badge||'core').toLowerCase()}">${esc(c.badge||'Core')}</span></div>
    <div class="meta-row"><span>Issued: ${esc(c.issueDate)}</span><span class="status-pill tone-success">${esc(c.status)}</span></div>
    ${c.credentialId ? `<div class="mt-sm"><a href="${esc(c.credentialUrl)}" target="_blank" class="subtle-text link-underline">Credential: ${esc(c.credentialId)}</a></div>` : ''}
  </article>`).join(""));

  // Skills
  htm("pf-skills-grid", m.skills.map(s => `<span class="skill-tag">${esc(s)}</span>`).join(""));

  // Languages
  const pfLangGrid = document.getElementById("pf-languages-grid");
  if (pfLangGrid) {
    const langs = edits.languages || m.languages || [];
    if (langs.length) {
      pfLangGrid.innerHTML = langs.map(l => {
        const lvl = l.level || l.proficiency || 'Beginner';
        return `<article class="detail-card is-compact">
          <div class="course-header mb-0"><div><h3 class="course-title">${esc(l.name)}</h3></div><span class="level-badge level-${lvl.toLowerCase().replace(/\s+/g,'-')}">${esc(lvl)}</span></div>
        </article>`;
      }).join("");
    } else {
      pfLangGrid.innerHTML = `<p class="subtle-text">No programming languages added.</p>`;
    }
  }

  // Technologies
  const pfTechGrid = document.getElementById("pf-technologies-grid");
  if (pfTechGrid) {
    const techs = edits.technologies || m.technologies || [];
    if (techs.length) {
      pfTechGrid.innerHTML = techs.map(t => {
        const lvl = t.level || t.proficiency || 'Beginner';
        return `<article class="detail-card is-compact">
          <div class="course-header mb-0"><div><h3 class="course-title">${esc(t.name)}</h3></div><span class="level-badge level-${lvl.toLowerCase().replace(/\s+/g,'-')}">${esc(lvl)}</span></div>
        </article>`;
      }).join("");
    } else {
      pfTechGrid.innerHTML = `<p class="subtle-text">No technologies added.</p>`;
    }
  }

  // Semester Progress (no progress bars)
  const semGrid = document.getElementById("pf-sem-grid");
  if (semGrid && student.semesters) {
    const semLabels = { "1": "Sem 1", "2": "Sem 2", "3": "Sem 3", "4": "Sem 4", "5": "Sem 5", "6": "Sem 6" };
    semGrid.innerHTML = ["1","2","3","4","5","6"].map(id => {
      const sem = student.semesters[id];
      if (!sem || sem.sgpa === undefined || isNaN(sem.sgpa)) return "";
      const statusClass = /PASS/i.test(sem.remark) ? "sem-pass" : /ALL/i.test(sem.remark) ? "sem-fail" : "sem-backlog";
      return `<div class="sem-progress-card ${statusClass}">
        <span class="sem-progress-label">${semLabels[id]}</span>
        <span class="sem-progress-sgpa">${sem.sgpa.toFixed(2)}</span>
        <span class="sem-progress-remark">${esc(sem.remark)}</span>
      </div>`;
    }).join("");
  }

  // Academic Summary
  htm("pf-academic-summary", [
    ["Latest SGPA", m.sgpa.toFixed(2), `Rank #${m.rank}`],
    ["Status", m.remark, getStatusNote(m.remark)],
    ["Best Course", m.bestCourse.name, `Grade: ${m.bestCourse.grade}`],
    ["Total Courses", `${m.courses.length}`, "Theory & lab"]
  ].map(([l,v,n]) => `<article class="summary-card interactive-surface is-compact"><p class="detail-label">${esc(l)}</p><h3 class="course-title mb-0">${esc(v)}</h3><p class="subtle-text">${esc(n)}</p></article>`).join(""));

  // Academic tabs
  const pfTabs = document.getElementById("pf-academic-tabs");
  const pfGrid = document.getElementById("pf-courses-grid");
  if (pfTabs && pfGrid) {
    pfTabs.innerHTML = ["1","2","3","4","5","6"].map(id => `<button class="semester-tab" data-sem-id="${id}">Sem ${id}</button>`).join("");
    pfTabs.addEventListener("click", e => { const btn = e.target.closest(".semester-tab"); if (btn) animatedSemSwitch(pfGrid, pfTabs, student, data, btn.dataset.semId); });
    animatedSemSwitch(pfGrid, pfTabs, student, data, "3");
  }

  // Additional Courses (no progress bars)
  const addlCourses = student.courses || [];
  htm("pf-additional-courses-grid", addlCourses.map(c => `<article class="detail-card is-compact">
    <div class="course-header mb-0"><div><h3 class="course-title">${esc(c.name)}</h3><p class="course-meta">${esc(c.code)} | ${esc(c.duration)}</p></div><span class="status-pill ${c.status==='Completed'?'tone-success':'tone-warning'}">${esc(c.status)}</span></div>
    <p class="subtle-text my-xs">${esc(c.description)}</p>
    <div class="meta-row"><span>${esc(c.startDate)} – ${esc(c.endDate)}</span>${c.grade?`<span>Grade: <strong>${esc(c.grade)}</strong></span>`:''}</div>
  </article>`).join(""));

  // Projects
  htm("pf-projects-grid", m.projects.map(p => `<article class="detail-card is-compact"><div class="project-header"><div><h3 class="project-title">${esc(p.title)}</h3><p class="project-meta">${esc(p.timeline)}</p></div><span class="status-pill ${p.tone}">${esc(p.status)}</span></div><p class="project-description">${esc(p.description)}</p><div class="project-tags">${p.tags.map(t=>`<span class="project-tag tag-sm">${esc(t)}</span>`).join("")}</div></article>`).join(""));

  bindScrollHideNav();
};
