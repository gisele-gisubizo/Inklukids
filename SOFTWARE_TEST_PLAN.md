# InkluKids — Software Test Plan

**Project:** InkluKids — web platform for autism inclusion in Rwandan schools  
**Document purpose:** Phase 4 — testing goals, scope, test cases (normal paths), and issue tracking  
**Version:** 1.0  
**Last updated:** May 2026  

---

## 1. Goals of testing (and alignment with system requirements)

### 1.1 Overall testing goals

| Goal | Description |
|------|-------------|
| **G1 — Correctness** | Verify that implemented behaviour matches stated requirements for each user role (teacher, parent, child, admin). |
| **G2 — Reliability** | Confirm that critical journeys (authentication, navigation, core CRUD flows) complete without unexpected errors under normal use. |
| **G3 — Security (basic)** | Confirm that unauthenticated users cannot access role dashboards, and that logout ends the session as expected. |
| **G4 — Usability of normal paths** | Confirm that typical “happy path” actions (sign in, open dashboard, complete a primary task, sign out) are achievable with clear feedback. |
| **G5 — Regression awareness** | Provide a repeatable checklist and automated smoke/unit checks so future changes can be re-verified. |

### 1.2 Alignment with system requirements

System requirements are derived from the product scope: *one role-based platform for coordinated support, communication, and progress tracking* between teachers, parents, children, and administrators.

| System requirement (summary) | How testing supports it |
|-------------------------------|-------------------------|
| Teachers: training, monitor learners, assign activities, message parents | Test cases TC-T-* cover training access, assignments/messaging where applicable, and dashboard access. |
| Parents: link children, view assignments, track progress, message teachers | Test cases TC-P-* cover sign-in, linked-child flows, and communication entry points. |
| Children: access activities, complete work, earn points | Test cases TC-C-* cover child login and activity/progress views. |
| Admins: manage users, training visibility, reports | Test cases TC-A-* cover admin access and user directory behaviour. |
| Shared: authentication and role separation | Test cases TC-AUTH-* and TC-SEC-* cover login, registration validation, logout, and session behaviour. |

---

## 2. Features to be tested (scope)

The following **in-scope** features are explicitly identified for manual functional testing. (The standalone file-based prototype under `prototype/` may be tested separately using `prototype/README.md`; this plan focuses on the deployed React + API system.)

| ID | Feature area | Roles | Notes |
|----|----------------|-------|--------|
| F1 | Landing page and navigation to auth | All | Marketing/home → Sign in / Register. |
| F2 | User registration | All selectable roles | Includes validation and successful account creation (normal path). |
| F3 | User login and session restore | All | Valid credentials; optional refresh/session behaviour after reload (environment-dependent). |
| F4 | Logout | All | Session cleared; return to sign-in or home as designed. |
| F5 | Teacher dashboard and primary navigation | Teacher | Sidebar/tabs: dashboard, training, activities, messages, announcements, settings (as implemented). |
| F6 | Parent dashboard and child-related flows | Parent | Assignments visibility, linking/supporting flows as implemented. |
| F7 | Child dashboard | Child | Activities and progress-related views. |
| F8 | Admin dashboard and user management | Admin | User listing/search/filter as implemented. |
| F9 | Activities (view / create / edit / delete as applicable) | Teacher (primary) | Normal CRUD where the UI exposes it. |
| F10 | Assignments | Teacher, Parent, Child | Assign and view/completion normal paths. |
| F11 | Messaging | Teacher, Parent | Thread list and send message (normal path). |
| F12 | Announcements | Teacher, Parent, Admin | View and post (where role allows). |
| F13 | API health / connectivity | All | `GET /health` or equivalent when validating deployment. |

**Out of scope (for this document):** exhaustive security penetration testing, load/stress testing, full cross-browser matrix, and formal accessibility audit — unless required separately by the module.

---

## 3. Test cases (normal / standard use cases)

**Legend:** **P** = Priority (P1 highest). **Type** = Functional unless stated.

### 3.1 Authentication and session

