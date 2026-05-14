/* ============================================================
   mockDb.js — Simulated database for the InkluKids prototype
   ------------------------------------------------------------
   - Seeds users / activities / assignments / messages / announcements
   - Persists to localStorage so refresh keeps state
   - All methods return Promises with a tiny delay so the UI shows
     realistic loading states (input processing checkpoint)
   ============================================================ */

(function (global) {
  const STORAGE_KEY = 'inklukids_proto_v1';
  const SESSION_KEY = 'inklukids_proto_session_v1';
  const LATENCY_MS  = 350;

  // ── Seed data ────────────────────────────────────────────────
  const seed = {
    users: [
      { id: 'u1', name: 'Denyse Ishimirwe', email: 'denyse@gmail.com', password: 'test@123', role: 'teacher', grades: ['P3','P4'] },
      { id: 'u2', name: 'Stacy Mukamana',   email: 'stacy@gmail.com',  password: 'test@123', role: 'teacher', grades: ['P5'] },
      { id: 'u3', name: 'Marie Uwase',      email: 'marie@gmail.com',  password: 'try@123',  role: 'parent',  children: ['u5','u6'] },
      { id: 'u4', name: 'Jean Mugabo',      email: 'j.mugabo@admin.com', password: 'try@123', role: 'admin' },
      { id: 'u5', name: 'Olga Ineza',       email: 'olga@gmail.com',   password: 'try@123',  role: 'child',   grade: 'P3', parentId: 'u3', points: 240 },
      { id: 'u6', name: 'Tiffany Keza',     email: 'tiffany@gmail.com',password: 'try@123',  role: 'child',   grade: 'P4', parentId: 'u3', points: 180 },
    ],
    activities: [
      { id: 'a1', title: 'Daily Greeting Routine',    category: 'Social Skills',     points: 10, grade: 'P3', createdBy: 'u1' },
      { id: 'a2', title: 'Colour Matching Game',      category: 'Cognitive',         points: 15, grade: 'P3', createdBy: 'u1' },
      { id: 'a3', title: 'Storytime: The Lost Bird',  category: 'Language',          points: 20, grade: 'P4', createdBy: 'u1' },
      { id: 'a4', title: 'Calm-down Breathing',       category: 'Emotional',         points: 10, grade: 'P3', createdBy: 'u2' },
      { id: 'a5', title: 'Counting With Beads',       category: 'Math',              points: 15, grade: 'P4', createdBy: 'u2' },
      { id: 'a6', title: 'Picture Communication',     category: 'Communication',     points: 20, grade: 'P5', createdBy: 'u2' },
    ],
    assignments: [
      { id: 'as1', activityId: 'a1', assignedTo: 'u5', assignedBy: 'u1', status: 'completed', dueDate: '2026-05-10', completedAt: '2026-05-09' },
      { id: 'as2', activityId: 'a2', assignedTo: 'u5', assignedBy: 'u1', status: 'in-progress', dueDate: '2026-05-16' },
      { id: 'as3', activityId: 'a3', assignedTo: 'u6', assignedBy: 'u1', status: 'pending',     dueDate: '2026-05-18' },
      { id: 'as4', activityId: 'a4', assignedTo: 'u5', assignedBy: 'u2', status: 'pending',     dueDate: '2026-05-20' },
    ],
    messages: [
      { id: 'm1', from: 'u1', to: 'u3', text: 'Hello! Olga did great on her greeting routine today.',  at: '2026-05-13T09:14:00' },
      { id: 'm2', from: 'u3', to: 'u1', text: 'Thank you so much! She practiced over the weekend.',    at: '2026-05-13T09:22:00' },
      { id: 'm3', from: 'u1', to: 'u3', text: 'Tomorrow we will start the colour matching activity.',  at: '2026-05-13T09:24:00' },
      { id: 'm4', from: 'u2', to: 'u3', text: 'Please review the calm-down breathing video at home.',  at: '2026-05-12T16:10:00' },
    ],
    announcements: [
      { id: 'an1', title: 'Inclusive Education Workshop',    body: 'Join us Saturday for a hands-on workshop on inclusive classrooms.', date: '2026-05-18', authorId: 'u4' },
      { id: 'an2', title: 'New Activities Added',            body: 'Six new activities published for grades P3–P5.',                    date: '2026-05-12', authorId: 'u4' },
    ],
  };

  // ── Storage helpers ──────────────────────────────────────────
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    save(seed);
    return JSON.parse(JSON.stringify(seed));
  }
  function save(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
  }
  function delay(value) {
    return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
  }
  function uid(prefix) { return prefix + Math.random().toString(36).slice(2, 9); }

  // ── Session helpers ──────────────────────────────────────────
  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function setSession(user) {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else      localStorage.removeItem(SESSION_KEY);
  }

  // ── Public API ───────────────────────────────────────────────
  const db = {
    /* ---------- auth ---------- */
    login(email, password) {
      const state = load();
      const user = state.users.find(
        (u) => u.email.toLowerCase() === String(email || '').toLowerCase().trim()
            && u.password === password
      );
      if (!user) return delay(Promise.reject(new Error('Invalid email or password.')));
      const safe = { ...user }; delete safe.password;
      setSession(safe);
      return delay(safe);
    },
    register({ name, email, password, role, grade }) {
      const state = load();
      if (!name || !email || !password || !role) {
        return delay(Promise.reject(new Error('All fields are required.')));
      }
      if (password.length < 6) {
        return delay(Promise.reject(new Error('Password must be at least 6 characters.')));
      }
      if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
        return delay(Promise.reject(new Error('Email already registered.')));
      }
      const user = {
        id: uid('u'),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
        ...(role === 'child' ? { grade: grade || '', points: 0 } : {}),
        ...(role === 'parent' ? { children: [] } : {}),
        ...(role === 'teacher' ? { grades: [] } : {}),
      };
      state.users.push(user);
      save(state);
      const safe = { ...user }; delete safe.password;
      setSession(safe);
      return delay(safe);
    },
    logout() {
      setSession(null);
      return delay(true);
    },
    currentUser() { return getSession(); },

    /* ---------- read ---------- */
    listUsers()         { return delay(load().users.map((u) => { const c = { ...u }; delete c.password; return c; })); },
    listActivities()    { return delay(load().activities); },
    listAssignments()   { return delay(load().assignments); },
    listMessages()      { return delay(load().messages); },
    listAnnouncements() { return delay(load().announcements); },

    /* ---------- write ---------- */
    createActivity({ title, category, points, grade, createdBy }) {
      if (!title || !category) return delay(Promise.reject(new Error('Title and category required.')));
      const state = load();
      const a = { id: uid('a'), title: title.trim(), category, points: Number(points) || 10, grade: grade || 'P3', createdBy };
      state.activities.push(a);
      save(state);
      return delay(a);
    },
    createAssignment({ activityId, assignedTo, assignedBy, dueDate }) {
      if (!activityId || !assignedTo) return delay(Promise.reject(new Error('Activity and learner required.')));
      const state = load();
      const a = { id: uid('as'), activityId, assignedTo, assignedBy, status: 'pending', dueDate: dueDate || null };
      state.assignments.push(a);
      save(state);
      return delay(a);
    },
    completeAssignment(assignmentId) {
      const state = load();
      const as = state.assignments.find((x) => x.id === assignmentId);
      if (!as) return delay(Promise.reject(new Error('Assignment not found.')));
      as.status = 'completed';
      as.completedAt = new Date().toISOString().slice(0, 10);
      // award points to child
      const child = state.users.find((u) => u.id === as.assignedTo);
      const act   = state.activities.find((x) => x.id === as.activityId);
      if (child && act) child.points = (child.points || 0) + (act.points || 0);
      save(state);
      return delay(as);
    },
    sendMessage({ from, to, text }) {
      if (!text || !text.trim()) return delay(Promise.reject(new Error('Message cannot be empty.')));
      const state = load();
      const m = { id: uid('m'), from, to, text: text.trim(), at: new Date().toISOString() };
      state.messages.push(m);
      save(state);
      return delay(m);
    },
    createAnnouncement({ title, body, authorId }) {
      if (!title || !body) return delay(Promise.reject(new Error('Title and body required.')));
      const state = load();
      const a = { id: uid('an'), title: title.trim(), body: body.trim(), date: new Date().toISOString().slice(0, 10), authorId };
      state.announcements.unshift(a);
      save(state);
      return delay(a);
    },
    deleteUser(userId) {
      const state = load();
      state.users = state.users.filter((u) => u.id !== userId);
      save(state);
      return delay(true);
    },

    /* ---------- utils ---------- */
    reset() { reset(); return delay(true); },
  };

  global.MockDB = db;
})(window);
