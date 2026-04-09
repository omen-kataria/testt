# Blackline — Student Academic Portal

A minimal, client-side student academic portal built entirely with **vanilla HTML, CSS, and JavaScript**. No frameworks, no build tools, no backend — just clean code that runs in any modern browser.

![License](https://img.shields.io/badge/license-MIT-green)
![Tech](https://img.shields.io/badge/stack-HTML%20%2B%20CSS%20%2B%20JS-black)
![Students](https://img.shields.io/badge/students-52-blue)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Personalized academic snapshot with SGPA, CGPA, rank, and metrics |
| **Profile Editor** | LinkedIn-style structured forms for Education, Experience, and Certifications |
| **Skill Spotlight** | Card-based showcase with radial score rings, metric bars, and highlight badges |
| **Multi-Semester View** | Animated semester switching (Sem 1–6) with smooth fade-slide transitions |
| **Student Directory** | Filterable student cards with semester, skill, and certification filters |
| **Public Profiles** | Shareable profile pages with semester progress, skills, projects, and certs |
| **Dark Mode** | Full dark/light theme toggle with localStorage persistence |
| **Responsive Design** | Mobile-first layout with smooth drawer navigation and adaptive grids |
| **Glassmorphism UI** | Modern glass-panel aesthetics with subtle backdrop blur and soft shadows |
| **Zero Dependencies** | Pure vanilla implementation — no npm, no bundler, no runtime deps |

---

## 📂 Project Structure

```
Up/
├── index.html          # Home page — hero, search, popular tech, skill spotlight
├── login.html          # Authentication page — UID/password login
├── dashboard.html      # Student dashboard — SPA with 6 tabs (profile, marks, etc.)
├── profile.html        # Public student profile — shareable, read-only
├── students.html       # Student directory — filterable card grid
├── style.css           # Complete stylesheet — tokens, components, responsive
├── script.js           # Core logic — routing, rendering, persistence, data builders
├── data.json           # Student data — 52 students with 6 semesters each
└── README.md           # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- A local HTTP server (for `fetch()` to work with `data.json`)

### Running Locally

**Option 1 — Python (recommended):**
```bash
cd Up
python3 -m http.server 8080
# Open http://localhost:8080
```

**Option 2 — Node.js:**
```bash
npx serve .
# Open the URL shown in terminal
```

**Option 3 — VS Code:**
Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension and click "Go Live".

### Login
Use any UID + password pair from `data.json`. Example:
- **UID:** `BCA25124001`
- **Password:** `iWHd3#Ma&N0f`

---

## 🏗️ Architecture

### Data Flow

```
data.json → fetch() → parse → page-specific init function → DOM rendering
                                    ↕
                              localStorage
                          (theme, session, edits)
```

### Page Routing

| Route | Page | Description |
|-------|------|-------------|
| `index.html` | Home | Public landing page with search, stats, spotlight |
| `login.html` | Auth | UID/password login with session creation |
| `dashboard.html` | Dashboard | SPA with hash-based routing (`#profile`, `#academic`, etc.) |
| `profile.html?id=UID` | Profile | Public student profile (read-only, shareable) |
| `students.html` | Directory | Filterable student card grid |

### localStorage Keys

| Key | Purpose | Format |
|-----|---------|--------|
| `blackline-theme` | Dark/light mode preference | `"dark"` or `"light"` |
| `blackline-session` | Active login session | `{ uid, ts }` |
| `blackline-profile-edits` | Per-user profile customizations | `{ [uid]: { displayName, avatarDataUrl, education, ... } }` |

---

## 📐 CSS Architecture

The stylesheet is organized into **45 numbered sections** for easy navigation:

| # | Section | Description |
|---|---------|-------------|
| 1–2 | Tokens & Dark Mode | CSS custom properties (colors, spacing, transitions) |
| 3 | Reset | Box-sizing, font smoothing, overflow control |
| 4 | Decorative | Grid noise overlay, floating orbs |
| 5–6 | Page Transitions | Fade-in/out animations, SPA page switching |
| 7 | Layout | Shell widths, auth grid, dashboard grid |
| 8 | Glassmorphism | Glass panels with backdrop blur |
| 9–10 | Typography | Headings, eyebrows, lead text, section headings |
| 11–12 | Grids & Metrics | Responsive grids, stat tiles, metric cards |
| 13 | Chips & Tags | Skill tags, feature chips |
| 15–16 | Forms & Buttons | Inputs, textareas, primary/secondary buttons |
| 20–21 | Dashboard Header & Nav | Sticky header, hamburger, mobile drawer |
| 24–26 | Cards & Progress | Detail cards, course cards, grade pills, progress bars |
| 28b | Settings Sections | LinkedIn-style structured form sections |
| 36–37 | Popular Tech & Spotlight | Technology grid, skill spotlight cards |
| 38 | Semester Tabs | Tab switching with animated content transitions |
| 42–43 | Responsive | Tablet (≤1080px) and mobile (≤760px) breakpoints |

---

## 🔧 JavaScript Architecture

### Module Structure (IIFE)

The entire app is wrapped in a single IIFE to avoid global pollution:

```javascript
(() => {
  "use strict";
  // All code here
})();
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `boot()` | Entry point — loads data, detects page, calls init |
| `initHome(data)` | Home page: stats, search, spotlight, student body |
| `initLogin(data)` | Auth page: form handling, session creation |
| `initDashboard(data)` | Dashboard: state management, rendering, SPA routing |
| `initProfilePage(data)` | Public profile: read-only rendering |
| `initStudents(data)` | Directory: filtering, pagination, card rendering |
| `mkModel(s, meta, courses, rank, ed)` | Builds display model from student + edits |
| `mkCourses(s)` / `mkCoursesForSem(s, data, semId)` | Generates course data with deterministic scores |
| `mkSkills(s)` | Maps subject codes to human-readable skills |
| `renderSkillSpotlight(data)` | Card-based spotlight with metrics, rings, badges |
| `animatedSemSwitch(grid, tabs, student, data, semId)` | Smooth fade-slide semester transition |
| `populateEditor(st)` | Fills settings form from edits + model |
| `collectEducationEntries()` | Reads structured form data from DOM |
| `bindMobileNav()` | Mobile drawer with open/close/escape/overlay |

### Data Persistence

All user customizations persist via `localStorage`:

- **Theme**: Saved on toggle, applied on every page load
- **Session**: Created on login, cleared on logout
- **Profile edits**: Structured object per UID containing:
  - `displayName`, `headline`, `email`, `phone`, `location`
  - `about`, `skills` (array), `learningFocus`
  - `avatarDataUrl` (base64 data URL — survives page reload)
  - `education` (object or array of objects)
  - `experience` (array of objects)
  - `certificationEdits` (array of objects)

---

## 🎨 Design System

### Color Palette

| Token | Light | Dark |
|-------|-------|------|
| `--bg` | `#f5f5f2` | `#0a0a0a` |
| `--text` | `#111` | `#eee` |
| `--text-muted` | `#777` | `#999` |
| `--accent` | `#111` | `#eee` |
| `--border` | `rgba(0,0,0,.07)` | `rgba(255,255,255,.08)` |

### Typography

- **Font**: Inter (Google Fonts), with system-ui fallback
- **Weights**: 400 (body), 500 (labels), 600 (headings), 700 (titles), 800 (hero)
- **Scale**: `clamp()` fluid sizing from mobile to desktop

### Spacing

- **Base gap**: `0.75rem` between sections
- **Card padding**: `0.75rem–0.85rem` (compact variant)
- **Border radius**: `10px` (sm) → `14px` (md) → `18px` (lg) → `24px` (xl)

---

## 📱 Responsive Breakpoints

| Breakpoint | Target | Key Changes |
|------------|--------|-------------|
| `≤ 1080px` | Tablet | Single-column auth, hamburger nav, 2-col grids |
| `≤ 760px` | Mobile | Full-width drawer, 1-col grids, stacked layouts |

The mobile navigation uses CSS `transform` transitions (not `display` toggle) for smooth open/close animation, with body scroll lock and overlay backdrop.

---

## 🔒 Authentication

Authentication is **client-side only** (demo purposes):

1. User enters UID + password
2. Credentials are matched against `data.json`
3. Session is saved to `localStorage` as `{ uid, ts }`
4. Dashboard reads session on load; redirects to login if missing
5. Logout clears session and redirects to home

> ⚠️ **Note**: This is not production-grade security. Passwords are stored in plain text in the JSON file. This is a demo/portfolio project.

---

## 🛠️ Customization

### Adding Students
Add entries to the `students` array in `data.json` following the existing schema:
```json
{
  "serialNumber": 53,
  "uid": "BCA25124053",
  "loginId": "BCA25124053",
  "password": "yourPassword",
  "name": "STUDENT NAME",
  "sgpa": 7.5,
  "cgpa": 7.2,
  "remark": "PASSED",
  "skills": [...],
  "subjects": [...],
  "semesters": { "1": { "sgpa": 6.8, "remark": "PASSED" }, ... },
  "certifications": [...],
  "education": { ... },
  "experience": [...]
}
```

### Modifying Themes
Edit CSS custom properties in `:root` (light) and `:root[data-theme="dark"]` (dark) at the top of `style.css`.

### Adding Pages
1. Create a new HTML file following the existing structure
2. Set `data-page="your-page"` on the `<body>` tag
3. Add an `else if` branch in the `boot()` function in `script.js`
4. Create your `initYourPage(data)` function

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<p align="center">
  <strong>Blackline</strong> — Built with vanilla HTML, CSS & JavaScript.<br>
  No frameworks. No build tools. Just clean code.
</p>