| TC ID | Feature | P | Preconditions | Steps | Expected result |
|-------|---------|---|----------------|-------|------------------|
| TC-AUTH-01 | Landing → Login | P1 | App running; not logged in | Open app URL → click **Sign In** | Login screen visible with email/password fields and primary submit action. |
| TC-AUTH-02 | Login — valid teacher | P1 | Valid teacher account exists | Enter valid email/password → submit sign-in | User is authenticated; **teacher** dashboard (or home tab) loads; user identity shown. |
| TC-AUTH-03 | Login — valid parent | P1 | Valid parent account exists | Enter valid parent credentials → submit | **Parent** dashboard loads. |
| TC-AUTH-04 | Login — valid child | P2 | Valid child account exists | Enter valid child credentials → submit | **Child** dashboard loads. |
| TC-AUTH-05 | Login — valid admin | P2 | Valid admin account exists | Enter valid admin credentials → submit | **Admin** dashboard loads. |
| TC-AUTH-06 | Login — empty fields | P2 | On login screen | Leave fields empty → submit | Clear validation/error message; no dashboard access. |
| TC-AUTH-07 | Login — wrong password | P2 | Known email exists | Enter correct email and wrong password → submit | Authentication fails with a clear error; user remains on login. |
| TC-AUTH-08 | Register — happy path (non-parent) | P2 | Use a **new** email not already registered | Complete registration for teacher/child/admin as applicable → submit | Account created; user lands in appropriate dashboard or confirmation state per implementation. |
| TC-AUTH-09 | Register — parent with child step | P2 | New parent email | Complete step 1 → complete child details → finish registration | Registration completes; parent session behaves as designed. |
| TC-AUTH-10 | Logout | P1 | User is logged in | Use **Log out** from dashboard shell | Session ends; user returns to login or landing; protected routes are no longer accessible without signing in again. |

### 3.2 Teacher — normal workflows

| TC ID | Feature | P | Preconditions | Steps | Expected result |
|-------|---------|---|----------------|-------|------------------|
| TC-T-01 | Dashboard load | P1 | Logged in as teacher | Open default teacher home/dashboard | Key dashboard sections load without error; greeting or summary visible. |
| TC-T-02 | Open training modules | P1 | Logged in as teacher | Navigate to **Training Modules** (or equivalent) | Training list or modules display; opening a module shows content or progress UI. |
| TC-T-03 | Browse activities | P1 | Logged in as teacher | Go to **Activities** | Activity list loads; search/filter (if present) narrows list without errors for a normal query. |
| TC-T-04 | Create activity (normal) | P2 | Logged in as teacher; form available | Fill required fields with valid sample data → save | New activity appears in list or success feedback shown. |
| TC-T-05 | Assign activity to learner | P2 | At least one child user exists; activity exists | Use assign flow: pick child + activity → confirm | Assignment appears for the child/parent view per design. |
| TC-T-06 | Messages — open thread | P2 | Another user exists to message | Open **Messages** → select a thread | Conversation view loads; history visible. |
| TC-T-07 | Messages — send message | P2 | Thread open | Type a short valid message → send | Message appears in thread; no error toast. |
| TC-T-08 | Announcements — view | P2 | Logged in as teacher | Open **Announcements** | List loads; selecting an item shows detail if applicable. |

### 3.3 Parent — normal workflows

| TC ID | Feature | P | Preconditions | Steps | Expected result |
|-------|---------|---|----------------|-------|------------------|
| TC-P-01 | Dashboard load | P1 | Logged in as parent | Open parent dashboard | Assigned items / summary areas load without error. |
| TC-P-02 | View assigned activities | P1 | Teacher has assigned at least one activity | Navigate to assigned activities view | Assigned items visible and match teacher actions. |
| TC-P-03 | Messages with teacher | P2 | Thread exists or can be started | Open messages → send a normal message | Message sends successfully. |
| TC-P-04 | Link child (if exposed) | P2 | Valid child credentials available | Complete “link child” flow with valid child email/password | Child appears as linked; parent sees relevant child data. |

### 3.4 Child — normal workflows

| TC ID | Feature | P | Preconditions | Steps | Expected result |
|-------|---------|---|----------------|-------|------------------|
| TC-C-01 | Dashboard load | P1 | Logged in as child | Open child dashboard | Assigned activities or progress area loads. |
| TC-C-02 | View assigned work | P1 | Assignment exists from teacher | Open assignments/activities view | Assigned activity visible. |
| TC-C-03 | Complete activity (normal) | P2 | In-progress assignment available | Follow complete/submit flow | Status updates and/or points update per implementation. |

