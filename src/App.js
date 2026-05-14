import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import lpHero from './assets/lp-diverse/hero.jpg';
import lpWhy from './assets/lp-diverse/why.jpg';
import lpCta from './assets/lp-diverse/cta.jpg';
import lpFeatTraining from './assets/lp-diverse/training.jpg';
import lpFeatProgress from './assets/lp-diverse/progress.jpg';
import lpFeatActivities from './assets/lp-diverse/activities.jpg';
import lpFeatGuides from './assets/lp-diverse/guides.jpg';
import lpFeatMessaging from './assets/lp-diverse/messaging.jpg';
import lpFeatReports from './assets/lp-diverse/reports.jpg';
import lpRoleTeacher from './assets/lp-diverse/role-teacher.jpg';
import lpRoleParent from './assets/lp-diverse/role-parent.jpg';
import lpRoleChild from './assets/lp-diverse/role-child.jpg';
import lpRoleAdmin from './assets/lp-diverse/role-admin.jpg';
import lpDashboardStrip from './assets/lp-diverse/dashboard.jpg';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { apiFetch } from './api/client';

/**
 * Root SPA: client-only routing via `page` state, role dashboards, and `apiFetch` to the API.
 * Major UI areas are separated with section comments (Landing, Auth, Teacher, Parent, …).
 */
const ROLES_WITH_INBOX_NOTIFICATIONS = ['teacher', 'parent', 'admin'];

