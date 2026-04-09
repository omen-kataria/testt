/**
 * BLACKLINE — App Core (Shared Module)
 * ======================================
 * Creates the BL namespace with:
 *  - Constants & config
 *  - Skills map
 *  - Performance insights (data-driven, qualitative)
 *  - DOM utilities
 *  - Theme & session management
 *  - Data builders
 *  - Boot sequence
 *
 * Data flow: data/data.json → fetch → parse → page init → DOM rendering
 *                                          ↕
 *                                    localStorage (theme, session, edits)
 */

"use strict";

window.BL = (() => {

  // =====================================================================
  // CONSTANTS & CONFIGURATION
  // =====================================================================

  const SK = {
    theme: "blackline-theme",
    session: "blackline-session",
    edits: "blackline-profile-edits"
  };

  const SKILL_MAPS = {
    BCAC101T: ["Computer Basics", "Hardware Concepts", "Number Systems"],
    BCAC102T: ["C Programming", "Pointers", "Memory Management"],
    BCAE103T: ["Professional Writing", "Presentation Skills", "Communication"],
    BCAE104T: ["Discrete Mathematics", "Linear Algebra", "Calculus"],
    BCAS105T: ["Environmental Awareness", "Sustainability", "Research"],
    BCAC106P: ["C Debugging", "Lab Practice", "Algorithm Testing"],
    BCAS107P: ["MS Office", "Spreadsheets", "Document Formatting"],
    BCAC201T: ["Arrays", "Linked Lists", "Trees & Graphs"],
    BCAC202T: ["Logic Gates", "Flip-Flops", "Circuit Design"],
    BCAE203T: ["Probability", "Statistics", "Numerical Methods"],
    BCAE204T: ["SQL", "Normalization", "ER Modeling"],
    BCAS205T: ["HTML/CSS", "JavaScript Basics", "Web Hosting"],
    BCAC206P: ["Stack/Queue Implementation", "Sorting Algorithms", "Lab Debugging"],
    BCAS207P: ["MySQL", "Query Writing", "Database Design"],
    BCAC301T: ["Process Scheduling", "Linux Basics", "Memory Management"],
    BCAC302T: ["UML Modeling", "Requirement Analysis", "Workflow Mapping"],
    BCAE303T: ["Financial Reporting", "Spreadsheet Modeling", "Analytical Thinking"],
    BCAE304T: ["Optimization", "Quantitative Reasoning", "Decision Models"],
    BCAS305T: ["Python", "Automation", "Problem Solving"],
    BCAC306P: ["Terminal Practice", "Lab Debugging", "System Commands"],
    BCAS307P: ["Scripting", "Data Handling", "Testing Basics"],
    BCAC401T: ["Java", "OOP", "Multithreading"],
    BCAC402T: ["TCP/IP", "Network Security", "OSI Model"],
    BCAE403T: ["React", "Node.js", "REST APIs"],
    BCAE404T: ["Agile", "SDLC", "Testing Methodologies"],
    BCAS405T: ["OpenGL", "2D/3D Rendering", "Image Processing"],
    BCAC406P: ["Java Projects", "GUI Development", "Unit Testing"],
    BCAS407P: ["Full-Stack Development", "Responsive Design", "API Integration"]
  };

  // =====================================================================
  // DOM UTILITIES
  // =====================================================================

  function txt(id, t) { const e = document.getElementById(id); if (e) e.textContent = t; }
  function htm(id, h) { const e = document.getElementById(id); if (e) e.innerHTML = h; }
  function attr(id, a, v) { const e = document.getElementById(id); if (e) e.setAttribute(a, v); }
  function val(id, v) { const e = document.getElementById(id); if (e) e.value = v; }
  function feedback(el, msg, type) { if (!el) return; el.textContent = msg; el.classList.remove("is-error","is-success"); if (type) el.classList.add(`is-${type}`); }
  function clearFb(el) { if (el) { el.textContent = ""; el.classList.remove("is-error","is-success"); } }
  function nav(url) { document.body.classList.add("page-exit"); setTimeout(() => { window.location.href = url; }, 350); }
  function titleCase(v) { return String(v).toLowerCase().split(" ").filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(" "); }
  function co(v, fb) { return typeof v === "string" && v.trim() ? v.trim() : fb; }
  function getLF(r, g) { return /PASS/i.test(r) && g >= 7.5 ? "System design & Python" : /ALL/i.test(r) ? "Rebuilding fundamentals" : "Strengthening weak subjects"; }
  function getStatusNote(r) { return /PASS/i.test(r) ? "Stable" : /ALL/i.test(r) ? "Recovery needed" : "Backlogs to address"; }
  function tone(r, g) { return /PASS/i.test(r) && g >= 7 ? "tone-success" : /ALL/i.test(r) || g < 5 ? "tone-danger" : "tone-warning"; }
  function grade(s) { return s >= 90 ? "O" : s >= 80 ? "A+" : s >= 75 ? "A" : s >= 65 ? "B+" : s >= 55 ? "B" : s >= 40 ? "C" : "F"; }
  function blCodes(r) { return /ALL/i.test(r) ? ["301","302","303","304","305","306","307"] : r.match(/\d{3}/g) || []; }
  function compRankFor(sorted, uid) { let rank = 1; for (let i = 0; i < sorted.length; i++) { if (i > 0 && sorted[i].sgpa !== sorted[i-1].sgpa) rank = i + 1; if (sorted[i].uid === uid) return rank; } return sorted.length; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function hash(v) { return [...String(v)].reduce((t, c) => (t * 31 + c.charCodeAt(0)) >>> 0, 7); }
  function seed(s, lo, hi) { return lo + (hash(s) % (hi - lo + 1)); }
  function mkPhone(uid) { const d = String(hash(uid)).padStart(10, "9").slice(0, 10); return `+91 ${d.slice(0,5)} ${d.slice(5)}`; }
  function mkAvatar(name, s) {
    const ini = name.split(" ").filter(Boolean).slice(0,2).map(w => w[0]).join("").toUpperCase();
    const h = seed(`${s}-avatar`, 0, 359);
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="hsl(${h} 22% 18%)"/><stop offset="100%" stop-color="hsl(${(h+35)%360} 15% 10%)"/></linearGradient></defs><rect width="160" height="160" rx="80" fill="url(#bg)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="56" font-weight="700" fill="hsl(0 0% 97%)" letter-spacing="-2">${ini}</text></svg>`)}`;
  }
  function esc(v) { return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;"); }
  function ea(v) { return esc(v).replaceAll("\n", " "); }
  function eav(v) { return v ? String(v).replaceAll('"','&quot;') : ""; }
  function readFile(f) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(f); }); }

  // =====================================================================
  // SKILL & CERT HELPERS
  // =====================================================================

  function getSkills(s) { return s.skills && s.skills.length ? s.skills : mkSkills(s); }
  function getCerts(s) { return s.certifications && s.certifications.length ? s.certifications : []; }
  function mkSkills(s) {
    const mapped = s.subjects.flatMap(x => SKILL_MAPS[x.code] || []);
    return [...new Set([...mapped, s.sgpa >= 7.5 ? "Consistent Delivery" : "Improvement Planning", "Presentation", "Continuous Learning", "Time Management"])].slice(0, 10);
  }

  // =====================================================================
  // PERFORMANCE INSIGHTS (data-driven, qualitative — no scores exposed)
  // Internally uses: skillsCount, technologiesCount, projectsCount, certificationsCount
  // =====================================================================

  function computePerformanceInsights(student, edits = {}) {
    // --- Gather counts (the data-driven core) ---
    const skills = getSkills(student);
    const certs = getCerts(student);
    const technologies = edits.technologies || [];
    const exp = edits.experience || student.experience || [];
    const courses = student.courses || [];
    const projects = courses.length + 2; // generated projects + enrolled courses

    const counts = {
      skills: skills.length,
      technologies: technologies.length,
      projects: projects,
      certifications: certs.length
    };

    // --- Tier (derived from category strengths) ---
    // Each category maps to: strong (2), moderate (1), weak (0)
    const score = (v, hi, lo) => v >= hi ? 2 : v >= lo ? 1 : 0;
    const catScores = [
      score(counts.skills, 8, 4),
      score(counts.technologies, 3, 1),
      score(counts.projects, 4, 2),
      score(counts.certifications, 2, 1)
    ];
    const total = catScores.reduce((a, b) => a + b, 0); // 0–8

    let tier, tierTone;
    if (total >= 7) { tier = "Elite Performer"; tierTone = "tone-elite"; }
    else if (total >= 5) { tier = "Strong Performer"; tierTone = "tone-success"; }
    else if (total >= 3) { tier = "Emerging Talent"; tierTone = "tone-warning"; }
    else { tier = "Needs Focus"; tierTone = "tone-danger"; }

    // --- Strengths (pick top 2–3 from strongest categories) ---
    const strengths = [];
    if (catScores[0] === 2) strengths.push("Broad Skill Set");
    if (catScores[1] === 2) strengths.push("Tech Stack Builder");
    else if (catScores[1] === 1) strengths.push("Tech Explorer");
    if (catScores[2] === 2) strengths.push("Active Builder");
    if (catScores[3] === 2) strengths.push("Credential Builder");
    else if (catScores[3] === 1) strengths.push("Certified Learner");
    if (exp.length > 0) strengths.push("Industry Exposure");
    // Semester consistency check
    const semKeys = student.semesters ? Object.keys(student.semesters).filter(k => student.semesters[k]?.sgpa > 0) : [];
    if (semKeys.length >= 2) {
      const sgpas = semKeys.map(k => student.semesters[k].sgpa);
      const mean = sgpas.reduce((a, b) => a + b, 0) / sgpas.length;
      const variance = sgpas.reduce((a, v) => a + (v - mean) ** 2, 0) / sgpas.length;
      if (Math.sqrt(variance) < 0.6) strengths.push("Consistent Growth");
    }
    const finalStrengths = strengths.slice(0, 3);
    if (finalStrengths.length === 0) finalStrengths.push("Building Foundation");

    // --- Growth Areas (pick 1–2 from weakest categories) ---
    const growthAreas = [];
    if (catScores[3] === 0) growthAreas.push("Earn Certifications");
    if (catScores[1] === 0) growthAreas.push("Learn Technologies");
    if (catScores[0] === 0) growthAreas.push("Expand Skill Set");
    if (exp.length === 0) growthAreas.push("Gain Experience");
    if (!/PASS/i.test(student.remark)) growthAreas.push("Clear Backlogs");
    const finalGrowth = growthAreas.slice(0, 2);

    // --- Highlights (2–3 meaningful statements) ---
    const highlights = [];
    if (certs.length > 0) highlights.push(`Earned ${certs[0].title}`);
    if (exp.length > 0) highlights.push(`${exp[0].title} at ${exp[0].organization}`);
    if (counts.skills >= 8) highlights.push("Built a diverse skill set");
    if (technologies.length >= 2) highlights.push("Actively exploring technologies");
    if (courses.length > 0) highlights.push(`Enrolled in ${courses[0].name}`);
    if (student.education) highlights.push(`${student.education.highestQualification} from ${student.education.school}`);
    const finalHighlights = highlights.slice(0, 3);

    // --- Momentum ---
    let momentum = "Stable";
    if (semKeys.length >= 2) {
      const sorted = semKeys.sort((a, b) => Number(a) - Number(b));
      const latest = student.semesters[sorted[sorted.length - 1]].sgpa;
      const prev = student.semesters[sorted[sorted.length - 2]].sgpa;
      if (latest > prev + 0.3) momentum = "Improving";
      else if (latest < prev - 0.3) momentum = "Needs Focus";
    }

    return { tier, tierTone, strengths: finalStrengths, growthAreas: finalGrowth, highlights: finalHighlights, momentum, counts };
  }

  // =====================================================================
  // DATA BUILDERS
  // =====================================================================

  function mkCourses(s) {
    const bl = blCodes(s.remark), base = 35 + s.sgpa * 5.8;
    return s.subjects.map((sub, i) => {
      const lab = sub.code.endsWith("P"), inBl = bl.includes(sub.code.match(/\d{3}/)?.[0] || "");
      const score = clamp(Math.round(base + (lab ? 4 : 0) + seed(`${s.uid}-${sub.code}-${i}`, -6, 7) - (inBl ? 15 : 0)), 24, 98);
      return { ...sub, credits: lab ? 2 : 4, score, grade: grade(score), status: score >= 75 ? "Strong" : score >= 55 ? "Steady" : "Focus" };
    });
  }

  function mkCoursesForSem(s, data, semId) {
    const subjects = (semId === "3" || semId === data.meta.semester) ? s.subjects : (data.subjects[semId] || []);
    const semData = s.semesters?.[semId];
    if (!semData || semData.sgpa === undefined || semData.sgpa === 0) return [];
    const sgpa = semData.sgpa;
    const bl = blCodes(semData.remark || "");
    const base = 35 + sgpa * 5.8;
    return subjects.map((sub, i) => {
      const lab = sub.code.endsWith("P"), inBl = bl.includes(sub.code.match(/\d{3}/)?.[0] || "");
      const score = clamp(Math.round(base + (lab ? 4 : 0) + seed(`${s.uid}-${sub.code}-${i}`, -6, 7) - (inBl ? 15 : 0)), 24, 98);
      return { ...sub, credits: lab ? 2 : 4, score, grade: grade(score), status: score >= 75 ? "Strong" : score >= 55 ? "Steady" : "Focus" };
    });
  }

  function mkProjects(s, meta) {
    const sl = meta?.semesterLabel || "Semester", ss = meta?.session || "2024-25";
    const st = ["Live","Prototype","In Review"], tn = ["tone-success","tone-warning","tone-danger"], i = seed(s.uid,0,2);
    const n1 = s.subjects[0]?.name || "Core", n2 = s.subjects[4]?.name || s.subjects[1]?.name || "Elective";
    return [
      { title: `${n1} Dashboard`, timeline: `${sl} | ${n1.split(' ')[0]}`, status: st[i], tone: tn[i], description: `Interactive dashboard visualizing key concepts from ${n1}.`, tags: [n1.split(' ')[0], "Analytics", "UI"] },
      { title: `${n2} Analyzer`, timeline: `${ss} | ${n2.split(' ')[0]}`, status: st[(i+1)%3], tone: tn[(i+1)%3], description: `Utility for analyzing data from ${n2}.`, tags: [n2.split(' ')[0], "Automation", "Data"] }
    ];
  }

  function mkModel(s, meta, courses, rank, ed) {
    const nm = titleCase(s.name);
    const av = ed.avatarDataUrl || mkAvatar(ed.displayName || nm, s.uid);
    const insights = computePerformanceInsights(s, ed);
    return {
      uid: s.uid, displayName: co(ed.displayName, nm),
      headline: co(ed.headline, `${meta.program} student focused on ${s.subjects[0].name}`),
      about: co(ed.about, `${nm} is in ${meta.semesterLabel} with SGPA ${s.sgpa.toFixed(2)} and CGPA ${(s.cgpa||0).toFixed(2)}.`),
      email: co(ed.email, `${s.uid.toLowerCase()}@blackline.student`),
      phone: co(ed.phone, mkPhone(s.uid)), location: co(ed.location, "Location Placeholder"),
      learningFocus: co(ed.learningFocus, getLF(s.remark, s.sgpa)),
      skills: Array.isArray(ed.skills) && ed.skills.length ? ed.skills : getSkills(s),
      projects: mkProjects(s, meta), certifications: ed.certificationEdits && ed.certificationEdits.length ? ed.certificationEdits : getCerts(s),
      courses, rank, bestCourse: [...courses].sort((a, b) => b.score - a.score)[0], avatarUrl: av,
      semesterLabel: meta.semesterLabel, session: meta.session, program: meta.program, department: meta.department,
      remark: s.remark, sgpa: s.sgpa, cgpa: s.cgpa || 0,
      education: ed.education || s.education, experience: ed.experience || s.experience || [], additionalCourses: s.courses || [],
      certificationEdits: ed.certificationEdits || [],
      insights,
      languages: ed.languages || [],
      technologies: ed.technologies || []
    };
  }

  // =====================================================================
  // ANIMATED SEMESTER SWITCH (shared between dashboard + profile)
  // =====================================================================

  function animatedSemSwitch(dGrid, dTabs, s, data, semId) {
    if (!dGrid || !dTabs) return;
    dGrid.classList.remove("semester-content-enter");
    dGrid.classList.add("semester-content-exit");
    setTimeout(() => {
      const courses = mkCoursesForSem(s, data, semId);
      dGrid.innerHTML = courses.length ? courses.map(c => `<article class="detail-card is-compact" data-searchable data-search-index="${ea(`${c.code} ${c.name} ${c.grade}`)}"><div class="course-header"><div><p class="course-title">${esc(c.name)}</p><p class="course-meta">${esc(c.code)} | ${c.credits} cr</p></div><span class="grade-pill">${esc(c.grade)}</span></div><div class="meta-row"><span>${esc(c.status)}</span><span class="status-pill ${c.status === 'Strong' ? 'tone-success' : c.status === 'Steady' ? 'tone-warning' : 'tone-danger'}">${esc(c.status)}</span></div></article>`).join("") : `<p class="subtle-text">No courses available for this semester.</p>`;
      dTabs.querySelectorAll(".semester-tab").forEach(t => t.classList.toggle("is-active", t.dataset.semId === semId));
      dGrid.classList.remove("semester-content-exit");
      dGrid.classList.add("semester-content-enter");
      dGrid.addEventListener("animationend", () => dGrid.classList.remove("semester-content-enter"), { once: true });
    }, 130);
  }

  // =====================================================================
  // THEME PERSISTENCE
  // =====================================================================

  function applySavedTheme() { document.documentElement.dataset.theme = localStorage.getItem(SK.theme) || "light"; }
  function bindThemeToggles() {
    const toggles = [...document.querySelectorAll("[data-theme-toggle]")];
    const dark = document.documentElement.dataset.theme === "dark";
    toggles.forEach(t => { t.checked = dark; t.addEventListener("change", () => { const n = t.checked ? "dark" : "light"; document.documentElement.dataset.theme = n; localStorage.setItem(SK.theme, n); toggles.forEach(p => p.checked = t.checked); }); });
  }

  // =====================================================================
  // SESSION MANAGEMENT
  // =====================================================================

  function getSession() { try { return JSON.parse(localStorage.getItem(SK.session)); } catch { return null; } }
  function saveSession(uid) { localStorage.setItem(SK.session, JSON.stringify({ uid, ts: new Date().toISOString() })); }
  function clearSession() { localStorage.removeItem(SK.session); }

  // =====================================================================
  // PROFILE EDITS PERSISTENCE
  // =====================================================================

  function getEdits(uid) { try { return (JSON.parse(localStorage.getItem(SK.edits)) || {})[uid] || {}; } catch { return {}; } }
  function saveEdits(uid, e) { const a = JSON.parse(localStorage.getItem(SK.edits) || "{}"); a[uid] = e; localStorage.setItem(SK.edits, JSON.stringify(a)); }
  function clearEdits(uid) { const a = JSON.parse(localStorage.getItem(SK.edits) || "{}"); delete a[uid]; localStorage.setItem(SK.edits, JSON.stringify(a)); }
  function clean(e) { const o = {}; Object.entries(e).forEach(([k, v]) => { if (Array.isArray(v) && v.length) o[k] = v; else if (typeof v === "object" && v !== null && !Array.isArray(v) && Object.keys(v).length) o[k] = v; else if (typeof v === "string" && v.trim()) o[k] = v.trim(); else if (k === "avatarDataUrl" && v) o[k] = v; }); return o; }

  // =====================================================================
  // SCROLL-TO-HIDE NAVIGATION
  // =====================================================================

  function bindScrollHideNav() {
    const nav = document.getElementById("home-nav");
    if (!nav) return;
    let lastY = window.scrollY, ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { const y = window.scrollY; if (y > 80 && y > lastY) nav.classList.add("nav-hidden"); else nav.classList.remove("nav-hidden"); lastY = y; ticking = false; });
    }, { passive: true });
  }

  // =====================================================================
  // BOOT SEQUENCE
  // =====================================================================

  const pages = {};

  async function boot() {
    applySavedTheme();
    bindThemeToggles();
    requestAnimationFrame(() => document.body.classList.add("page-ready"));

    const sess = getSession();
    if (sess) {
      document.querySelectorAll(".home-profile-btn").forEach(btn => {
        btn.setAttribute("href", "dashboard.html");
        const t = btn.querySelector(".btn-text");
        if (t) t.textContent = "Dashboard";
      });
    }

    const raw = await (await fetch("data/data.json", { cache: "no-store" })).text();
    const data = JSON.parse(raw.replace(/^\uFEFF/, ''));

    const page = document.body.dataset.page;
    if (pages[page]) pages[page](data);
  }

  document.addEventListener("DOMContentLoaded", () => {
    boot().catch(err => {
      console.error("Init failed:", err);
      document.body.classList.add("page-ready");
    });
  });

  // =====================================================================
  // PUBLIC API
  // =====================================================================

  return {
    pages,
    // Utils
    txt, htm, attr, val, feedback, clearFb, nav, titleCase, co,
    getLF, getStatusNote, tone, grade, blCodes, compRankFor,
    clamp, hash, seed, mkPhone, mkAvatar, esc, ea, eav, readFile,
    // Data helpers
    getSkills, getCerts, mkSkills, mkCourses, mkCoursesForSem, mkProjects, mkModel,
    computePerformanceInsights, animatedSemSwitch,
    // Storage
    getSession, saveSession, clearSession,
    getEdits, saveEdits, clearEdits, clean,
    // Theme
    applySavedTheme, bindThemeToggles,
    bindScrollHideNav
  };

})();
