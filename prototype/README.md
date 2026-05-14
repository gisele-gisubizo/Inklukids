# InkluKids — Prototype

A self-contained React prototype of the InkluKids platform. Built with mock data only — no backend required.

## How to run

Just open `index.html` in a modern browser. That's it.

> Tip: if your browser blocks `file://` for some reason, run a one-line static server from this folder:
> - Python: `python -m http.server 5173`
> - Node:   `npx serve .`
>
> Then open http://localhost:5173

## What this prototype demonstrates

| Checkpoint | Where to see it |
|---|---|
| 1. Screens, forms, buttons, menus, layout/design | Landing → Login → Dashboard → Activities → Assignments → Messages → Announcements → Users → Profile |
| 2. Input processing (login, search) | Login form (validates against simulated DB); Top-bar search and Activities filter |
| 3. Basic workflows (form submission) | Register, Create Activity, Create Assignment, Send Message, Post Announcement, Mark assignment complete |
| 4. Links between pages/screens | Sidebar navigation + role-aware menu + landing CTAs |
| 5. User journeys | Landing → Sign in → Role dashboard → feature page → Logout → back to Landing |
| 6. Simulated database responses | `mockDb.js` — async methods with latency, persisted to `localStorage` |

## Demo accounts

| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| Teacher | denyse@gmail.com         | test@123   |
| Parent  | marie@gmail.com          | try@123    |
| Child   | olga@gmail.com           | try@123    |
| Admin   | j.mugabo@admin.com       | try@123    |

You can also register a new account (Parent / Teacher / Child).

## Reset state

The prototype persists to `localStorage` under the key `inklukids_proto_v1`. To wipe all data, open the browser console on the prototype page and run:

```js
window.MockDB.reset(); location.reload();
```

## File map

```
prototype/
├── index.html     # entry — loads React, Babel, mockDb.js, app.js
├── styles.css     # design tokens mirror the live app (indigo + amber + Inter/Space Grotesk)
├── mockDb.js      # simulated database: users, activities, assignments, messages, announcements
├── app.js         # all React screens and hash routing
└── README.md      # this file
```