### 3.5 Admin — normal workflows

| TC ID | Feature | P | Preconditions | Steps | Expected result |
|-------|---------|---|----------------|-------|------------------|
| TC-A-01 | Dashboard load | P2 | Logged in as admin | Open admin dashboard | Admin shell and navigation load. |
| TC-A-02 | User directory | P2 | Users exist in system | Open user management; use search with a known substring | Matching users appear; clearing search restores broader list. |
| TC-A-03 | Announcement post (if permitted) | P3 | Admin can post | Create announcement with title + body → publish | Announcement visible to intended audience. |

### 3.6 Deployment / API (smoke)

| TC ID | Feature | P | Preconditions | Steps | Expected result |
|-------|---------|---|----------------|-------|------------------|
| TC-OPS-01 | API health | P2 | Backend deployed | `GET /health` (browser or REST client) | JSON indicates service OK (e.g. `ok: true`). |
| TC-OPS-02 | Frontend talks to API | P2 | Correct `REACT_APP_API_BASE` on deploy | Load production site; perform TC-AUTH-02 once | Login succeeds against remote API (not only localhost). |

### 3.7 Automated tests (supplementary)

| TC ID | Description | Command / location |
|-------|-------------|---------------------|
| TC-AUTO-01 | API client unit tests (`apiFetch` success and error paths) | `npm run test:ci` — see `src/api/client.test.js` |
| TC-AUTO-02 | App smoke test (renders without crash; mocked API) | `npm run test:ci` — see `src/App.test.js` |

---

## 4. Tools and methods for tracking issues

### 4.1 Primary tool: GitHub Issues

| Aspect | Practice |
|--------|----------|
| **Repository** | Source code and defects are tracked in the project GitHub repository (see `README.md` for the clone URL). |
| **When to open an issue** | Any defect found during manual test execution (TC-*), failed automated run (`npm run test:ci`), or improvement that affects requirements traceability. |
| **Issue title** | Short, action-oriented (e.g. “Login: error message not shown for empty password on mobile”). |
| **Description** | Steps to reproduce, expected vs actual, browser/OS, role (teacher/parent/child/admin), and **TC ID** if from this plan (e.g. “Fails TC-AUTH-06”). |
| **Labels (recommended)** | `bug`, `enhancement`, `testing`, `priority-p1`, `priority-p2`, `frontend`, `backend`, `blocked`. |
| **Lifecycle** | Open → In progress (assignee + linked PR) → Review → Closed when verified in test/staging. |

### 4.2 Secondary methods

| Method | Use |
|--------|-----|
| **Pull request reviews** | PR description references issue numbers (`Fixes #12`); reviewer re-runs affected TC IDs before merge. |
| **Commit messages** | Reference issue ID for traceability (`#12 fix validation on login form`). |
| **Screenshots / screen recordings** | Attach to GitHub Issues for UI bugs to avoid ambiguity. |

### 4.3 Test execution record (template)

Use this table (copy per sprint or submission) to show what was actually run:

| Date | Tester | Build / URL | TC IDs executed | Pass/Fail | Issue link (if fail) |
|------|--------|-------------|-----------------|------------|------------------------|
| | | | | | |

---

## 5. Traceability summary (for assessors)

| Rubric checkpoint | Where addressed in this document |
|-------------------|-----------------------------------|
| (1) Testing goals clear and aligned with requirements | **Section 1** — goals G1–G5 and mapping table. |
| (2) Features to be tested identified | **Section 2** — table F1–F13. |
| (3) Test cases clear, complete, normal cases | **Section 3** — tables TC-AUTH-*, TC-T-*, TC-P-*, TC-C-*, TC-A-*, TC-OPS-*, TC-AUTO-*. |
| (4) Issue tracking tools/methods | **Section 4** — GitHub Issues workflow + PR + execution log template. |

---

## References

- Product scope and roles: `README.md`  
- Local run and deployment: `README.md` (Local Setup, Vercel, Render)  
- Automated tests: `npm run test:ci`  