const Icon = ({ name, size = 20, color = 'currentColor' }) => {
  const icons = {
    home: <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />,
    graduation: <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>,
    chart: <><path d="M18 20V10M12 20V4M6 20v-6" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></>,
    message: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></>,
    users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></>,
    check: <path d="M20 6L9 17l-5-5" />,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    play: <><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></>,
    download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
    puzzle: <><path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" /><line x1="16" y1="8" x2="2" y2="22" /><line x1="17.5" y1="15" x2="9" y2="15" /></>,
    send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    arrow_left: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
    smile: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>,
    award: <><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></>,
    bar_chart: <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>,
    child: <><circle cx="12" cy="6" r="3" /><path d="M9 12h6l1 8H8l1-8z" /></>,
    arrow_right: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// Landing photos: bundled JPEGs in src/assets/lp-diverse (Pexels — replace with your own)
const LP_PHOTOS = {
  hero: lpHero,
  why: lpWhy,
  cta: lpCta,
  training: lpFeatTraining,
  progress: lpFeatProgress,
  activities: lpFeatActivities,
  guides: lpFeatGuides,
  messaging: lpFeatMessaging,
  reports: lpFeatReports,
  roleTeacher: lpRoleTeacher,
  roleParent: lpRoleParent,
  roleChild: lpRoleChild,
  roleAdmin: lpRoleAdmin,
  dashboardCard: lpDashboardStrip,
};

/** Landing-page stroke icon: `d` is SVG path content (same pattern as marketing feature cards). */
const OutlineIcon = ({ d, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const SEED_USERS = [];

function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(SEED_USERS);
  const [accessToken, setAccessToken] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messageNotifs, setMessageNotifs] = useState([]);
  const [announcementNotifs, setAnnouncementNotifs] = useState([]);
  const [messageUnreadTotal, setMessageUnreadTotal] = useState(0);
  const [notifNav, setNotifNav] = useState(null);

  const allNotifs = [...messageNotifs, ...announcementNotifs, ...notifications];
  const unreadCount =
    notifications.filter((n) => !n.read).length
    + messageUnreadTotal
    + announcementNotifs.filter((n) => !n.read).length;

  const markRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setMessageNotifs((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      setMessageUnreadTotal(next.reduce((sum, n) => sum + (n.read ? 0 : (n.unreadCount || 0)), 0));
      return next;
    });
    setAnnouncementNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setMessageNotifs((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      setMessageUnreadTotal(0);
      return next;
    });
    setAnnouncementNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Restore session when a valid httpOnly refresh cookie is already present.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch('/api/auth/refresh', { method: 'POST' });
        if (cancelled) return;
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
          const me = await apiFetch('/api/auth/me', { accessToken: data.accessToken });
          if (cancelled) return;
          if (me?.user?.role) {
            setUser(me.user);
            setPage(me.user.role + '-dashboard');
          }
        }
      } catch {
        /* not logged in */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAuth = (authenticatedUser, isNewRegistration) => {
    if (isNewRegistration) setUsers((prev) => [...prev, authenticatedUser]);
    setUser(authenticatedUser);
    setPage(authenticatedUser.role + '-dashboard');
  };
  const handleLogout = async () => {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch {}
    setAccessToken(null);
    setUser(null);
    setPage('login');
  };
  useEffect(() => {
    if (!accessToken || !user?.role || !ROLES_WITH_INBOX_NOTIFICATIONS.includes(user.role)) {
      setMessageNotifs([]);
      return;
    }
    let cancelled = false;

    async function syncUnreadMessageThreads() {
      try {
        const data = await apiFetch('/api/messages/threads', { accessToken });
        if (cancelled) return;
        const unreadThreads = (data?.threads || []).filter((t) => (t.unreadCount || 0) > 0);
        setMessageNotifs((prev) => {
          const prevReadMap = new Map(prev.map((n) => [n.id, !!n.read]));
          const next = unreadThreads.map((t) => ({
            id: `msg-${t.userId}`,
            text: `New message from ${((t.role || 'user').charAt(0).toUpperCase() + (t.role || 'user').slice(1))} ${t.name}`,
            time: t.lastAt ? new Date(t.lastAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Now',
            read: prevReadMap.get(`msg-${t.userId}`) || false,
            unreadCount: t.unreadCount || 0,
          }));
          setMessageUnreadTotal(next.reduce((sum, n) => sum + (n.read ? 0 : (n.unreadCount || 0)), 0));
          return next;
        });
      } catch {
        if (!cancelled) {
          setMessageNotifs([]);
          setMessageUnreadTotal(0);
        }
      }
    }

    syncUnreadMessageThreads();
    const interval = window.setInterval(syncUnreadMessageThreads, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [accessToken, user?.role]);

  useEffect(() => {
    if (!accessToken || !user?.role || !ROLES_WITH_INBOX_NOTIFICATIONS.includes(user.role)) {
      setAnnouncementNotifs([]);
      return;
    }
    let cancelled = false;

    async function syncRecentAnnouncements() {
      try {
        const data = await apiFetch('/api/announcements', { accessToken });
        if (cancelled) return;
        const items = (data?.announcements || []).slice(0, 8);
        setAnnouncementNotifs((prev) => {
          const prevReadMap = new Map(prev.map((n) => [n.id, !!n.read]));
          return items.map((a) => ({
            id: `ann-${a.id}`,
            text: `Announcement: ${a.title}`,
            time: a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Now',
            read: prevReadMap.has(`ann-${a.id}`) ? !!prevReadMap.get(`ann-${a.id}`) : false,
            targetTab: 'announcements',
          }));
        });
      } catch {
        if (!cancelled) setAnnouncementNotifs([]);
      }
    }

    syncRecentAnnouncements();
    const interval = window.setInterval(syncRecentAnnouncements, 6000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [accessToken, user?.role]);

  const onOpenNotification = (n) => {
    if (!n) return;
    const rawTab = n.targetTab || (String(n.id || '').startsWith('msg-') ? 'messages' : null);
    const mappedTab = rawTab === 'announcements' && user?.role === 'parent' ? 'home' : rawTab;
    setNotifNav({
      tab: mappedTab,
      userId: String(n.id || '').startsWith('msg-') ? String(n.id).replace(/^msg-/, '') : null,
      key: Date.now(),
    });
  };

  const notifProps = { notifications: allNotifs, unreadCount, markRead, markAllRead, onOpenNotification, notifNav };

  if (page === 'home') return <LandingPage go={setPage} />;
  if (page === 'login') return <AuthPage mode="login" go={setPage} users={users} onAuth={handleAuth} setAccessToken={setAccessToken} />;
  if (page === 'register') return <AuthPage mode="register" go={setPage} users={users} onAuth={handleAuth} setAccessToken={setAccessToken} />;
  if (page === 'teacher-dashboard') return <TeacherDashboard user={user} onLogout={handleLogout} accessToken={accessToken} {...notifProps} />;
  if (page === 'parent-dashboard') return <ParentDashboard user={user} onLogout={handleLogout} accessToken={accessToken} {...notifProps} />;
  if (page === 'admin-dashboard') return <AdminDashboard user={user} onLogout={handleLogout} users={users} setUsers={setUsers} accessToken={accessToken} {...notifProps} />;
  if (page === 'child-dashboard') return <ChildDashboard user={user} onLogout={handleLogout} accessToken={accessToken} />;
  return <LandingPage go={setPage} />;
}

/* ─────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────── */
function LandingPage({ go }) {
  const features = [
    { photo: LP_PHOTOS.training, photoAlt: 'Diverse children learning together in a classroom', d: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>, title: 'Teacher Training', desc: 'Six professional development modules on autism inclusion, sensory strategies, and classroom communication.' },
    { photo: LP_PHOTOS.progress, photoAlt: 'Mixed group of students participating in a school lesson', d: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>, title: 'Child Progress', desc: "Track each child's development across communication, social skills, and learning over time." },
    { photo: LP_PHOTOS.activities, photoAlt: 'Teen students of different backgrounds studying together', d: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>, title: 'Structured Activities', desc: 'Curated learning activities tailored for autistic children, designed for both school and home.' },
    { photo: LP_PHOTOS.guides, photoAlt: 'Parent reading with a child at home', d: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>, title: 'Parent Guides', desc: "Practical resources and video tutorials to help parents support their child's growth at home." },
    { photo: LP_PHOTOS.messaging, photoAlt: 'Colleagues collaborating in a meeting', d: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>, title: 'Direct Messaging', desc: 'Secure communication between teachers and parents, no third-party apps needed.' },
    { photo: LP_PHOTOS.reports, photoAlt: 'Students studying and working in a library', d: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>, title: 'School Reports', desc: 'Administrators can monitor usage, training completion, and generate school-wide reports.' },
  ];

  const roles = [
    { photo: LP_PHOTOS.roleTeacher, photoAlt: 'Teacher with a diverse group of young students', label: 'Teachers', d: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>, desc: 'Access training modules, monitor student progress, and communicate with parents.' },
    { photo: LP_PHOTOS.roleParent, photoAlt: 'Family spending time together at home', label: 'Parents', d: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>, desc: "See your child's activities and progress, and stay in touch with their teacher." },
    { photo: LP_PHOTOS.roleChild, photoAlt: 'Children painting and learning together', label: 'Children', d: <><circle cx="12" cy="6" r="3"/><path d="M9 12h6l1 8H8l1-8z"/></>, desc: 'Complete fun activities and earn points in a safe, simple learning space.' },
    { photo: LP_PHOTOS.roleAdmin, photoAlt: 'Team planning in an office', label: 'School Admins', d: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>, desc: 'Manage all accounts, view platform-wide data, and generate school reports.' },
  ];

  const heroStyle = { '--lp-hero-photo': `url(${LP_PHOTOS.hero})` };
  const whyStyle = { '--lp-why-photo': `url(${LP_PHOTOS.why})` };
  const ctaStyle = { '--lp-cta-photo': `url(${LP_PHOTOS.cta})` };

  return (
    <div>
      <nav className="nav">
        <div className="nav-logo">InkluKids</div>
        <div className="nav-right">
          <button className="nav-signin" onClick={() => go('login')}>Sign In</button>
          <button className="nav-start" onClick={() => go('register')}>Get Started</button>
        </div>
      </nav>

      <div className="lp-hero lp-hero-creative" style={heroStyle}>
        <div className="lp-hero-text">
          <span className="lp-tag">Autism Inclusion · Rwanda</span>
          <h1>
            Tools that help<br />
            every child<br />
            <em>thrive at school.</em>
          </h1>
          <p>
            InkluKids gives Rwandan teachers structured training, parents practical guidance,
            and children a place to learn and grow, all in one platform.
          </p>
          <div className="lp-hero-btns">
            <button type="button" className="lp-btn-primary lp-btn-pill" onClick={() => go('register')}>Create Free Account</button>
            <button type="button" className="lp-btn-secondary lp-btn-pill-outline" onClick={() => go('login')}>Sign In</button>
          </div>
        </div>

        <div className="lp-hero-visual">
          <div className="lp-dashboard-preview">
            <div className="ldp-header">
              <span className="ldp-logo-sm">InkluKids</span>
              <div className="ldp-header-right">
                <div className="ldp-dot active" />
                <span className="ldp-user-name">Teacher</span>
              </div>
            </div>
            <div className="ldp-module-banner">
              <img
                className="ldp-module-banner-img"
                src={LP_PHOTOS.dashboardCard}
                alt="Diverse group of children learning together in a classroom"
                width={360}
                height={120}
                decoding="async"
              />
              <div className="ldp-module-banner-shade" />
            </div>
            <div className="ldp-body">
              <div className="ldp-label">Training progress</div>
              <div className="ldp-progress-row">
                <span>Module 3 of 6</span>
                <span className="ldp-pct">50%</span>
              </div>
              <div className="ldp-bar"><div className="ldp-bar-fill" style={{ width: '50%' }} /></div>
              <div className="ldp-divider" />
              <div className="ldp-label">Students</div>
              <div className="ldp-students">
                {[['A', 'Student A', 'ok'], ['B', 'Student B', 'warn'], ['C', 'Student C', 'ok'], ['D', 'Student D', 'ok']].map(([initial, name, status]) => (
                  <div className="ldp-student" key={name}>
                    <div className="ldp-av">{initial}</div>
                    <span className="ldp-sname">{name}</span>
                    <span className={`ldp-status ${status}`}>{status === 'ok' ? 'On track' : 'Check in'}</span>
                  </div>
                ))}
              </div>
              <div className="ldp-divider" />
              <div className="ldp-next">Next: Visual Communication strategies</div>
              <button type="button" className="ldp-resume" onClick={() => go('login')}>Resume Module 3</button>
            </div>
          </div>
          <div className="lp-preview-shadow" />
        </div>
      </div>

      <div className="lp-numbers">
        {[['500+', 'Teachers trained'], ['1,200+', 'Children supported'], ['80+', 'Schools enrolled'], ['6', 'Training modules']].map(([n, l]) => (
          <div className="lp-num-item" key={n}>
            <div className="lp-num">{n}</div>
            <div className="lp-num-label">{l}</div>
          </div>
        ))}
      </div>

      <section className="lp-features">
        <div className="lp-section-head">
          <div className="lp-eyebrow">WHAT YOU GET</div>
          <h2>Everything in one place</h2>
          <p>A complete platform built around the needs of Rwanda&apos;s inclusive education community.</p>
        </div>
        <div className="lp-feat-grid">
          {features.map((f, i) => (
            <div className="lp-feat" key={i}>
              <div
                className="lp-feat-photo"
                style={{ backgroundImage: `url(${f.photo})` }}
                role="img"
                aria-label={f.photoAlt}
              />
              <div className="lp-feat-icon"><OutlineIcon d={f.d} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="lp-why lp-why-creative" style={whyStyle}>
        <div className="lp-why-left">
          <div className="lp-eyebrow">WHY INKLUKIDS</div>
          <h2>Built for Rwanda&apos;s classrooms</h2>
          <p>Most inclusive education tools are designed for the West. InkluKids is built with Rwandan teachers, families, and schools at the centre.</p>
          <ul className="lp-why-list">
            {[
              'Training grounded in Rwandan school realities',
              'Available in English and Kinyarwanda',
              'Designed for low-bandwidth environments',
              'Backed by African Leadership University research',
              'Free to access for all teachers and parents',
            ].map((item, i) => (
              <li key={i}>
                <div className="lp-check">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lp-why-right">
          {[
            { q: 'InkluKids gives me a clear structure for inclusive learning support. The tools are practical and easy to follow.', who: 'Primary school teacher', loc: 'Rwanda', initial: 'T' },
            { q: 'I can support my child at home and follow progress more consistently.', who: 'Parent', loc: 'Rwanda', initial: 'P' },
          ].map((t, i) => (
            <div className="lp-testimonial" key={i}>
              <span className="lp-quote-mark">&ldquo;</span>
              <p>{t.q}</p>
              <footer>
                <div className="lp-t-av">{t.initial}</div>
                <div>
                  <strong>{t.who}</strong>
                  <span>{t.loc}</span>
                </div>
              </footer>
            </div>
          ))}
        </div>
      </div>

      <section className="lp-roles">
        <div className="lp-section-head">
          <div className="lp-eyebrow">WHO IT&apos;S FOR</div>
          <h2>One platform, four roles</h2>
          <p>Each user type gets a tailored dashboard designed for how they use the platform.</p>
        </div>
        <div className="lp-roles-grid">
          {roles.map((r, i) => (
            <div className="lp-role-card" key={i} onClick={() => go('register')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && go('register')}>
              <div
                className="lp-role-photo"
                style={{ backgroundImage: `url(${r.photo})` }}
                role="img"
                aria-label={r.photoAlt}
              />
              <div className="lp-role-icon"><OutlineIcon d={r.d} size={20} /></div>
              <h3>{r.label}</h3>
              <p>{r.desc}</p>
              <button type="button" className="lp-role-btn">Get started</button>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-cta lp-cta-creative" style={ctaStyle}>
        <h2>Ready to build a more inclusive classroom?</h2>
        <p>Join hundreds of Rwandan educators and families<br/> Free to get started.</p>
        <div className="lp-cta-btns">
          <button type="button" className="lp-cta-main lp-btn-pill" onClick={() => go('register')}>Create your free account</button>
          <button type="button" className="lp-cta-ghost lp-btn-pill-outline-light" onClick={() => go('login')}>Sign In</button>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">InkluKids</div>
          <p>Supporting autism inclusion in Rwandan schools.</p>
          <p className="lp-footer-copy">© 2025 InkluKids · African Leadership University</p>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────
   AUTH PAGE
───────────────────────────────────────── */
function AuthPage({ mode, go, users, onAuth, setAccessToken }) {
  const isLogin = mode === 'login';
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'teacher', gradeLevel: '', teachesGrades: '' });
  const [children, setChildren] = useState([{ name: '', age: '', grade: '', diagnosis: '', school: '', notes: '' }]);
  const [error, setError] = useState('');

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(''); };
  const setChild = (i, k, v) => setChildren(p => p.map((c, idx) => idx === i ? { ...c, [k]: v } : c));
  const addChild = () => setChildren(p => [...p, { name: '', age: '', grade: '', diagnosis: '', school: '', notes: '' }]);
  const removeChild = (i) => setChildren(p => p.filter((_, idx) => idx !== i));

  const normalizedEmail = (form.email || '').trim().toLowerCase();
  const normalizedPassword = (form.password || '').trim();
  const normalizedConfirm = (form.confirm || '').trim();
  const normalizedName = (form.name || '').trim();

  const handleStep1 = () => {
    if (!normalizedName || !normalizedEmail || !normalizedPassword || !normalizedConfirm) { setError('Please fill in all fields.'); return; }
    if (!normalizedEmail.includes('@') || normalizedEmail.split('@')[1]?.includes('.') !== true) { setError('Please enter a valid email.'); return; }
    if (normalizedPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (normalizedPassword !== normalizedConfirm) { setError('Passwords do not match.'); return; }
    if (users.find(u => (u.email || '').toLowerCase() === normalizedEmail)) { setError('An account with this email already exists.'); return; }
    if (form.role === 'parent') { setError(''); setStep(2); }
    else {
      apiFetch('/api/auth/register', {
        method: 'POST',
        body: {
          name: normalizedName,
          email: normalizedEmail,
          password: normalizedPassword,
          role: form.role,
          gradeLevel: form.role === 'child' ? (form.gradeLevel || '').trim() : undefined,
          teachesGrades: form.role === 'teacher'
            ? (String(form.teachesGrades || '').split(',').map((s) => s.trim()).filter(Boolean))
            : undefined,
        },
      })
        .then((data) => {
          setAccessToken?.(data.accessToken);
          onAuth({ ...data.user }, true);
        })
        .catch((e) => setError(e.message || 'Registration failed'));
    }
  };
  const handleStep2 = () => {
    if (children.some(c => !c.name.trim())) { setError('Please enter a name for each child.'); return; }
    apiFetch('/api/auth/register', {
      method: 'POST',
      body: { name: normalizedName, email: normalizedEmail, password: normalizedPassword, role: form.role, children },
    })
      .then((data) => {
        setAccessToken?.(data.accessToken);
        onAuth({ ...data.user }, true);
      })
      .catch((e) => setError(e.message || 'Registration failed'));
  };
  const handleLogin = () => {
    if (!normalizedEmail || !normalizedPassword) { setError('Please fill in all fields.'); return; }
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: { email: normalizedEmail, password: normalizedPassword },
    })
      .then((data) => {
        setAccessToken?.(data.accessToken);
        onAuth({ ...data.user }, false);
      })
      .catch((e) => setError(e.message || 'Incorrect email or password.'));
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <button className="auth-back" onClick={() => step === 2 ? setStep(1) : go('home')}>
          <Icon name="arrow_left" size={14} /> {step === 2 ? 'Back' : 'Back to home'}
        </button>
        <div className="auth-brand">InkluKids</div>

        {isLogin && (
          <>
            <h2>Welcome back</h2>
            <p className="auth-sub">Sign in to your account.</p>
            <div className="auth-field"><label>Email</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div className="auth-field"><label>Password</label><input type="password" placeholder="Your password" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} /></div>
            {error && <div className="auth-error">{error}</div>}
            <button className="auth-submit" onClick={handleLogin}>Sign In</button>
            <p className="auth-switch">No account? <span onClick={() => go('register')}>Create one</span></p>
            <div className="auth-demo">
              <div className="auth-demo-title">Tip</div>
              <div style={{ marginTop: 8, lineHeight: 1.6 }}>
                You can type the email in any case (e.g. NAME@EMAIL.COM) and it will still work.
              </div>
            </div>
          </>
        )}

        {!isLogin && step === 1 && (
          <>
            <h2>Create your account</h2>
            <p className="auth-sub">Free to join. No credit card needed.</p>
            <div className="auth-field"><label>Full Name</label><input type="text" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="auth-field"><label>Email</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div className="auth-field">
              <label>I am a</label>
              <div className="auth-roles">
                {[{ v: 'teacher', l: 'Teacher' }, { v: 'parent', l: 'Parent' }, { v: 'child', l: 'Child' }, { v: 'admin', l: 'Admin' }].map(r => (
                  <button key={r.v} className={`auth-role-btn ${form.role === r.v ? 'active' : ''}`} onClick={() => set('role', r.v)}>{r.l}</button>
                ))}
              </div>
            </div>
            {form.role === 'child' && (
              <div className="auth-field">
                <label>Grade / Class level</label>
                <input value={form.gradeLevel} onChange={(e) => set('gradeLevel', e.target.value)} placeholder="e.g. P3, Grade 4, S1" />
              </div>
            )}
            {form.role === 'teacher' && (
              <div className="auth-field">
                <label>Grades you teach</label>
                <input value={form.teachesGrades} onChange={(e) => set('teachesGrades', e.target.value)} placeholder="e.g. P1, P2, P3 (comma-separated)" />
              </div>
            )}
            <div className="auth-field"><label>Password</label><input type="password" placeholder="At least 6 characters" value={form.password} onChange={e => set('password', e.target.value)} /></div>
            <div className="auth-field"><label>Confirm Password</label><input type="password" placeholder="Repeat your password" value={form.confirm} onChange={e => set('confirm', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleStep1()} /></div>
            {error && <div className="auth-error">{error}</div>}
            <button className="auth-submit" onClick={handleStep1}>{form.role === 'parent' ? 'Next — Add child info' : 'Create Account'}</button>
            <p className="auth-switch">Already have an account? <span onClick={() => go('login')}>Sign in</span></p>
          </>
        )}

        {!isLogin && step === 2 && (
          <>
            <h2>About your child</h2>
            <p className="auth-sub">This helps us personalise activities for your family.</p>
            <div className="auth-steps">
              <span className="auth-step done">1. Account</span>
              <span className="auth-step-arrow">→</span>
              <span className="auth-step active">2. Child info</span>
            </div>
            {children.map((child, i) => (
              <div className="auth-child-block" key={i}>
                <div className="auth-child-header">
                  <span>Child {i + 1}</span>
                  {children.length > 1 && <button className="auth-child-remove" onClick={() => removeChild(i)}>Remove</button>}
                </div>
                <div className="auth-field-row">
                  <div className="auth-field"><label>Name *</label><input type="text" placeholder="e.g. Child name" value={child.name} onChange={e => setChild(i, 'name', e.target.value)} /></div>
                  <div className="auth-field"><label>Age</label><input type="number" placeholder="e.g. 7" min="2" max="18" value={child.age} onChange={e => setChild(i, 'age', e.target.value)} /></div>
                </div>
                <div className="auth-field"><label>Grade / Class level</label><input type="text" placeholder="e.g. P3, Grade 4" value={child.grade} onChange={e => setChild(i, 'grade', e.target.value)} /></div>
                <div className="auth-field"><label>School</label><input type="text" placeholder="e.g. Kigali Primary School" value={child.school} onChange={e => setChild(i, 'school', e.target.value)} /></div>
                <div className="auth-field">
                  <label>Support needs</label>
                  <div className="auth-checks">
                    {['Autism Spectrum', 'ADHD', 'Speech Delay', 'Sensory Processing', 'Other'].map(d => (
                      <label key={d} className="auth-check-label">
                        <input type="checkbox" checked={child.diagnosis?.includes(d)} onChange={e => {
                          const cur = child.diagnosis ? child.diagnosis.split(', ').filter(Boolean) : [];
                          setChild(i, 'diagnosis', (e.target.checked ? [...cur, d] : cur.filter(x => x !== d)).join(', '));
                        }} />{d}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="auth-field">
                  <label>Notes <span className="auth-optional">(optional)</span></label>
                  <textarea placeholder="e.g. prefers visual instructions, sensitive to noise…" value={child.notes} onChange={e => setChild(i, 'notes', e.target.value)} rows={3} />
                </div>
              </div>
            ))}
            <button className="auth-add-child" onClick={addChild}>+ Add another child</button>
            {error && <div className="auth-error">{error}</div>}
            <button className="auth-submit" onClick={handleStep2}>Complete Registration</button>
          </>
        )}
      </div>

      <div className="auth-right">
        <div className="auth-right-content">
          <h2 className="ar-headline">Helping every child find their place in the classroom.</h2>
          <div className="ar-stats-row">
            {[['500+', 'Teachers trained'], ['1,200+', 'Children supported'], ['80+', 'Schools']].map(([n, l]) => (
              <div key={n} className="ar-stat">
                <div className="ar-stat-n">{n}</div>
                <div className="ar-stat-l">{l}</div>
              </div>
            ))}
          </div>
          <div className="ar-divider" />
          <div className="ar-quotes">
            {[
              { q: 'InkluKids gives me a clear structure for inclusive learning support. The tools are practical and easy to follow.', who: 'Teacher' },
              { q: 'I can now support my child at home and keep track of progress more consistently.', who: 'Parent' },
            ].map((t, i) => (
              <div key={i} className="ar-quote">
                <p>"{t.q}"</p>
                <span className="ar-quote-by">— {t.who}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   NOTIFICATION PANEL
───────────────────────────────────────── */
function NotifPanel({ notifications, markRead, markAllRead, onOpenNotification, onClose }) {
  return (
    <div className="notif-panel">
      <div className="notif-header">
        <span>Notifications</span>
        <button onClick={markAllRead}>Mark all read</button>
      </div>
      {notifications.map(n => (
        <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => { markRead(n.id); onOpenNotification?.(n); onClose(); }}>
          <div className="notif-dot" style={{ visibility: n.read ? 'hidden' : 'visible' }} />
          <div>
            <div className="notif-text">{n.text}</div>
            <div className="notif-time">{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   DASHBOARD SHELL
───────────────────────────────────────── */
function Shell({ user, onLogout, notifications, unreadCount, markRead, markAllRead, onOpenNotification, navItems, activeTab, setActiveTab, children }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">InkluKids</div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <Icon name={item.icon} size={17} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="s-av">{user?.name?.charAt(0)}</div>
            <div>
              <div className="s-name">{user?.name}</div>
              <div className="s-role">{user?.role}</div>
            </div>
          </div>
          <button className="s-logout" onClick={onLogout} title="Log out"><Icon name="logout" size={16} /></button>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div className="topbar-title">{navItems.find(n => n.id === activeTab)?.label}</div>
          <div className="topbar-right">
            <div className="topbar-search">
              <input placeholder="Search modules, resources, messages..." />
            </div>
            <div className="notif-wrap">
              <button className="icon-btn" onClick={() => setShowNotif(p => !p)}>
                <Icon name="bell" size={19} />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>
              {showNotif && <NotifPanel notifications={notifications} markRead={markRead} markAllRead={markAllRead} onOpenNotification={onOpenNotification} onClose={() => setShowNotif(false)} />}
            </div>
            <div className="topbar-user-wrap" ref={userMenuRef}>
              <button
                type="button"
                className="topbar-user"
                onClick={() => setShowUserMenu((p) => !p)}
                aria-haspopup="menu"
                aria-expanded={showUserMenu}
                aria-label="Open profile menu"
                title="Profile menu"
              >
                <div className="topbar-user-av">{user?.name?.charAt(0)}</div>
                <div>
                  <div className="topbar-user-name">{user?.name}</div>
                  <div className="topbar-user-role">{user?.role === 'admin' ? 'School Admin' : user?.role}</div>
                </div>
              </button>
              {showUserMenu && (
                <div className="topbar-user-menu" role="menu" aria-label="Profile menu">
                  <button
                    type="button"
                    className="topbar-user-menu-item"
                    role="menuitem"
                    onClick={() => {
                      setActiveTab?.('settings');
                      setShowUserMenu(false);
                    }}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    className="topbar-user-menu-item danger"
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout?.();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SHARED DASHBOARD COMPONENTS
───────────────────────────────────────── */
const StatCard = ({ label, value, icon, color }) => (
  <div className="stat-card" style={{ background: color }}>
    <div className="stat-icon"><Icon name={icon} size={19} /></div>
    <div className="stat-val">{value}</div>
    <div className="stat-lbl">{label}</div>
  </div>
);

const ProgressBar = ({ value, color = 'var(--brand)' }) => (
  <div className="pbar-track"><div className="pbar-fill" style={{ width: `${value}%`, background: color }} /></div>
);

const Badge = ({ label, type = 'blue' }) => <span className={`badge ${type}`}>{label}</span>;

function StepEditor({ value, onChange }) {
  return (
    <div className="step-editor">
      {value.map((s, i) => (
        <div key={i} className="step-row">
          <input value={s} onChange={(e) => onChange(value.map((x, idx) => (idx === i ? e.target.value : x)))} placeholder={`Step ${i + 1}`} />
          <button className="btn-sm" type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>Remove</button>
        </div>
      ))}
      <button className="btn-sm" type="button" onClick={() => onChange([...value, ''])}><Icon name="plus" size={14} /> Add step</button>
    </div>
  );
}

function TeacherActivitiesTab({ accessToken }) {
  const [list, setList] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [children, setChildren] = useState([]);
  const [assignChildId, setAssignChildId] = useState('');
  const [draft, setDraft] = useState({ title: '', description: '', icon: 'puzzle', color: '#dbeafe', steps: [''] });
  const [toast, setToast] = useState('');

  const showToast = useCallback((t) => {
    setToast(t);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(''), 1800);
  }, []);

  const load = () => apiFetch('/api/activities/mine', { accessToken }).then(d => setList(d.activities || [])).catch((e) => showToast(e.message || 'Failed to load activities'));
  const loadChildren = () => apiFetch('/api/users/children', { accessToken }).then(d => setChildren(d.children || [])).catch(() => {});

  useEffect(() => {
    if (!accessToken) return;
    load();
    loadChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, showToast]);

  const visible = list.filter(a => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
  });

  const saveDraft = async () => {
    const steps = (draft.steps || []).map(s => s.trim()).filter(Boolean);
    await apiFetch('/api/activities', { method: 'POST', accessToken, body: { ...draft, steps } });
    setShowNew(false);
    setDraft({ title: '', description: '', icon: 'puzzle', color: '#dbeafe', steps: [''] });
    showToast('Activity created');
    load();
  };

  const saveSelected = async () => {
    if (!selected) return;
    const steps = (selected.steps || []).map(s => s.trim()).filter(Boolean);
    await apiFetch(`/api/activities/${selected.id}`, { method: 'PUT', accessToken, body: { ...selected, steps } });
    showToast('Saved');
    setSelected(null);
    load();
  };

  const deleteSelected = async () => {
    if (!selected) return;
    await apiFetch(`/api/activities/${selected.id}`, { method: 'DELETE', accessToken });
    showToast('Deleted');
    setSelected(null);
    load();
  };

  return (
    <div className="page">
      <div className="page-head">
        <h1>Activities</h1>
        <p>Create and manage activities for children to complete.</p>
      </div>

      <div className="filter-row">
        <input className="filter-search" placeholder="Search activities..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn-primary" onClick={() => setShowNew(true)}><Icon name="plus" size={16} /> New activity</button>
      </div>

      <div className="res-grid">
        {visible.map((a) => (
          <div key={a.id} className="res-card">
            <div className="res-top">
              <Badge label="Activity" type="blue" />
              <span className="res-cat">{a.icon} · {a.color}</span>
            </div>
            <div className="res-title">{a.title}</div>
            <div className="res-desc">{a.description}</div>
            <div className="res-actions">
              <button className="btn-sm" onClick={() => setSelected({ ...a, steps: a.steps || [] })}><Icon name="edit" size={13} /> Edit</button>
              <button className="btn-sm" onClick={() => { setAssigning(a); setAssignChildId(children[0]?.id || ''); setShowAssign(true); }}><Icon name="users" size={13} /> Assign</button>
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-title-row">
            <div className="card-title">New activity</div>
            <div className="card-title-actions">
              <button className="btn-sm" onClick={() => setShowNew(false)}>Close</button>
            </div>
          </div>
          <div className="two-col" style={{ gap: 12 }}>
            <div className="auth-field"><label>Title</label><input value={draft.title} onChange={(e) => setDraft(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="auth-field"><label>Icon</label>
              <select value={draft.icon} onChange={(e) => setDraft(p => ({ ...p, icon: e.target.value }))}>
                {['puzzle', 'smile', 'star', 'calendar', 'book', 'activity'].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="auth-field"><label>Description</label><textarea rows={3} value={draft.description} onChange={(e) => setDraft(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="two-col" style={{ gap: 12 }}>
            <div className="auth-field"><label>Card color</label><input value={draft.color} onChange={(e) => setDraft(p => ({ ...p, color: e.target.value }))} placeholder="#dbeafe" /></div>
            <div className="auth-field"><label>Preview</label>
              <div className="activity-preview" style={{ '--acc': draft.color }}>
                <div className="cc-icon"><Icon name={draft.icon} size={28} /></div>
                <div>
                  <div className="cc-title">{draft.title || 'Activity title'}</div>
                  <div className="cc-desc">{draft.description || 'Short description'}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="auth-field"><label>Steps</label><StepEditor value={draft.steps} onChange={(steps) => setDraft(p => ({ ...p, steps }))} /></div>
          <div className="lesson-actions">
            <button className="btn-primary" onClick={saveDraft}><Icon name="check" size={16} /> Create activity</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-title-row">
            <div className="card-title">Edit activity</div>
            <div className="card-title-actions">
              <button className="btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
          <div className="two-col" style={{ gap: 12 }}>
            <div className="auth-field"><label>Title</label><input value={selected.title} onChange={(e) => setSelected(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="auth-field"><label>Icon</label>
              <select value={selected.icon} onChange={(e) => setSelected(p => ({ ...p, icon: e.target.value }))}>
                {['puzzle', 'smile', 'star', 'calendar', 'book', 'activity'].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="auth-field"><label>Description</label><textarea rows={3} value={selected.description} onChange={(e) => setSelected(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="auth-field"><label>Card color</label><input value={selected.color} onChange={(e) => setSelected(p => ({ ...p, color: e.target.value }))} /></div>
          <div className="auth-field"><label>Steps</label><StepEditor value={selected.steps || []} onChange={(steps) => setSelected(p => ({ ...p, steps }))} /></div>
          <div className="res-actions" style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <button className="btn-sm" onClick={deleteSelected}><Icon name="trash" size={13} /> Delete</button>
            <button className="btn-primary" onClick={saveSelected}><Icon name="check" size={16} /> Save</button>
          </div>
        </div>
      )}

      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}

      {showAssign && assigning && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-title-row">
            <div className="card-title">Assign activity</div>
            <div className="card-title-actions">
              <button className="btn-sm" onClick={() => { setShowAssign(false); setAssigning(null); }}>Close</button>
            </div>
          </div>
          <div className="li-sub" style={{ marginBottom: 10 }}>
            Assign <strong>{assigning.title}</strong> to a child.
          </div>
          <div className="auth-field">
            <label>Select child</label>
            <select value={assignChildId} onChange={(e) => setAssignChildId(e.target.value)}>
              {children.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
            </select>
          </div>
          <div className="lesson-actions">
            <button
              className="btn-primary"
              onClick={async () => {
                try {
                  await apiFetch('/api/assignments', { method: 'POST', accessToken, body: { childUserId: assignChildId, activityId: assigning.id } });
                  showToast('Assigned');
                  setShowAssign(false);
                  setAssigning(null);
                } catch (e) {
                  showToast(e.message || 'Assign failed');
                }
              }}
              disabled={!assignChildId}
            >
              <Icon name="check" size={16} /> Assign
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   TEACHER DASHBOARD
───────────────────────────────────────── */
function TeacherDashboard({ user, onLogout, accessToken, ...notifProps }) {
  const [tab, setTab] = useState('home');
  const [trainingOpenTitle, setTrainingOpenTitle] = useState(null);
  const [messageOpenUserId, setMessageOpenUserId] = useState('');
  const nav = [
    { id: 'home', label: 'Dashboard', icon: 'home' },
    { id: 'training', label: 'Training Modules', icon: 'graduation' },
    { id: 'training-assign', label: 'Parent Training', icon: 'book' },
    { id: 'students', label: 'Progress Tracking', icon: 'chart' },
    { id: 'activities', label: 'Activities', icon: 'calendar' },
    { id: 'resources', label: 'Resources', icon: 'book' },
    { id: 'messages', label: 'Messages', icon: 'message' },
    { id: 'announcements', label: 'Announcements', icon: 'bell' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];
  useEffect(() => {
    if (!notifProps?.notifNav?.key) return;
    if (notifProps.notifNav.tab) setTab(notifProps.notifNav.tab);
    if (notifProps.notifNav.userId) setMessageOpenUserId(notifProps.notifNav.userId);
  }, [notifProps?.notifNav]);

  return (
    <Shell user={user} onLogout={onLogout} {...notifProps} navItems={nav} activeTab={tab} setActiveTab={setTab}>
      {tab === 'home' && (
        <TeacherHome
          user={user}
          accessToken={accessToken}
          onOpenTraining={(title) => { setTrainingOpenTitle(title); setTab('training'); }}
        />
      )}
      {tab === 'training' && <TrainingTab openModuleTitle={trainingOpenTitle} onModuleOpened={() => setTrainingOpenTitle(null)} user={user} accessToken={accessToken} />}
      {tab === 'training-assign' && <TrainingAssignmentsTab actorRole="teacher" accessToken={accessToken} />}
      {tab === 'students' && <StudentsTab />}
      {tab === 'activities' && <TeacherActivitiesTab accessToken={accessToken} />}
      {tab === 'resources' && <ResourcesTab />}
      {tab === 'messages' && <MessagesTab user={user} accessToken={accessToken} preferredUserId={messageOpenUserId} />}
      {tab === 'announcements' && <AnnouncementsWorkspace user={user} accessToken={accessToken} />}
      {tab === 'settings' && <SettingsWorkspace user={user} />}
    </Shell>
  );
}

function TeacherHome({ user, accessToken, onOpenTraining }) {
  const [supportRequests, setSupportRequests] = useState([]);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    apiFetch('/api/support/teacher', { accessToken })
      .then((d) => {
        if (!cancelled) setSupportRequests(d.requests || []);
      })
      .catch(() => {
        if (!cancelled) setSupportRequests([]);
      });
    return () => { cancelled = true; };
  }, [accessToken]);

  return (
    <div className="page">
      <div className="page-head">
        <h1>Good morning, {user?.name?.split(' ')[0]}</h1>
        <p>Here is what's happening with your students today.</p>
      </div>
      <div className="stats-row">
        <StatCard label="Students" value="12" icon="users" color="var(--blue-tint)" />
        <StatCard label="Training" value="68%" icon="graduation" color="var(--green-tint)" />
        <StatCard label="Pending" value="3" icon="calendar" color="var(--amber-tint)" />
        <StatCard label="Messages" value="2" icon="message" color="var(--peach-tint)" />
      </div>
      <div className="two-col">
        <div className="card">
          <div className="card-title">Continue Training</div>
          {[{ title: 'Module 3: Visual Communication', pct: 60 }, { title: 'Module 4: Sensory Strategies', pct: 0 }].map((m, i) => (
            <div className="list-item" key={i}>
              <div className="li-body">
                <div className="li-title">{m.title}</div>
                <ProgressBar value={m.pct} />
                <div className="li-sub">{m.pct > 0 ? `${m.pct}% complete` : 'Not started'}</div>
              </div>
              <button className="btn-sm" onClick={() => onOpenTraining?.(m.title)}>{m.pct > 0 ? 'Resume' : 'Start'}</button>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Student Highlights</div>
          {[
            { name: 'Student A', note: 'Great week — completed 4 activities', t: 'green' },
            { name: 'Student B', note: 'Needs check-in — missed 2 sessions', t: 'amber' },
            { name: 'Student C', note: 'Excellent participation today', t: 'green' },
          ].map((s, i) => (
            <div className="list-item" key={i}>
              <div className="li-av">{s.name.charAt(0)}</div>
              <div className="li-body">
                <div className="li-title">{s.name}</div>
                <div className="li-sub">{s.note}</div>
              </div>
              <Badge label={s.t === 'green' ? 'On Track' : 'Check In'} type={s.t} />
            </div>
          ))}
        </div>
      </div>
      <AnnouncementsPanel user={user} accessToken={accessToken} />
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Children asking for help</div>
        {supportRequests.length === 0 ? (
          <div className="li-sub">No recent help requests from children.</div>
        ) : (
          supportRequests.slice(0, 5).map((r) => (
            <div key={r.id} className="list-item">
              <div className="li-av">{(r.childName || 'C').charAt(0)}</div>
              <div className="li-body">
                <div className="li-title">{r.childName}</div>
                <div className="li-sub">{r.message}</div>
              </div>
              <Badge label={r.category} type={r.status === 'seen' ? 'gray' : 'amber'} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AnnouncementsPanel({ user, accessToken }) {
  const [list, setList] = useState([]);
  const canCreate = user?.role === 'teacher' || user?.role === 'admin';

  const load = useCallback((token) => {
    if (!token) return;
    apiFetch('/api/announcements', { accessToken: token })
      .then((d) => setList(d.announcements || []))
      .catch(() => setList([]));
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    load(accessToken);
    const i = window.setInterval(() => load(accessToken), 7000);
    return () => window.clearInterval(i);
  }, [accessToken, load]);

  if (!['teacher', 'parent', 'admin'].includes(user?.role || '')) return null;

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-title-row">
        <div className="card-title">Announcements</div>
        {canCreate && <div className="li-sub">Use the Announcements tab to post.</div>}
      </div>
      {(list || []).length === 0 ? (
        <div className="li-sub">No announcements yet.</div>
      ) : (
        <div className="res-grid">
          {list.slice(0, 6).map((a) => (
            <div key={a.id} className="res-card">
              <div className="res-top">
                <Badge label={a.audience === 'all' ? 'All' : a.audience === 'teachers' ? 'Teachers' : 'Parents'} type="blue" />
                <span className="res-cat">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="res-title">{a.title}</div>
              <div className="res-desc">{a.body}</div>
              <div className="li-sub">By {a.createdBy?.name || 'School'} ({a.createdBy?.role || 'admin'})</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementsWorkspace({ user, accessToken }) {
  const [list, setList] = useState([]);
  const [mine, setMine] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [toast, setToast] = useState('');
  const canCreate = user?.role === 'teacher' || user?.role === 'admin';

  const showToast = useCallback((t) => {
    setToast(t);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(''), 1800);
  }, []);

  const load = useCallback(() => {
    if (!accessToken) return;
    apiFetch('/api/announcements', { accessToken })
      .then((d) => setList(d.announcements || []))
      .catch(() => setList([]));
    if (canCreate) {
      apiFetch('/api/announcements/mine', { accessToken })
        .then((d) => setMine(d.announcements || []))
        .catch(() => setMine([]));
    }
  }, [accessToken, canCreate]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page">
      <div className="page-head"><h1>Announcements</h1><p>School-wide updates for teachers and parents.</p></div>
      {canCreate && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-title">Post announcement</div>
          <div className="auth-field"><label>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Parent Meeting Friday" /></div>
          <div className="auth-field"><label>Message</label><textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your announcement..." /></div>
          <div className="auth-field">
            <label>Audience</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="all">All</option>
              <option value="teachers">Teachers only</option>
              <option value="parents">Parents only</option>
            </select>
          </div>
          <div className="lesson-actions">
            <button
              className="btn-primary"
              onClick={async () => {
                if (!title.trim() || !body.trim() || !accessToken) return;
                try {
                  await apiFetch('/api/announcements', { method: 'POST', accessToken, body: { title: title.trim(), body: body.trim(), audience } });
                  setTitle('');
                  setBody('');
                  showToast('Announcement posted');
                  load();
                } catch (e) {
                  showToast(e.message || 'Post failed');
                }
              }}
              disabled={!title.trim() || !body.trim() || !accessToken}
            >
              <Icon name="plus" size={16} /> Post
            </button>
          </div>
        </div>
      )}
      <div className="card">
        <div className="card-title">Recent announcements</div>
        {list.length === 0 ? (
          <div className="li-sub">No announcements yet.</div>
        ) : (
          <div className="res-grid" style={{ marginTop: 10 }}>
            {list.map((a) => (
              <div key={a.id} className="res-card">
                <div className="res-top">
                  <Badge label={a.audience === 'all' ? 'All' : a.audience === 'teachers' ? 'Teachers' : 'Parents'} type="blue" />
                  <span className="res-cat">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="res-title">{a.title}</div>
                <div className="res-desc">{a.body}</div>
                <div className="li-sub">By {a.createdBy?.name || 'School'} ({a.createdBy?.role || 'admin'})</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {canCreate && mine.length > 0 && <div className="li-sub" style={{ marginTop: 10 }}>You posted {mine.length} announcement(s).</div>}
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}

function TrainingTab({ openModuleTitle, onModuleOpened, user, accessToken }) {
  const [filter, setFilter] = useState('All');
  const [selectedModule, setSelectedModule] = useState(null);
  const [assignedToMe, setAssignedToMe] = useState([]);
  const [modules, setModules] = useState([
    { title: 'Understanding Autism', desc: 'Foundations of autism and inclusive education.', pct: 100, status: 'Completed', duration: '45 mins' },
    { title: 'Inclusive Classroom Setup', desc: 'Design a classroom that works for every learner.', pct: 100, status: 'Completed', duration: '40 mins' },
    { title: 'Visual Communication', desc: 'Using visual cues, schedules, and picture cards.', pct: 60, status: 'In Progress', duration: '35 mins' },
    { title: 'Sensory Strategies', desc: 'Managing sensory sensitivities in the classroom.', pct: 0, status: 'Not Started', duration: '30 mins' },
    { title: 'Behavior Support', desc: 'Positive behavior strategies for autistic children.', pct: 0, status: 'Not Started', duration: '50 mins' },
    { title: 'Parent Collaboration', desc: 'Building strong home-school connections.', pct: 0, status: 'Not Started', duration: '25 mins' },
  ]);
  const TRAINING_VIDEO_LINKS = {
    'Understanding Autism': 'https://youtu.be/N1-Jc1suHT8?si=ecgzQHrG9VZ1pdkl',
    'Inclusive Classroom Setup': 'https://youtu.be/S6MCCiM88tg?si=BMkBkrO_fASBTFPH',
    'Visual Communication': 'https://youtu.be/lpb8XwdtHMI?si=H-xMRHMJOwJz8HD2',
    'Sensory Strategies': 'https://youtu.be/P0Xw035sdAU?si=i8XtvLf77RrzYP2Z',
    'Behavior Support': 'https://www.youtube.com/live/CZxyi698GZU?si=V9PX5sGKAkkl_hRU',
    'Parent Collaboration': 'https://youtu.be/yyagWY5QF2Q?si=j26tlinTWsxC20Wz',
  };
  const toEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    const short = url.match(/youtu\.be\/([^?&/]+)/i);
    if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`;
    const full = url.match(/[?&]v=([^?&/]+)/i);
    if (full?.[1]) return `https://www.youtube.com/embed/${full[1]}`;
    const live = url.match(/youtube\.com\/live\/([^?&/]+)/i);
    if (live?.[1]) return `https://www.youtube.com/embed/${live[1]}`;
    return '';
  };

  const markCompleted = (title) => {
    setModules(p =>
      p.map(m => m.title === title ? { ...m, pct: 100, status: 'Completed' } : m)
    );
    setSelectedModule(null);
    setFilter('All');
  };
  const visible = filter === 'All' ? modules : modules.filter(m => m.status === filter);

  useEffect(() => {
    if (!accessToken || user?.role !== 'teacher') return;
    let cancelled = false;
    apiFetch('/api/training-assignments/mine', { accessToken })
      .then((d) => {
        if (cancelled) return;
        setAssignedToMe(d.assignments || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [accessToken, user?.role]);

  useEffect(() => {
    if (!openModuleTitle) return;
    const m = modules.find(x => x.title === openModuleTitle);
    if (m) setSelectedModule(m);
    onModuleOpened?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModuleTitle]);
  return (
    <div className="page">
      <div className="page-head"><h1>Training Modules</h1><p>Complete all 6 modules to earn your inclusive education certificate.</p></div>
      <div className="filter-row">
        {['All', 'In Progress', 'Completed'].map(tab => (
          <button
            key={tab}
            className={`filter-chip ${filter === tab ? 'active' : ''}`}
            onClick={() => { setFilter(tab); setSelectedModule(null); }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="module-grid">
        {visible.map((m, i) => (
          <div className="res-card module-card" key={i}>
            <div className="res-top"><Badge label={m.status} type={m.status === 'Completed' ? 'green' : m.status === 'In Progress' ? 'blue' : 'gray'} /><span className="res-cat">{m.duration}</span></div>
            <div className="res-title">{m.title}</div>
            <div className="res-desc">{m.desc}</div>
            <ProgressBar value={m.pct} />
            <button className="btn-sm" onClick={() => setSelectedModule(m)}>{m.pct > 0 ? 'Continue' : 'Start'}</button>
          </div>
        ))}
      </div>
      {user?.role === 'teacher' && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-title">Assigned by Admin</div>
          {(assignedToMe || []).length === 0 ? (
            <div className="li-sub">No assigned training from admin yet.</div>
          ) : (
            <div className="res-grid" style={{ marginTop: 10 }}>
              {assignedToMe.map((a) => (
                <div key={a.id} className="res-card">
                  <div className="res-top">
                    <Badge label={a.status === 'completed' ? 'Completed' : 'Assigned'} type={a.status === 'completed' ? 'green' : 'blue'} />
                    <span className="res-cat">By {a.assignedBy?.name || 'Admin'}</span>
                  </div>
                  <div className="res-title">{a.moduleTitle}</div>
                  <div className="res-desc">{a.moduleDescription || 'Training module from admin'}</div>
                  <div className="res-actions">
                    {a.moduleLink && <a className="btn-sm" href={a.moduleLink} target="_blank" rel="noreferrer"><Icon name="play" size={13} /> Open</a>}
                    {a.status !== 'completed' && (
                      <button className="btn-complete" onClick={async () => {
                        try {
                          await apiFetch(`/api/training-assignments/${a.id}/complete`, { method: 'POST', accessToken });
                          const d = await apiFetch('/api/training-assignments/mine', { accessToken });
                          setAssignedToMe(d.assignments || []);
                        } catch {}
                      }}>
                        <span className="btn-complete-dot" aria-hidden><Icon name="check" size={12} color="#fff" /></span>
                        Mark complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {selectedModule && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-title-row">
            <div className="card-title">{selectedModule.title} - Lesson Detail</div>
            <div className="card-title-actions">
              <button className="btn-sm" onClick={() => setSelectedModule(null)}>Close</button>
            </div>
          </div>
          <div className="video-placeholder">
            <div style={{ width: '100%' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Lesson video: {selectedModule.title}</div>
              {toEmbedUrl(TRAINING_VIDEO_LINKS[selectedModule.title]) ? (
                <iframe
                  title={`${selectedModule.title} video`}
                  src={toEmbedUrl(TRAINING_VIDEO_LINKS[selectedModule.title])}
                  style={{ width: '100%', minHeight: 320, border: 0, borderRadius: 10, background: '#000' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div style={{ fontSize: 12, marginBottom: 8 }}>Open the trusted reference/training resource for this module.</div>
              )}
              {TRAINING_VIDEO_LINKS[selectedModule.title] && (
                <a
                  className="btn-primary"
                  href={TRAINING_VIDEO_LINKS[selectedModule.title]}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginTop: 10, display: 'inline-flex' }}
                >
                  <Icon name="play" size={16} /> Open on source
                </a>
              )}
            </div>
          </div>
          <ol className="lesson-steps">
            <li>Watch introduction video</li>
            <li>Read key guidance points</li>
            <li>Apply one strategy in class</li>
            <li>Mark lesson step as complete</li>
          </ol>
          {selectedModule.status !== 'Completed' ? (
            <div className="lesson-actions">
              <button className="btn-complete" onClick={() => markCompleted(selectedModule.title)}>
                <span className="btn-complete-dot" aria-hidden><Icon name="check" size={12} color="#fff" /></span>
                Mark as complete
              </button>
            </div>
          ) : (
            <div className="lesson-actions">
              <span className="badge green">Completed</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StudentsTab() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const students = [
    { name: 'Student A', age: 8, activities: 12, attendance: '90%', status: 'On Track', help: 'Taking turns during group activities' },
    { name: 'Student B', age: 7, activities: 7, attendance: '70%', status: 'Needs Support', help: 'Following visual schedule and staying on task' },
    { name: 'Student C', age: 9, activities: 15, attendance: '95%', status: 'On Track', help: 'Asking for help using words or picture cards' },
    { name: 'Student D', age: 8, activities: 9, attendance: '80%', status: 'On Track', help: 'Managing noise and transitions between tasks' },
  ];

  const visible = students.filter(s => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || s.name.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="page">
      <div className="page-head"><h1>Students</h1><p>Monitor each child's development and participation.</p></div>

      <div className="filter-row">
        <input
          className="filter-search"
          placeholder="Search students..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {['All', 'On Track', 'Needs Support'].map(s => (
          <button
            key={s}
            className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
            onClick={() => { setStatusFilter(s); setSelectedStudent(null); }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="t-head"><span>Student</span><span>Age</span><span>Activities</span><span>Attendance</span><span>Status</span><span>Needs help with</span><span>Action</span></div>
        {visible.map((s, i) => (
          <div className="t-row" key={i}>
            <span className="t-name"><div className="t-av">{s.name.charAt(0)}</div>{s.name}</span>
            <span>{s.age}</span><span>{s.activities}</span><span>{s.attendance}</span>
            <span><Badge label={s.status} type={s.status === 'On Track' ? 'green' : 'amber'} /></span>
            <span className="t-muted">{s.help}</span>
            <span><button className="btn-sm" onClick={() => setSelectedStudent(s)}>View</button></span>
          </div>
        ))}
      </div>

      {selectedStudent && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-title-row">
            <div className="card-title">{selectedStudent.name} — Overview</div>
            <button className="btn-sm" onClick={() => setSelectedStudent(null)}>Close</button>
          </div>
          <div className="student-detail-grid">
            <div className="student-detail-item">
              <div className="student-detail-k">Attendance</div>
              <div className="student-detail-v">{selectedStudent.attendance}</div>
            </div>
            <div className="student-detail-item">
              <div className="student-detail-k">Activities completed</div>
              <div className="student-detail-v">{selectedStudent.activities}</div>
            </div>
            <div className="student-detail-item">
              <div className="student-detail-k">Status</div>
              <div className="student-detail-v">
                <Badge label={selectedStudent.status} type={selectedStudent.status === 'On Track' ? 'green' : 'amber'} />
              </div>
            </div>
            <div className="student-detail-item student-detail-wide">
              <div className="student-detail-k">Needs help with</div>
              <div className="student-detail-v">{selectedStudent.help}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResourcesTab() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState([]);
  const list = [
    { type: 'Guides', title: 'Visual Schedule Templates', cat: 'Classroom', desc: 'Printable daily schedule cards for autistic learners.', url: 'https://www.autismspeaks.org/visual-supports' },
    { type: 'Videos', title: 'Communication Strategies', cat: 'Training', desc: 'Step-by-step video on using AAC devices in class.', url: 'https://www.youtube.com/watch?v=GS9IFwuM_G8' },
    { type: 'Visual Aids', title: 'Sensory Checklist', cat: 'Assessment', desc: 'Identify sensory sensitivities in your students.', url: 'https://www.autismspeaks.org/tool-kit/autism-care-networkair-p-visual-supports-and-autism' },
    { type: 'Lesson Plans', title: 'Inclusive Lesson Plan', cat: 'Classroom', desc: 'Lesson plan template for mixed-ability classrooms.', url: 'https://www.understood.org/en/articles/video-see-udl-in-action-in-the-classroom' },
    { type: 'Videos', title: 'Positive Behavior Support', cat: 'Training', desc: 'Practical strategies for managing behavior.', url: 'https://www.inclusion-europe.eu/inclusive-education-a-short-documentary-about-inclusivity-at-school/' },
    { type: 'Guides', title: 'Parent Communication Guide', cat: 'Communication', desc: 'Tips for effective home-school collaboration.', url: 'https://www.cdc.gov/autism/media/pdfs/ACT-Dev-Beh-Pediatrics-Curriculum.pdf' },
  ];
  const visible = list.filter(r => (filter === 'All' || r.type === filter) && r.title.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="page">
      <div className="page-head"><h1>Resources</h1><p>Visual aids, lesson plans, and guides for your teaching.</p></div>
      <div className="filter-row">
        <input className="filter-search" placeholder="Search resources..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="filter-row">
        {['All', 'Videos', 'Guides', 'Lesson Plans', 'Visual Aids'].map(t => (
          <button key={t} className={`filter-chip ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>{t}</button>
        ))}
      </div>
      <div className="res-grid">
        {visible.map((r, i) => (
          <div className="res-card" key={i}>
            <div className="res-top"><Badge label={r.type} type={r.type === 'Videos' ? 'blue' : r.type === 'Guides' ? 'green' : 'gray'} /><span className="res-cat">{r.cat}</span></div>
            <div className="res-title">{r.title}</div>
            <div className="res-desc">{r.desc}</div>
            <div className="res-actions">
              <button className="btn-sm" onClick={() => setSelected(r)}><Icon name={r.type === 'Videos' ? 'play' : 'download'} size={13} /> {r.type === 'Videos' ? 'View' : 'Download'}</button>
              <button className="btn-sm" onClick={() => setSaved(p => p.includes(r.title) ? p : [...p, r.title])}>
                <Icon name="star" size={13} /> {saved.includes(r.title) ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-title-row">
            <div className="card-title">{selected.title}</div>
            <div className="card-title-actions">
              <button className="btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
          <div className="res-detail-meta">
            <Badge label={selected.type} type={selected.type === 'Videos' ? 'blue' : selected.type === 'Guides' ? 'green' : 'gray'} />
            <span className="res-cat">{selected.cat}</span>
            {saved.includes(selected.title) && <Badge label="Saved" type="green" />}
          </div>
          <p className="res-detail-desc">{selected.desc}</p>

          {selected.type === 'Videos' ? (
            <div className="video-placeholder">
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{selected.title} - Video preview</div>
                <div style={{ fontSize: 12 }}>Open this trusted video/resource in a new tab.</div>
                {selected.url && (
                  <a
                    className="btn-primary"
                    href={selected.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ marginTop: 10, display: 'inline-flex' }}
                  >
                    <Icon name="play" size={16} /> Watch video
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="res-download-box">
              <div className="res-download-title">Download ready</div>
              <div className="res-download-sub">Exported quick reference generated from this resource card.</div>
              {selected.url && (
                <a className="btn-sm" href={selected.url} target="_blank" rel="noreferrer">
                  <Icon name="download" size={14} /> Open source link
                </a>
              )}
              <a
                className="btn-primary"
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(`${selected.title}\n\nCategory: ${selected.cat}\nType: ${selected.type}\n\n${selected.desc}\n`)}`}
                download={`${selected.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.txt`}
              >
                <Icon name="download" size={16} /> Download
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessagesTab({ user, accessToken, preferredUserId }) {
  const [msg, setMsg] = useState('');
  const [threads, setThreads] = useState([]);
  const [activeUserId, setActiveUserId] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showNewPersonPicker, setShowNewPersonPicker] = useState(false);
  const [newPersonQuery, setNewPersonQuery] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('all');
  const [fallback, setFallback] = useState({
    'Parent': [
      { from: 'Teacher', text: 'Your child had a great session and engaged well with the visual schedule.', time: '9:15 AM', mine: false },
      { from: 'You', text: 'Thank you! Could you share what visuals you used?', time: '6:30 PM', mine: true },
      { from: 'Teacher', text: "Of course! I'll send over the picture cards. He loved the colour-coded routine board.", time: '7:02 PM', mine: false },
    ],
  });
  const [activeFallbackName, setActiveFallbackName] = useState('Parent');
  const [usingFallback, setUsingFallback] = useState(false);
  const myLabel = `${(user?.role || 'user').charAt(0).toUpperCase() + (user?.role || 'user').slice(1)} ${user?.name || ''}`.trim();
  const roleLabel = (role) => `${(role || 'user').charAt(0).toUpperCase() + (role || 'user').slice(1)}`;
  const personLabel = (name, role) => `${roleLabel(role)} ${name || ''}`.trim();

  useEffect(() => {
    if (!accessToken) {
      setUsingFallback(true);
      return;
    }
    let cancelled = false;
    const loadThreads = () => apiFetch('/api/messages/threads', { accessToken })
      .then((d) => {
        if (cancelled) return;
        const nextThreads = d.threads || [];
        setThreads(nextThreads);
        // keep user's current chat selected if still available
        setActiveUserId((prev) => {
          if (prev && nextThreads.some((t) => t.userId === prev)) return prev;
          return nextThreads[0]?.userId || '';
        });
        setUsingFallback(false);
      })
      .catch(() => {
        if (!cancelled) setUsingFallback(true);
      });

    loadThreads();
    const interval = window.setInterval(loadThreads, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [accessToken]);

  useEffect(() => {
    if (usingFallback || !accessToken || !activeUserId) return;
    let cancelled = false;
    const loadConversation = () => {
      apiFetch(`/api/messages/with/${activeUserId}`, { accessToken })
        .then((d) => {
          if (!cancelled) setMsgs(d.messages || []);
        })
        .catch(() => {
          if (!cancelled) setMsgs([]);
        });
    };

    loadConversation();
    const interval = window.setInterval(loadConversation, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [activeUserId, accessToken, usingFallback]);

  useEffect(() => {
    if (!preferredUserId || usingFallback) return;
    setActiveUserId(preferredUserId);
  }, [preferredUserId, usingFallback]);

  const send = async () => {
    if (!msg.trim()) return;
    if (usingFallback || !accessToken) {
      setFallback((p) => ({
        ...p,
        [activeFallbackName]: [...(p[activeFallbackName] || []), { from: 'You', text: msg, time: 'Now', mine: true }],
      }));
      setMsg('');
      return;
    }
    if (!activeUserId) return;
    try {
      const text = msg.trim();
      setMsg('');
      const d = await apiFetch(`/api/messages/with/${activeUserId}`, { method: 'POST', accessToken, body: { text } });
      setMsgs((p) => [...p, d.message]);
      // refresh threads preview
      const t = await apiFetch('/api/messages/threads', { accessToken });
      setThreads(t.threads || []);
    } catch {
      // keep input cleared when backend fails to avoid duplicate sends from Enter spam
    }
  };

  const formatTime = (isoOrLabel) => {
    if (!isoOrLabel) return '';
    const d = new Date(isoOrLabel);
    if (Number.isNaN(d.getTime())) return isoOrLabel;
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const activeThread = threads.find((t) => t.userId === activeUserId);
  const conversations = usingFallback
    ? Object.keys(fallback).map((name) => {
      const last = fallback[name][fallback[name].length - 1];
      return { id: name, name, lastText: last?.text || '', lastTime: last?.time || '' };
    })
    : threads.map((t) => ({ id: t.userId, name: t.name, lastText: t.lastText || '', lastTime: formatTime(t.lastAt), unreadCount: t.unreadCount || 0 }));
  const visibleConversations = conversations.filter((c) => {
    if (usingFallback) return c.name.toLowerCase().includes(query.trim().toLowerCase());
    const thread = threads.find((t) => t.userId === c.id);
    const q = query.trim().toLowerCase();
    const matchesQuery = !q
      || c.name.toLowerCase().includes(q)
      || (thread?.role || '').toLowerCase().includes(q)
      || (thread?.email || '').toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || (thread?.role || '') === roleFilter;
    return matchesQuery && matchesRole;
  });
  const activeMsgs = usingFallback ? (fallback[activeFallbackName] || []) : msgs;
  const activeName = usingFallback ? activeFallbackName : (activeThread?.name || 'Messages');
  const activeDisplayName = usingFallback ? activeName : personLabel(activeThread?.name, activeThread?.role);
  const canSend = usingFallback || !!activeUserId;
  const newPersonCandidates = threads.filter((t) => {
    const q = newPersonQuery.trim().toLowerCase();
    const roleOk = newPersonRole === 'all' || t.role === newPersonRole;
    const text = `${t.name || ''} ${t.email || ''} ${t.role || ''}`.toLowerCase();
    return roleOk && (!q || text.includes(q));
  });
  return (
    <div className="page">
      <div className="page-head"><h1>Messages</h1><p>Communicate securely with parents and teachers.</p></div>
      {!usingFallback && (
        <div className="filter-row">
          <button
            className="btn-sm"
            type="button"
            onClick={() => {
              setShowNewPersonPicker((p) => !p);
            }}
            title="Start chat with a new person"
          >
            <Icon name="plus" size={14} /> New person
          </button>
          <input className="filter-search" placeholder="Search by name, email, or role..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All categories</option>
            <option value="parent">Parents</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      )}
      {!usingFallback && showNewPersonPicker && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-title-row">
            <div className="card-title">Start a new conversation</div>
            <div className="card-title-actions">
              <button className="btn-sm" type="button" onClick={() => setShowNewPersonPicker(false)}>Close</button>
            </div>
          </div>
          <div className="filter-row">
            <input className="filter-search" placeholder="Find by name or email..." value={newPersonQuery} onChange={(e) => setNewPersonQuery(e.target.value)} />
            <select value={newPersonRole} onChange={(e) => setNewPersonRole(e.target.value)}>
              <option value="all">All categories</option>
              <option value="parent">Parents</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="chat-list" style={{ marginTop: 8 }}>
            {newPersonCandidates.map((t) => (
              <button
                key={t.userId}
                className={`chat-list-item ${activeUserId === t.userId ? 'active' : ''}`}
                onClick={() => {
                  setActiveUserId(t.userId);
                  setShowNewPersonPicker(false);
                }}
              >
                <div className="chat-list-avatar">{t.name.charAt(0)}</div>
                <div className="chat-list-meta">
                  <div className="chat-list-top">
                    <div className="li-title">{personLabel(t.name, t.role)}</div>
                  </div>
                  <div className="li-sub chat-list-preview">{t.email || 'No email listed'}</div>
                </div>
              </button>
            ))}
            {newPersonCandidates.length === 0 && (
              <div className="li-sub" style={{ padding: 10 }}>No people found for this filter.</div>
            )}
          </div>
        </div>
      )}
      <div className="chat-layout">
        <div className="chat-list">
          {visibleConversations.map((c) => (
            <button
              key={c.id}
              className={`chat-list-item ${(usingFallback ? activeFallbackName === c.name : activeUserId === c.id) ? 'active' : ''}`}
              onClick={() => (usingFallback ? setActiveFallbackName(c.name) : setActiveUserId(c.id))}
            >
              <div className="chat-list-avatar">{c.name.charAt(0)}</div>
              <div className="chat-list-meta">
                <div className="chat-list-top">
                  <div className="li-title">{usingFallback ? c.name : personLabel(c.name, threads.find((t) => t.userId === c.id)?.role)}</div>
                  <div className="chat-list-time">{c.lastTime}</div>
                </div>
                <div className="li-sub chat-list-preview">
                  {c.lastText || (!usingFallback ? (threads.find((t) => t.userId === c.id)?.email || 'Start new chat') : '')}
                </div>
              </div>
              {!usingFallback && c.unreadCount > 0 && <Badge label={String(c.unreadCount)} type="blue" />}
            </button>
          ))}
          {!usingFallback && visibleConversations.length === 0 && (
            <div className="li-sub" style={{ padding: 10 }}>
              No matching person. Try another name/category.
            </div>
          )}
        </div>
        <div className="chat-shell">
          <div className="chat-header">
            <div className="chat-header-title">{activeDisplayName}</div>
            <div className="chat-header-sub">{usingFallback ? 'Secure messaging' : `You are ${myLabel}`}</div>
          </div>
          <div className="chat-msgs">
            {!canSend ? (
              <div className="li-sub" style={{ padding: 12 }}>Select a person from the left to start messaging.</div>
            ) : activeMsgs.length === 0 ? (
              <div className="li-sub" style={{ padding: 12 }}>No messages yet. Say hello to start the conversation.</div>
            ) : activeMsgs.map((m, i) => (
              <div key={i} className={`bwrap ${m.mine ? 'right' : 'left'}`}>
                <div className="bname">{m.mine ? `You (${myLabel})` : (usingFallback ? m.from : activeDisplayName)}</div>
                <div className={`bubble ${m.mine ? 'bmine' : 'btheirs'}`}>{m.text}</div>
                <div className="btime">{usingFallback ? m.time : formatTime(m.createdAt)}</div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message..." disabled={!canSend} />
            <button className="btn-primary" onClick={send} disabled={!canSend}><Icon name="send" size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackTab() {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  if (done) return (
    <div className="page"><div className="feedback-done">
      <Icon name="check" size={44} color="var(--green)" />
      <h2>Thank you for your feedback!</h2>
      <p>Your input helps us improve InkluKids for everyone.</p>
      <button className="btn-primary" onClick={() => { setDone(false); setRating(0); setText(''); }}>Submit Another</button>
    </div></div>
  );
  return (
    <div className="page">
      <div className="page-head"><h1>Give Feedback</h1><p>Help us improve the platform for everyone.</p></div>
      <div className="feedback-card">
        <div className="fb-section">
          <label>How would you rate InkluKids?</label>
          <div className="stars">{[1, 2, 3, 4, 5].map(s => (
            <button key={s} className="star-btn" onClick={() => setRating(s)}>
              <Icon name="star" size={30} color={rating >= s ? '#f59e0b' : '#e5e7eb'} />
            </button>
          ))}</div>
        </div>
        <div className="fb-section">
          <label>What could we improve?</label>
          <textarea placeholder="Share your thoughts, suggestions, or issues..." value={text} onChange={e => setText(e.target.value)} rows={5} />
        </div>
        <button className="btn-primary" onClick={() => { if (rating === 0) return; setDone(true); }}>Submit Feedback</button>
      </div>
    </div>
  );
}

function TrainingAssignmentsTab({ actorRole, accessToken }) {
  const [people, setPeople] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleLink, setModuleLink] = useState('');
  const [toast, setToast] = useState('');

  const showToast = useCallback((t) => {
    setToast(t);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(''), 1800);
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const endpoint = actorRole === 'admin' ? '/api/users/teachers' : '/api/users/parents';
    apiFetch(endpoint, { accessToken })
      .then((d) => {
        const list = actorRole === 'admin' ? (d.teachers || []) : (d.parents || []);
        setPeople(list);
        if (list[0]?.id) setSelectedUserId(list[0].id);
      })
      .catch(() => setPeople([]));
  }, [actorRole, accessToken]);

  const assign = async () => {
    if (!selectedUserId || !moduleTitle.trim()) return;
    try {
      await apiFetch('/api/training-assignments', {
        method: 'POST',
        accessToken,
        body: {
          assigneeUserId: selectedUserId,
          moduleTitle: moduleTitle.trim(),
          moduleDescription: moduleDescription.trim(),
          moduleLink: moduleLink.trim() || undefined,
        },
      });
      setModuleTitle('');
      setModuleDescription('');
      setModuleLink('');
      showToast('Training assigned');
    } catch (e) {
      showToast(e.message || 'Assignment failed');
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <h1>{actorRole === 'admin' ? 'Assign Teacher Training' : 'Assign Parent Training'}</h1>
        <p>{actorRole === 'admin' ? 'Admin assigns training modules to teachers.' : 'Teacher assigns guidance modules to parents.'}</p>
      </div>
      <div className="card">
        <div className="auth-field">
          <label>{actorRole === 'admin' ? 'Select teacher' : 'Select parent'}</label>
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
            {people.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
          </select>
        </div>
        <div className="auth-field"><label>Module title</label><input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="e.g. Visual Communication Basics" /></div>
        <div className="auth-field"><label>Description</label><textarea rows={3} value={moduleDescription} onChange={(e) => setModuleDescription(e.target.value)} placeholder="What they should learn from this module" /></div>
        <div className="auth-field"><label>Resource/video link (optional)</label><input value={moduleLink} onChange={(e) => setModuleLink(e.target.value)} placeholder="https://..." /></div>
        <div className="lesson-actions">
          <button className="btn-primary" onClick={assign} disabled={!selectedUserId || !moduleTitle.trim()}>
            <Icon name="plus" size={16} /> Assign training
          </button>
        </div>
      </div>
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────
   PARENT DASHBOARD
───────────────────────────────────────── */
function ParentDashboard({ user, onLogout, accessToken, ...notifProps }) {
  const [tab, setTab] = useState('home');
  const [messageOpenUserId, setMessageOpenUserId] = useState('');
  const [linkedChildren, setLinkedChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const nav = [
    { id: 'home', label: 'Dashboard', icon: 'home' },
    { id: 'training', label: 'Training', icon: 'graduation' },
    { id: 'progress', label: 'Progress Tracking', icon: 'chart' },
    { id: 'assigned', label: 'Assigned', icon: 'check' },
    { id: 'resources', label: 'Resource Library', icon: 'book' },
    { id: 'messages', label: 'Messages', icon: 'message' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];
  useEffect(() => {
    if (!notifProps?.notifNav?.key) return;
    if (notifProps.notifNav.tab) setTab(notifProps.notifNav.tab);
    if (notifProps.notifNav.userId) setMessageOpenUserId(notifProps.notifNav.userId);
  }, [notifProps?.notifNav]);

  const loadLinkedChildren = useCallback(() => {
    if (!accessToken) return;
    apiFetch('/api/users/me/linked-children', { accessToken })
      .then((d) => {
        const list = d.children || [];
        setLinkedChildren(list);
        if (!selectedChildId && list.length > 0) setSelectedChildId(list[0].id);
        if (selectedChildId && !list.some((c) => c.id === selectedChildId)) {
          setSelectedChildId(list[0]?.id || '');
        }
      })
      .catch(() => {
        setLinkedChildren([]);
        setSelectedChildId('');
      });
  }, [accessToken, selectedChildId]);

  useEffect(() => { loadLinkedChildren(); }, [loadLinkedChildren]);

  const selectedChild = linkedChildren.find((c) => c.id === selectedChildId) || null;

  return (
    <Shell user={user} onLogout={onLogout} {...notifProps} navItems={nav} activeTab={tab} setActiveTab={setTab}>
      {tab === 'home' && (
        <ParentHome
          user={user}
          accessToken={accessToken}
          linkedChildren={linkedChildren}
          selectedChildId={selectedChildId}
          setSelectedChildId={setSelectedChildId}
          onGoProgress={() => setTab('progress')}
          onGoResources={() => setTab('resources')}
          onGoMessages={() => setTab('messages')}
        />
      )}
      {tab === 'training' && <ParentTrainingTab accessToken={accessToken} />}
      {tab === 'progress' && (
        <ProgressTab
          mode="parent"
          linkedChildren={linkedChildren}
          selectedChildId={selectedChildId}
          setSelectedChildId={setSelectedChildId}
          childProgress={selectedChild?.progress || null}
        />
      )}
      {tab === 'assigned' && <ParentAssignedTab accessToken={accessToken} />}
      {tab === 'resources' && <ResourcesTab />}
      {tab === 'messages' && <MessagesTab user={user} accessToken={accessToken} preferredUserId={messageOpenUserId} />}
      {tab === 'settings' && <SettingsWorkspace user={user} />}
    </Shell>
  );
}

function ChildPicker({ linkedChildren, selectedChildId, setSelectedChildId, label = 'Child' }) {
  if (!linkedChildren || linkedChildren.length === 0) return null;
  if (linkedChildren.length === 1) return (
    <div className="li-sub" style={{ marginTop: 6 }}>
      {label}: <strong>{linkedChildren[0].name}</strong>
    </div>
  );
  return (
    <div className="auth-field" style={{ marginTop: 10, maxWidth: 360 }}>
      <label>{label}</label>
      <select value={selectedChildId} onChange={(e) => setSelectedChildId?.(e.target.value)}>
        {linkedChildren.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}

function ParentHome({ user, accessToken, linkedChildren, selectedChildId, setSelectedChildId, onGoProgress, onGoResources, onGoMessages }) {
  const selectedChild = (linkedChildren || []).find((c) => c.id === selectedChildId) || linkedChildren?.[0] || null;
  return (
    <div className="page">
      <div className="page-head">
        <h1>Hello, {user?.name?.split(' ')[0]}</h1>
        {(!linkedChildren || linkedChildren.length === 0) ? (
          <p>
            Link your child account in <strong>Assigned</strong> to see assignments and progress.
          </p>
        ) : (
          <p>Viewing updates for <strong>{selectedChild?.name || 'your child'}</strong>.</p>
        )}
        <ChildPicker linkedChildren={linkedChildren} selectedChildId={selectedChildId} setSelectedChildId={setSelectedChildId} />
      </div>
      <div className="quick-actions">
        <button className="btn-sm" onClick={onGoProgress}><Icon name="chart" size={14} /> Progress</button>
        <button className="btn-sm" onClick={onGoResources}><Icon name="book" size={14} /> Resources</button>
        <button className="btn-sm" onClick={onGoMessages}><Icon name="message" size={14} /> Messages</button>
      </div>
      <div className="stats-row">
        <StatCard label="Activities Done" value="8" icon="check" color="var(--green-tint)" />
        <StatCard label="This Week" value="3" icon="calendar" color="var(--blue-tint)" />
        <StatCard label="School Progress" value="Good" icon="chart" color="var(--amber-tint)" />
        <StatCard label="New Resources" value="4" icon="book" color="var(--peach-tint)" />
      </div>
      <div className="two-col">
        <div className="card">
          <div className="card-title-row">
            <div className="card-title">Latest from Teacher</div>
            <button className="btn-sm" onClick={onGoMessages}>Message</button>
          </div>
          <div className="teacher-note">
            <div className="tn-av">T</div>
            <div>
              <div className="tn-name">Teacher</div>
              <p className="tn-text">"Your child is making steady progress. Keep practicing the assigned visual activities at home."</p>
              <div className="tn-time">Yesterday at 4:30 PM</div>
            </div>
          </div>
        </div>
      </div>
      <AnnouncementsPanel user={user} accessToken={accessToken} />
    </div>
  );
}

function ParentTrainingTab({ accessToken }) {
  const [list, setList] = useState([]);
  const [toast, setToast] = useState('');
  const showToast = useCallback((t) => {
    setToast(t);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(''), 1800);
  }, []);

  const load = useCallback(() => {
    if (!accessToken) return;
    apiFetch('/api/training-assignments/mine', { accessToken })
      .then((d) => setList(d.assignments || []))
      .catch((e) => showToast(e.message || 'Failed to load training assignments'));
  }, [accessToken, showToast]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page">
      <div className="page-head"><h1>My training modules</h1><p>Modules assigned by your teacher.</p></div>
      {list.length === 0 ? (
        <div className="card"><div className="li-sub">No training assigned yet.</div></div>
      ) : (
        <div className="res-grid">
          {list.map((a) => (
            <div key={a.id} className="res-card">
              <div className="res-top">
                <Badge label={a.status === 'completed' ? 'Completed' : 'Assigned'} type={a.status === 'completed' ? 'green' : 'blue'} />
                <span className="res-cat">By {a.assignedBy?.name || 'Teacher'}</span>
              </div>
              <div className="res-title">{a.moduleTitle}</div>
              <div className="res-desc">{a.moduleDescription || 'Parent guidance module'}</div>
              <div className="res-actions">
                {a.moduleLink && <a className="btn-sm" href={a.moduleLink} target="_blank" rel="noreferrer"><Icon name="play" size={13} /> Open</a>}
                {a.status !== 'completed' && (
                  <button className="btn-complete" onClick={async () => {
                    try {
                      await apiFetch(`/api/training-assignments/${a.id}/complete`, { method: 'POST', accessToken });
                      load();
                    } catch {}
                  }}>
                    <span className="btn-complete-dot" aria-hidden><Icon name="check" size={12} color="#fff" /></span>
                    Mark complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}

function ChildAnnouncementsPanel({ accessToken }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    apiFetch('/api/announcements', { accessToken })
      .then((d) => {
        if (!cancelled) setList(d.announcements || []);
      })
      .catch(() => {
        if (!cancelled) setList([]);
      });
    return () => { cancelled = true; };
  }, [accessToken]);

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <div className="card-title">Announcements</div>
      {list.length === 0 ? (
        <div className="li-sub">No announcements yet.</div>
      ) : (
        list.slice(0, 3).map((a) => (
          <div className="list-item" key={a.id}>
            <div className="li-body">
              <div className="li-title">{a.title}</div>
              <div className="li-sub">{a.body}</div>
            </div>
            <span className="li-sub">{new Date(a.createdAt).toLocaleDateString()}</span>
          </div>
        ))
      )}
    </div>
  );
}

function ParentAssignedTab({ accessToken }) {
  const [childEmail, setChildEmail] = useState('');
  const [childPassword, setChildPassword] = useState('');
  const [toast, setToast] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [linkedChildren, setLinkedChildren] = useState([]);

  const showToast = useCallback((t) => {
    setToast(t);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(''), 1800);
  }, []);

  const load = useCallback(() => {
    if (!accessToken) return;
    apiFetch('/api/assignments/parent', { accessToken })
      .then((d) => setAssignments(d.assignments || []))
      .catch((e) => showToast(e.message || 'Failed to load assignments'));
  }, [accessToken, showToast]);

  const loadLinked = useCallback(() => {
    if (!accessToken) return;
    apiFetch('/api/users/me/linked-children', { accessToken })
      .then((d) => setLinkedChildren(d.children || []))
      .catch(() => setLinkedChildren([]));
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadLinked(); }, [loadLinked]);

  const link = async () => {
    try {
      await apiFetch('/api/assignments/parent/link-child', { method: 'POST', accessToken, body: { childEmail, childPassword } });
      setChildEmail('');
      setChildPassword('');
      showToast('Child linked');
      load();
      loadLinked();
    } catch (e) {
      showToast(e?.data?.message || e.message || 'Link failed');
    }
  };

  return (
    <div className="page">
      <div className="page-head"><h1>Assigned activities</h1><p>See what your child has been assigned by the teacher.</p></div>

      <div className="card">
        <div className="card-title">Link your child account</div>
        <div className="li-sub" style={{ marginBottom: 12 }}>
          This links an existing <strong>Child</strong> account (child email + password). If you only added child info during parent registration, first create a child account from <strong>Create account → Child</strong>, then come back here to link it.
        </div>
        <div className="two-col" style={{ gap: 12 }}>
          <div className="auth-field"><label>Child email</label><input value={childEmail} onChange={(e) => setChildEmail(e.target.value)} placeholder="child@example.com" /></div>
          <div className="auth-field"><label>Child password</label><input value={childPassword} onChange={(e) => setChildPassword(e.target.value)} type="password" placeholder="Child password" /></div>
        </div>
        <div className="lesson-actions">
          <button className="btn-primary" onClick={link} disabled={!childEmail.trim() || !childPassword.trim()}><Icon name="check" size={16} /> Link child</button>
        </div>
        {linkedChildren.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div className="card-title" style={{ fontSize: 14 }}>Linked children</div>
            {linkedChildren.map((c) => (
              <div className="list-item" key={c.id}>
                <div className="li-body">
                  <div className="li-title">{c.name}{c.gradeLevel ? <span className="li-sub"> · {c.gradeLevel}</span> : null}</div>
                  <div className="li-sub">{c.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Assignments</div>
        {assignments.length === 0 ? (
          <div className="li-sub">No assignments yet.</div>
        ) : (
          <div className="table-card" style={{ marginTop: 12 }}>
            <div className="t-head" style={{ gridTemplateColumns: '1.5fr 2fr 1fr 1fr' }}>
              <span>Child</span><span>Activity</span><span>Status</span><span>Assigned</span>
            </div>
            {assignments.map((a) => (
              <div className="t-row" key={a.id} style={{ gridTemplateColumns: '1.5fr 2fr 1fr 1fr' }}>
                <span className="t-name"><div className="t-av">{a.child.name.charAt(0)}</div>{a.child.name}</span>
                <span>{a.activity.title}</span>
                <span><Badge label={a.status} type={a.status === 'completed' ? 'green' : 'blue'} /></span>
                <span className="t-muted">{new Date(a.assignedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}

function ProgressTab({ mode = 'child', linkedChildren, selectedChildId, setSelectedChildId, childProgress }) {
  if (mode === 'parent') {
    const points = childProgress?.points || 0;
    const completed = childProgress?.completedActivityIds?.length || 0;
    const last = childProgress?.lastCompletedAt ? new Date(childProgress.lastCompletedAt).toLocaleString() : '—';
    return (
      <div className="page">
        <div className="page-head">
          <h1>Progress Tracking</h1>
          <p>Switch between children to view their progress.</p>
          <ChildPicker linkedChildren={linkedChildren} selectedChildId={selectedChildId} setSelectedChildId={setSelectedChildId} label="Select child" />
          {(!linkedChildren || linkedChildren.length === 0) && (
            <div className="li-sub" style={{ marginTop: 10 }}>
              No linked child accounts yet. Go to <strong>Assigned</strong> and link your child’s login.
            </div>
          )}
        </div>
        <div className="stats-row">
          <StatCard label="Total points" value={String(points)} icon="chart" color="var(--blue-tint)" />
          <StatCard label="Activities completed" value={String(completed)} icon="check" color="var(--green-tint)" />
          <StatCard label="Last activity" value={last} icon="calendar" color="var(--amber-tint)" />
          <StatCard label="Overall" value={points >= 80 ? 'Excellent' : points >= 40 ? 'Good' : 'Getting started'} icon="spark" color="var(--peach-tint)" />
        </div>
      </div>
    );
  }

  const weeklyProgress = [
    { week: 'W1', score: 45 },
    { week: 'W2', score: 56 },
    { week: 'W3', score: 63 },
    { week: 'W4', score: 72 },
  ];
  const activities = [
    { name: 'Visual cards', done: 8 },
    { name: 'Reading', done: 5 },
    { name: 'Interactive', done: 7 },
  ];
  const reportText =
    `Progress Report\n\nWeekly Progress Score:\n` +
    weeklyProgress.map(w => `- ${w.week}: ${w.score}%`).join('\n') +
    `\n\nActivities Completed:\n` +
    activities.map(a => `- ${a.name}: ${a.done}`).join('\n') +
    `\n`;
  return (
    <div className="page">
      <div className="page-head"><h1>Progress Tracking</h1><p>Monitor your child's recent progress trends and completed activities.</p></div>
      <div className="prog-grid">
        <div className="prog-card">
          <div className="pc-head"><h3>Weekly Progress Score</h3><span className="pc-pct">72%</span></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(136,146,176,0.25)" />
                <XAxis dataKey="week" stroke="#8892b0" />
                <YAxis stroke="#8892b0" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="prog-card">
          <div className="pc-head"><h3>Activities Completed</h3><span className="pc-pct">20</span></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activities}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(136,146,176,0.25)" />
                <XAxis dataKey="name" stroke="#8892b0" />
                <YAxis stroke="#8892b0" />
                <Tooltip />
                <Bar dataKey="done" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <a
        className="btn-primary"
        href={`data:text/plain;charset=utf-8,${encodeURIComponent(reportText)}`}
        download="progress_report.txt"
      >
        Download Report
      </a>
    </div>
  );
}

function SettingsWorkspace({ user }) {
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNext, setPwNext] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  const [prefs, setPrefs] = useState({
    messages: true,
    progress: true,
    resources: true,
  });
  const [prefsSaved, setPrefsSaved] = useState(false);

  const [language, setLanguage] = useState('english');
  const [langSaved, setLangSaved] = useState(false);

  return (
    <div className="page">
      <div className="page-head"><h1>Settings</h1><p>Manage your profile, notifications, and preferences.</p></div>
      <div className="two-col">
        <div className="card">
          <div className="card-title-row">
            <div className="card-title">Profile</div>
            {profileSaved && <Badge label="Saved" type="green" />}
          </div>
          <div className="auth-field"><label>Full Name</label><input value={profileName} onChange={(e) => { setProfileName(e.target.value); setProfileSaved(false); }} /></div>
          <div className="auth-field"><label>Email</label><input value={profileEmail} onChange={(e) => { setProfileEmail(e.target.value); setProfileSaved(false); }} /></div>
          <button className="btn-sm" onClick={() => setProfileSaved(true)}>Save Profile</button>
        </div>
        <div className="card">
          <div className="card-title-row">
            <div className="card-title">Change Password</div>
            {pwSaved && <Badge label="Updated" type="green" />}
          </div>
          <div className="auth-field"><label>Current Password</label><input value={pwCurrent} onChange={(e) => { setPwCurrent(e.target.value); setPwSaved(false); }} type="password" placeholder="Current password" /></div>
          <div className="auth-field"><label>New Password</label><input value={pwNext} onChange={(e) => { setPwNext(e.target.value); setPwSaved(false); }} type="password" placeholder="New password" /></div>
          <button
            className="btn-sm"
            onClick={() => {
              if (!pwCurrent.trim() || !pwNext.trim()) return;
              setPwCurrent('');
              setPwNext('');
              setPwSaved(true);
            }}
          >
            Update Password
          </button>
        </div>
      </div>
      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-title-row">
            <div className="card-title">Notification Preferences</div>
            {prefsSaved && <Badge label="Saved" type="green" />}
          </div>
          <label className="toggle-row">
            <span className="toggle-body">
              <span className="toggle-title">Messages</span>
              <span className="toggle-sub">Email and in-app alerts</span>
            </span>
            <input type="checkbox" checked={prefs.messages} onChange={() => { setPrefs(p => ({ ...p, messages: !p.messages })); setPrefsSaved(false); }} />
          </label>
          <label className="toggle-row">
            <span className="toggle-body">
              <span className="toggle-title">Progress Updates</span>
              <span className="toggle-sub">Student updates and reminders</span>
            </span>
            <input type="checkbox" checked={prefs.progress} onChange={() => { setPrefs(p => ({ ...p, progress: !p.progress })); setPrefsSaved(false); }} />
          </label>
          <label className="toggle-row">
            <span className="toggle-body">
              <span className="toggle-title">Resource Alerts</span>
              <span className="toggle-sub">New guides and lesson plans</span>
            </span>
            <input type="checkbox" checked={prefs.resources} onChange={() => { setPrefs(p => ({ ...p, resources: !p.resources })); setPrefsSaved(false); }} />
          </label>
          <button className="btn-sm" onClick={() => setPrefsSaved(true)}>Save Preferences</button>
        </div>
        <div className="card">
          <div className="card-title-row">
            <div className="card-title">Language</div>
            {langSaved && <Badge label="Saved" type="green" />}
          </div>
          <div className="auth-field">
            <label>Preferred Language</label>
            <select value={language} onChange={(e) => { setLanguage(e.target.value); setLangSaved(false); }}>
              <option value="english">English</option>
              <option value="kinyarwanda">Kinyarwanda (Coming soon)</option>
            </select>
          </div>
          <button className="btn-sm" onClick={() => setLangSaved(true)}>Save Language</button>
        </div>
      </div>
    </div>
  );
}

function ChildMiniActivity({ activity, onSuccess }) {
  const [state, setState] = useState({});
  const title = String(activity?.title || '').toLowerCase();

  if (title.includes('color')) {
    const target = 'green';
    const options = ['red', 'blue', 'green', 'yellow'];
    return (
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-title">Mini game: Color Match</div>
        <div className="li-sub">Tap the color: <strong>{target.toUpperCase()}</strong></div>
        <div className="res-actions" style={{ marginTop: 10 }}>
          {options.map((c) => (
            <button
              key={c}
              className="btn-sm"
              style={{ background: c, color: c === 'yellow' ? '#111' : '#fff', borderColor: 'transparent' }}
              onClick={() => {
                const ok = c === target;
                setState({ ok });
                if (ok) onSuccess?.();
              }}
            >
              {c}
            </button>
          ))}
        </div>
        {state.ok === true && <div className="li-sub" style={{ marginTop: 8 }}>Great! You matched the right color.</div>}
        {state.ok === false && <div className="li-sub" style={{ marginTop: 8 }}>Try again - you can do it.</div>}
      </div>
    );
  }

  if (title.includes('feel')) {
    const target = 'Happy';
    const options = ['Happy', 'Sad', 'Tired', 'Excited'];
    return (
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-title">Mini game: How do I feel?</div>
        <div className="li-sub">Choose the feeling shown in class activity: <strong>{target}</strong></div>
        <div className="res-actions" style={{ marginTop: 10 }}>
          {options.map((o) => (
            <button key={o} className="btn-sm" onClick={() => {
              const ok = o === target;
              setState({ ok });
              if (ok) onSuccess?.();
            }}>{o}</button>
          ))}
        </div>
        {state.ok === true && <div className="li-sub" style={{ marginTop: 8 }}>Nice choice!</div>}
      </div>
    );
  }

  if (title.includes('count')) {
    const target = 6;
    const options = [4, 5, 6, 7];
    return (
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-title">Mini game: Count with me</div>
        <div className="li-sub">How many stars do you see? {'⭐'.repeat(target)}</div>
        <div className="res-actions" style={{ marginTop: 10 }}>
          {options.map((o) => (
            <button key={o} className="btn-sm" onClick={() => {
              const ok = o === target;
              setState({ ok });
              if (ok) onSuccess?.();
            }}>{o}</button>
          ))}
        </div>
        {state.ok === true && <div className="li-sub" style={{ marginTop: 8 }}>Correct! Great counting.</div>}
      </div>
    );
  }

  if (title.includes('story')) {
    return (
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-title">Mini activity: Story time</div>
        <div className="li-sub">Read the short sentence and answer:</div>
        <div className="res-desc" style={{ marginTop: 8 }}>"A child shared a toy with a friend."</div>
        <div className="res-actions" style={{ marginTop: 10 }}>
          <button className="btn-sm" onClick={() => { setState({ ok: true }); onSuccess?.(); }}>Was that kind?</button>
          <button className="btn-sm" onClick={() => setState({ ok: false })}>Was that unkind?</button>
        </div>
        {state.ok === true && <div className="li-sub" style={{ marginTop: 8 }}>Yes! Sharing is kind.</div>}
      </div>
    );
  }

  if (title.includes('move')) {
    return (
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-title">Mini activity: Move your body</div>
        <div className="li-sub">Do each movement once, then tap done.</div>
        <ol className="lesson-steps">
          <li>Stretch up high</li>
          <li>Touch your toes</li>
          <li>Take 3 deep breaths</li>
        </ol>
        <div className="lesson-actions">
          <button className="btn-sm" onClick={() => { setState({ ok: true }); onSuccess?.(); }}>
            I did it
          </button>
        </div>
      </div>
    );
  }

  return null;
}

/* ─────────────────────────────────────────
   CHILD DASHBOARD
───────────────────────────────────────── */
function ChildDashboard({ user, onLogout, accessToken }) {
  const [tab, setTab] = useState('dashboard');
  const [done, setDone] = useState([]);
  const [active, setActive] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [supportCategory, setSupportCategory] = useState('learning');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportList, setSupportList] = useState([]);
  const [supportToast, setSupportToast] = useState('');
  const [sound, setSound] = useState(true);
  const [bigText, setBigText] = useState(false);
  const [childPoints, setChildPoints] = useState(0);
  const [activities, setActivities] = useState([
    { id: 'seed-1', title: 'Color Match', desc: 'Match the colors!', icon: 'puzzle', color: '#fef9c3' },
    { id: 'seed-2', title: 'How Do I Feel?', desc: 'Name your feelings', icon: 'smile', color: '#dcfce7' },
    { id: 'seed-3', title: 'Count with Me', desc: 'Count fun objects', icon: 'star', color: '#dbeafe' },
    { id: 'seed-4', title: 'My Daily Routine', desc: "What's your routine?", icon: 'calendar', color: '#fce7f3' },
    { id: 'seed-5', title: 'Story Time', desc: 'Read a picture story', icon: 'book', color: '#ede9fe' },
    { id: 'seed-6', title: 'Move Your Body', desc: 'Fun exercises!', icon: 'activity', color: '#ffedd5' },
  ]);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/activities', { accessToken })
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data?.activities) && data.activities.length) {
          setActivities(data.activities.map(a => ({
            id: a.id,
            title: a.title,
            desc: a.description,
            icon: a.icon,
            color: a.color,
            steps: a.steps || [],
          })));
        }
      })
      .catch(() => {
        // keep seeded activities if backend not available yet
      })
    return () => { cancelled = true; };
  }, [accessToken]);

  useEffect(() => {
    let cancelled = false;
    if (!accessToken) return () => { cancelled = true; };
    apiFetch('/api/progress/me', { accessToken })
      .then((data) => {
        if (cancelled) return;
        const ids = data?.progress?.completedActivityIds || [];
        const pts = data?.progress?.points || 0;
        setDone(Array.isArray(ids) ? ids : []);
        setChildPoints(Number.isFinite(pts) ? pts : 0);
      })
      .catch(() => {
        // keep local demo progress if backend not available
      });
    return () => { cancelled = true; };
  }, [accessToken]);

  const pts = childPoints || 0;
  const complete = (id) => { if (!done.includes(id)) setDone(p => [...p, id]); };
  const open = (a, assignmentId) => { setActive({ ...a, assignmentId: assignmentId || null }); setTab('activity'); };

  useEffect(() => {
    let cancelled = false;
    if (!accessToken) return () => { cancelled = true; };
    apiFetch('/api/assignments/mine', { accessToken })
      .then((data) => {
        if (cancelled) return;
        setAssignments(Array.isArray(data?.assignments) ? data.assignments : []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [accessToken]);

  const markDone = async (id, assignmentId) => {
    if (!accessToken) {
      complete(id);
      setChildPoints(p => p + (done.includes(id) ? 0 : 10));
      setActive(null);
      setTab('play');
      return;
    }

    try {
      if (assignmentId) {
        await apiFetch(`/api/assignments/${assignmentId}/complete`, { method: 'POST', accessToken });
      }
      const data = await apiFetch('/api/progress/complete', { method: 'POST', accessToken, body: { activityId: id, pointsAwarded: 10 } });
      const ids = data?.progress?.completedActivityIds || [];
      const ptsNext = data?.progress?.points || 0;
      setDone(Array.isArray(ids) ? ids : []);
      setChildPoints(Number.isFinite(ptsNext) ? ptsNext : 0);
      // refresh assignments list (status -> completed)
      apiFetch('/api/assignments/mine', { accessToken }).then(d => setAssignments(Array.isArray(d?.assignments) ? d.assignments : [])).catch(() => {});
    } catch {
      // fallback to local if backend fails
      complete(id);
      setChildPoints(p => p + (done.includes(id) ? 0 : 10));
    }
    setActive(null);
    setTab('play');
    if (sound) {
      try { window.navigator.vibrate?.(40); } catch {}
    }
  };

  const childNav = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'activities', label: 'Activities', icon: 'calendar' },
    { id: 'assigned', label: 'Assigned', icon: 'check' },
    { id: 'help', label: 'Ask Teacher', icon: 'message' },
    { id: 'progress', label: 'Progress', icon: 'chart' },
    { id: 'awards', label: 'Awards', icon: 'star' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const showSupportToast = useCallback((t) => {
    setSupportToast(t);
    window.clearTimeout(showSupportToast._t);
    showSupportToast._t = window.setTimeout(() => setSupportToast(''), 1800);
  }, []);

  const loadSupport = useCallback(() => {
    if (!accessToken) return;
    apiFetch('/api/support/mine', { accessToken })
      .then((d) => setSupportList(d.requests || []))
      .catch(() => setSupportList([]));
  }, [accessToken]);

  useEffect(() => { loadSupport(); }, [loadSupport]);

  return (
    <div className={`child-app ${bigText ? 'child-big' : ''}`}>
      <Shell
        user={user}
        onLogout={onLogout}
        notifications={[]}
        unreadCount={0}
        markRead={() => {}}
        markAllRead={() => {}}
        onOpenNotification={() => {}}
        navItems={childNav}
        activeTab={tab === 'activity' ? 'activities' : tab}
        setActiveTab={(next) => { setTab(next); if (next !== 'activity') setActive(null); }}
      >
      {tab === 'activity' && active && (
        <div className="child-activity-page">
          <div className="child-activity-wrap">
            <div className="child-activity-head">
              <button className="btn-sm" onClick={() => { setTab('activities'); setActive(null); }}>
                <Icon name="arrow_left" size={14} /> Back
              </button>
              <div className="child-activity-title">
                <div className="cat">{active.title}</div>
                <div className="t-muted">{active.desc}</div>
              </div>
              <div className="pts-pill"><Icon name="star" size={15} color="#f59e0b" /> {pts} pts</div>
            </div>

            <div className="child-activity-card" style={{ '--acc': active.color }}>
              <div className="cc-icon"><Icon name={active.icon} size={44} /></div>
              <div className="cc-title">{active.title}</div>
              <div className="cc-desc">{active.desc}</div>
            </div>

            <div className="card">
              <div className="card-title">Steps</div>
              <ChildMiniActivity activity={active} onSuccess={() => {}} />
              <ol className="lesson-steps">
                {(active.steps?.length ? active.steps : [
                  'Get ready and look at the pictures.',
                  'Try the activity once with help.',
                  'Try again by yourself.',
                  'When you finish, mark it as done.',
                ]).map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              <div className="lesson-actions">
                <button className="btn-complete" onClick={() => markDone(active.id, active.assignmentId)}>
                  <span className="btn-complete-dot" aria-hidden><Icon name="check" size={12} color="#fff" /></span>
                  Mark done (+10 pts)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {tab === 'dashboard' && (
        <div className="child-prog-view">
          <div className="page-head">
            <h1>Hi, {user?.name?.split(' ')[0]}!</h1>
            <p>Welcome back. Keep going and collect points for each activity you finish.</p>
          </div>
          <div className="stats-row">
            <StatCard label="Points" value={pts} icon="star" color="var(--amber-tint)" />
            <StatCard label="Completed" value={done.length} icon="check" color="var(--green-tint)" />
            <StatCard label="Remaining" value={Math.max(activities.length - done.length, 0)} icon="calendar" color="var(--blue-tint)" />
            <StatCard label="Assigned" value={assignments.filter(a => a.status !== 'completed').length} icon="message" color="var(--peach-tint)" />
          </div>
          <ChildAnnouncementsPanel accessToken={accessToken} />
        </div>
      )}
      {tab === 'activities' && (
        <>
          <div className="page">
            <div className="page-head"><h1>Activities</h1><p>Choose an activity and work through the steps.</p></div>
          </div>
          <div className="child-grid">
            {activities.map(a => (
              <div key={a.id} className={`child-card ${done.includes(a.id) ? 'child-done' : ''}`} style={{ '--acc': a.color }}>
                <div className="cc-icon"><Icon name={a.icon} size={36} /></div>
                <div className="cc-title">{a.title}</div>
                <div className="cc-desc">{a.desc}</div>
                <div className="child-activity-meta">
                  <Badge label={`${Math.max(1, (a.steps || []).length)} steps`} type="gray" />
                  <span className="li-sub">{done.includes(a.id) ? 'Completed' : 'Ready to start'}</span>
                </div>
                {assignments.some(x => x.activity?.id === a.id && x.status !== 'completed') && (
                  <div className="child-activity-meta"><Badge label="Assigned" type="blue" /></div>
                )}
                {done.includes(a.id)
                  ? <div className="cc-done-label"><Icon name="check" size={14} /> Done!</div>
                  : <button className="cc-btn" onClick={() => {
                    const asg = assignments.find(x => x.activity?.id === a.id && x.status !== 'completed');
                    open(a, asg?.id);
                  }}>Let's Go!</button>}
              </div>
            ))}
          </div>

        </>
      )}
      {tab === 'assigned' && (
        <div className="child-prog-view">
          <div className="card">
            <div className="card-title">Assigned by your teacher</div>
            {assignments.length === 0 ? (
              <div className="li-sub">No assigned activities yet.</div>
            ) : (
              <div className="res-grid" style={{ marginTop: 12 }}>
                {assignments.map((a) => (
                  <div key={a.id} className="res-card" style={{ background: 'var(--bg-card)' }}>
                    <div className="res-top">
                      <Badge label={a.status === 'completed' ? 'Completed' : 'Assigned'} type={a.status === 'completed' ? 'green' : 'blue'} />
                      <span className="res-cat">{new Date(a.assignedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="res-title">{a.activity.title}</div>
                    <div className="res-desc">{a.activity.description}</div>
                    {a.status !== 'completed' && (
                      <div className="res-actions">
                        <button className="btn-sm" onClick={() => open({
                          id: a.activity.id,
                          title: a.activity.title,
                          desc: a.activity.description,
                          icon: a.activity.icon,
                          color: a.activity.color,
                          steps: a.activity.steps || [],
                        }, a.id)}>
                          Open activity
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {tab === 'help' && (
        <div className="child-prog-view">
          <div className="card">
            <div className="card-title">Ask your teacher for help</div>
            <div className="auth-field">
              <label>What is bothering you?</label>
              <select value={supportCategory} onChange={(e) => setSupportCategory(e.target.value)}>
                <option value="learning">Learning</option>
                <option value="social">Social/friends</option>
                <option value="feelings">Feelings</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="auth-field">
              <label>Message</label>
              <textarea rows={4} value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder="Tell your teacher what is hard for you today..." />
            </div>
            <div className="lesson-actions">
              <button
                className="btn-primary"
                onClick={async () => {
                  if (!supportMessage.trim() || !accessToken) return;
                  try {
                    await apiFetch('/api/support/child', { method: 'POST', accessToken, body: { category: supportCategory, message: supportMessage.trim() } });
                    setSupportMessage('');
                    showSupportToast('Sent to your teacher');
                    loadSupport();
                  } catch (e) {
                    showSupportToast(e.message || 'Could not send');
                  }
                }}
                disabled={!supportMessage.trim() || !accessToken}
              >
                <Icon name="send" size={16} /> Send
              </button>
            </div>
          </div>
          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-title">My recent help requests</div>
            {supportList.length === 0 ? (
              <div className="li-sub">No requests yet.</div>
            ) : (
              supportList.slice(0, 6).map((r) => (
                <div className="list-item" key={r.id}>
                  <div className="li-body">
                    <div className="li-title">{r.message}</div>
                    <div className="li-sub">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <Badge label={r.status === 'seen' ? 'Seen' : 'New'} type={r.status === 'seen' ? 'gray' : 'amber'} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {tab === 'progress' && (
        <div className="child-prog-view">
          <div className="cp-stats">
            <div className="cp-stat"><div className="cp-val">{done.length}</div><div className="cp-lbl">Completed</div></div>
            <div className="cp-stat"><div className="cp-val">{pts}</div><div className="cp-lbl">Points</div></div>
            <div className="cp-stat"><div className="cp-val">{activities.length - done.length}</div><div className="cp-lbl">Remaining</div></div>
          </div>
          <div className="cp-bar-section">
            <div className="cp-bar-lbl">Overall Progress — {Math.round((done.length / activities.length) * 100)}%</div>
            <ProgressBar value={Math.round((done.length / activities.length) * 100)} color="#f59e0b" />
          </div>
          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-title">Completed activities</div>
            {done.length === 0 ? (
              <div className="li-sub">No activities completed yet. Go to Play to start.</div>
            ) : (
              <div className="res-grid child-done-grid">
                {activities.filter(a => done.includes(a.id)).map(a => (
                  <div key={a.id} className="res-card" style={{ background: 'var(--bg-card)' }}>
                    <div className="res-top"><Badge label="Done" type="green" /></div>
                    <div className="res-title">{a.title}</div>
                    <div className="res-desc">{a.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {tab === 'awards' && (
        <div className="awards-grid">
          {[
            { title: 'First Step', desc: 'Complete your first activity', earned: done.length >= 1 },
            { title: 'Getting Started', desc: 'Complete 3 activities', earned: done.length >= 3 },
            { title: 'Star Learner', desc: 'Complete all activities', earned: done.length >= 6 },
          ].map((a, i) => (
            <div key={i} className={`award-card ${a.earned ? 'earned' : ''}`}>
              <Icon name="award" size={42} color={a.earned ? '#f59e0b' : '#d1d5db'} />
              <div className="aw-title">{a.title}</div>
              <div className="aw-desc">{a.desc}</div>
              <Badge label={a.earned ? 'Earned!' : 'Locked'} type={a.earned ? 'green' : 'gray'} />
            </div>
          ))}
        </div>
      )}
      {tab === 'settings' && (
        <div className="child-prog-view">
          <div className="card">
            <div className="card-title">My settings</div>
            <label className="toggle-row">
              <span className="toggle-body">
                <span className="toggle-title">Sound & haptics</span>
                <span className="toggle-sub">Small feedback when you finish an activity</span>
              </span>
              <input type="checkbox" checked={sound} onChange={() => setSound(p => !p)} />
            </label>
            <label className="toggle-row">
              <span className="toggle-body">
                <span className="toggle-title">Big text</span>
                <span className="toggle-sub">Make text larger and easier to read</span>
              </span>
              <input type="checkbox" checked={bigText} onChange={() => setBigText(p => !p)} />
            </label>
            <div className="lesson-actions">
              <button
                className="btn-sm"
                onClick={() => {
                  setDone([]);
                  setChildPoints(0);
                  setActive(null);
                  if (accessToken) {
                    apiFetch('/api/progress/reset', { method: 'POST', accessToken }).catch(() => {});
                  }
                }}
              >
                Reset progress
              </button>
            </div>
          </div>
        </div>
      )}
      {supportToast && <div className="toast" role="status" aria-live="polite">{supportToast}</div>}
      </Shell>
    </div>
  );
}

/* ─────────────────────────────────────────
   ADMIN DASHBOARD
───────────────────────────────────────── */
function AdminDashboard({ user, onLogout, users, setUsers, accessToken, ...notifProps }) {
  const [tab, setTab] = useState('overview');
  const [messageOpenUserId, setMessageOpenUserId] = useState('');
  useEffect(() => {
    if (!notifProps?.notifNav?.key) return;
    if (notifProps.notifNav.tab) setTab(notifProps.notifNav.tab);
    if (notifProps.notifNav.userId) setMessageOpenUserId(notifProps.notifNav.userId);
  }, [notifProps?.notifNav]);

  const nav = [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'training', label: 'Teacher Training', icon: 'graduation' },
    { id: 'users', label: 'Users', icon: 'users' },
    { id: 'reports', label: 'Reports', icon: 'bar_chart' },
    { id: 'messages', label: 'Messages', icon: 'message' },
    { id: 'announcements', label: 'Announcements', icon: 'bell' },
    { id: 'feedback', label: 'Feedback', icon: 'star' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];
  return (
    <Shell user={user} onLogout={onLogout} {...notifProps} navItems={nav} activeTab={tab} setActiveTab={setTab}>
      {tab === 'overview' && <AdminOverview user={user} accessToken={accessToken} />}
      {tab === 'training' && <TrainingAssignmentsTab actorRole="admin" accessToken={accessToken} />}
      {tab === 'users' && <UsersTab users={users} setUsers={setUsers} />}
      {tab === 'reports' && <ReportsTab />}
      {tab === 'messages' && <MessagesTab user={user} accessToken={accessToken} preferredUserId={messageOpenUserId} />}
      {tab === 'announcements' && <AnnouncementsWorkspace user={user} accessToken={accessToken} />}
      {tab === 'feedback' && <FeedbackTab />}
      {tab === 'settings' && <SettingsTab />}
    </Shell>
  );
}

function AdminOverview({ user, accessToken }) {
  return (
    <div className="page">
      <div className="page-head"><h1>School Overview</h1><p>Monitor platform usage across your school.</p></div>
      <div className="stats-row">
        <StatCard label="Teachers" value="24" icon="graduation" color="var(--blue-tint)" />
        <StatCard label="Parents" value="87" icon="users" color="var(--green-tint)" />
        <StatCard label="Children" value="63" icon="child" color="var(--peach-tint)" />
        <StatCard label="Active This Week" value="41" icon="activity" color="var(--amber-tint)" />
      </div>
      <div className="card">
        <div className="card-title">Training Completion by Teacher</div>
        {[
          { name: 'Teacher A', done: 6, total: 6 },
          { name: 'Teacher B', done: 4, total: 6 },
          { name: 'Teacher C', done: 3, total: 6 },
          { name: 'Teacher D', done: 1, total: 6 },
        ].map((t, i) => (
          <div className="list-item" key={i}>
            <div className="li-av">{t.name.charAt(0)}</div>
            <div className="li-body">
              <div className="li-title">{t.name}</div>
              <ProgressBar value={Math.round((t.done / t.total) * 100)} />
            </div>
            <span className="li-sub">{t.done}/{t.total}</span>
          </div>
        ))}
      </div>
      <AnnouncementsPanel user={user} accessToken={accessToken} />
    </div>
  );
}

function UsersTab({ users, setUsers }) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ name: '', email: '', role: 'teacher', status: 'Active' });
  const [toast, setToast] = useState('');

  const showToast = (t) => {
    setToast(t);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(''), 1800);
  };

  const toggle = (id) => setUsers(p => p.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
  const remove = (id) => {
    const u = users.find(x => x.id === id);
    setUsers(p => p.filter(x => x.id !== id));
    setSelected(null);
    showToast(`Deleted ${u?.name || 'user'}`);
  };
  const saveSelected = () => {
    if (!selected) return;
    setUsers(p => p.map(u => u.id === selected.id ? selected : u));
    showToast('Saved changes');
  };
  const addUser = () => {
    if (!draft.name.trim() || !draft.email.trim()) return;
    const id = Math.max(0, ...users.map(u => u.id || 0)) + 1;
    setUsers(p => [{ id, ...draft }, ...p]);
    setDraft({ name: '', email: '', role: 'teacher', status: 'Active' });
    setShowAdd(false);
    showToast('User added');
  };

  const visible = users.filter(u => {
    const q = query.trim().toLowerCase();
    const matchesQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole = role === 'All' || u.role === role;
    return matchesQ && matchesRole;
  });

  return (
    <div className="page">
      <div className="page-head"><h1>User Management</h1><p>Manage all accounts on the platform.</p></div>
      <div className="filter-row">
        <input className="filter-search" placeholder="Search name or email..." value={query} onChange={(e) => setQuery(e.target.value)} />
        {['All', 'teacher', 'parent', 'child', 'admin'].map(r => (
          <button key={r} className={`filter-chip ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>{r === 'All' ? 'All' : r}</button>
        ))}
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Icon name="plus" size={16} /> Add user</button>
      </div>
      <div className="table-card">
        <div className="t-head" style={{ gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr' }}>
          <span>Name</span><span>Role</span><span>Email</span><span>Status</span><span>Action</span>
        </div>
        {visible.map(u => (
          <div className="t-row" key={u.id} style={{ gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr' }}>
            <span className="t-name"><div className="t-av">{u.name.charAt(0)}</div>{u.name}</span>
            <span><Badge label={u.role} type={u.role === 'teacher' ? 'blue' : u.role === 'parent' ? 'green' : u.role === 'child' ? 'amber' : 'gray'} /></span>
            <span className="t-email">{u.email}</span>
            <span><Badge label={u.status || 'Active'} type={(u.status || 'Active') === 'Active' ? 'green' : 'gray'} /></span>
            <span className="t-actions">
              <button className="btn-sm" onClick={() => setSelected({ ...u })}>View</button>
              <button className="btn-sm" onClick={() => toggle(u.id)}>{(u.status || 'Active') === 'Active' ? 'Deactivate' : 'Activate'}</button>
            </span>
          </div>
        ))}
      </div>

      {selected && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-title-row">
            <div className="card-title">Edit user</div>
            <div className="card-title-actions">
              <button className="btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
          <div className="two-col" style={{ gap: 12 }}>
            <div className="auth-field"><label>Full Name</label><input value={selected.name} onChange={(e) => setSelected(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="auth-field"><label>Email</label><input value={selected.email} onChange={(e) => setSelected(p => ({ ...p, email: e.target.value }))} /></div>
          </div>
          <div className="two-col" style={{ gap: 12, marginTop: 8 }}>
            <div className="auth-field">
              <label>Role</label>
              <select value={selected.role} onChange={(e) => setSelected(p => ({ ...p, role: e.target.value }))}>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="auth-field">
              <label>Status</label>
              <select value={selected.status || 'Active'} onChange={(e) => setSelected(p => ({ ...p, status: e.target.value }))}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="res-actions" style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <button className="btn-sm" onClick={() => remove(selected.id)}><Icon name="trash" size={13} /> Delete</button>
            <div className="res-actions">
              <button className="btn-sm" onClick={() => toggle(selected.id)}>{(selected.status || 'Active') === 'Active' ? 'Deactivate' : 'Activate'}</button>
              <button className="btn-primary" onClick={saveSelected}><Icon name="check" size={16} /> Save</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-title-row">
            <div className="card-title">Add user</div>
            <div className="card-title-actions">
              <button className="btn-sm" onClick={() => setShowAdd(false)}>Close</button>
            </div>
          </div>
          <div className="two-col" style={{ gap: 12 }}>
            <div className="auth-field"><label>Full Name</label><input value={draft.name} onChange={(e) => setDraft(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Teacher Name" /></div>
            <div className="auth-field"><label>Email</label><input value={draft.email} onChange={(e) => setDraft(p => ({ ...p, email: e.target.value }))} placeholder="e.g. teacher@school.rw" /></div>
          </div>
          <div className="two-col" style={{ gap: 12, marginTop: 8 }}>
            <div className="auth-field">
              <label>Role</label>
              <select value={draft.role} onChange={(e) => setDraft(p => ({ ...p, role: e.target.value }))}>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="auth-field">
              <label>Status</label>
              <select value={draft.status} onChange={(e) => setDraft(p => ({ ...p, status: e.target.value }))}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="lesson-actions">
            <button className="btn-primary" onClick={addUser}><Icon name="plus" size={16} /> Add user</button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">{toast}</div>
      )}
    </div>
  );
}

function ReportsTab() {
  const reports = [
    { title: 'Training Completion Report', type: 'CSV' },
    { title: 'Student Progress Report', type: 'CSV' },
    { title: 'Parent Engagement Report', type: 'CSV' },
    { title: 'Platform Usage Report', type: 'CSV' },
  ];
  const makeCsv = (title) => {
    const rows = [
      ['Report', title],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Metric', 'Value'],
      ['Teachers trained', '24'],
      ['Parents active', '41'],
      ['Children supported', '63'],
      ['Modules completed', '128'],
    ];
    return rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
  };
  return (
    <div className="page">
      <div className="page-head"><h1>Reports</h1><p>Generate and download platform usage reports.</p></div>
      <div className="res-grid">
        {reports.map((r, i) => (
          <div className="res-card" key={i}>
            <div className="res-top"><Badge label="Report" type="gray" /></div>
            <div className="res-title">{r.title}</div>
            <div className="res-desc">Download the latest data as PDF or CSV.</div>
            <a
              className="btn-sm"
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(makeCsv(r.title))}`}
              download={`${r.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.csv`}
            >
              <Icon name="download" size={13} /> Download CSV
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [platformName, setPlatformName] = useState('InkluKids');
  const [school, setSchool] = useState('Rwanda Inclusive School Network');
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);
  return (
    <div className="page">
      <div className="page-head"><h1>Settings</h1><p>Manage platform configuration.</p></div>
      <div className="card">
        <div className="card-title-row">
          <div className="card-title">Platform configuration</div>
          {saved && <Badge label="Saved" type="green" />}
        </div>
        <div className="two-col" style={{ gap: 12 }}>
          <div className="auth-field">
            <label>Platform Name</label>
            <input value={platformName} onChange={(e) => { setPlatformName(e.target.value); setSaved(false); }} />
          </div>
          <div className="auth-field">
            <label>School</label>
            <input value={school} onChange={(e) => { setSchool(e.target.value); setSaved(false); }} />
          </div>
        </div>
        <div className="two-col" style={{ gap: 12, marginTop: 8 }}>
          <div className="auth-field">
            <label>Language</label>
            <select value={language} onChange={(e) => { setLanguage(e.target.value); setSaved(false); }}>
              <option value="English">English</option>
              <option value="Kinyarwanda">Kinyarwanda</option>
              <option value="French">French</option>
            </select>
          </div>
          <div className="auth-field">
            <label>Notifications</label>
            <label className="toggle-row" style={{ marginBottom: 0 }}>
              <span className="toggle-body">
                <span className="toggle-title">{notifications ? 'Enabled' : 'Disabled'}</span>
                <span className="toggle-sub">In-app alerts and emails</span>
              </span>
              <input type="checkbox" checked={notifications} onChange={() => { setNotifications(p => !p); setSaved(false); }} />
            </label>
          </div>
        </div>
        <div className="lesson-actions">
          <button className="btn-primary" onClick={() => setSaved(true)}><Icon name="check" size={16} /> Save settings</button>
        </div>
      </div>
    </div>
  );
}

export default App;