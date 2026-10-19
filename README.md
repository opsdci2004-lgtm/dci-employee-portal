# DCI Consultants — Employee Portal

A mostly-static HTML/CSS/JavaScript website for DCI Consultants contract
employees: company templates, policies, user guides, and a Leave Monitoring
App. Every page except Leave needs no backend at all; the Leave app talks
to a small Supabase (Postgres) backend for real shared data — see
[Leave Monitoring App setup](#leave-monitoring-app-setup) below.

## Folder structure

```
index.html            Home page
about.html             About page
templates.html         Company Templates (downloadable forms)
policies.html           Company Policies (accordion)
guides.html             Employee User Guides + FAQ
leave.html              Leave Monitoring App (apply / approve / team calendar)
css/styles.css          All styling (shared by every page)
js/main.js              Nav, dark mode, search/filter, accordions (pages 1–5)
js/data.js               Content for templates, policies, guides and FAQ
js/leave-config.js       Supabase project URL + anon key for the Leave app
js/leave.js               All Leave app behaviour (auth, forms, approvals, calendar)
supabase/leave-schema.sql Database schema + security policies for the Leave app
assets/images/          Local image assets (fallback is a CSS gradient block)
assets/docs/            Placeholder downloadable files for the Templates page
README.md               This file
```

## Previewing locally

No install or build step is required. Either:

1. Double-click `index.html` to open it directly in your browser, **or**
2. Run a tiny local server (recommended, avoids some browser file:// quirks):
   ```
   npx serve .
   ```
   then open the URL it prints (usually `http://localhost:3000`).

## Editing content (no coding required)

### Text on Home / About pages
Open `index.html` or `about.html` in any text editor and change the text
between HTML tags. Anything marked `[PLACEHOLDER]` is real company
information that still needs to be filled in.

### Adding a Template, Policy, Guide or FAQ
All of that content lives in **one file: `js/data.js`**. Each item is a
block like this:

```js
{
  id: "timesheet",
  title: "Weekly Timesheet",
  description: "...",
  category: "Finance & Payroll",
  fileType: "XLSX",
  icon: "🗒️",
  file: "assets/docs/timesheet-template.txt"
}
```

To add a new item:
1. Copy one existing block in the relevant array (`TEMPLATES`, `POLICIES`,
   `GUIDES` or `FAQS`).
2. Paste it as a new entry in the same array.
3. Edit the text inside the quotes.
4. Save the file — the page updates automatically, no other file needs
   to change.

### Replacing a downloadable file
1. Put your real file (e.g. `.docx`, `.pdf`, `.xlsx`) in `assets/docs/`.
2. In `js/data.js`, update that template's `file` path to match the new
   filename.
3. The `fileType` badge on the card is just a text label — update it too
   (e.g. `"PDF"`, `"DOCX"`, `"XLSX"`) so it matches the real file.

### Replacing images
- Hero and page images are currently linked directly from Unsplash
  (no download needed). To use a local image instead, place the file in
  `assets/images/` and change the `src="..."` attribute on the matching
  `<img>` tag to `assets/images/your-file.jpg`.
- Every image already has a built-in fallback: if it fails to load, a
  gradient block appears in its place instead of a broken image icon,
  via the `onerror="handleImgError(this)"` attribute already on each
  `<img>` tag.

## Leave Monitoring App setup

`leave.html` is the one page that is **not** a static document — it lets
employees apply for leave and managers approve it, with real data shared
between everyone who signs in. That needs a backend, so it uses
[Supabase](https://supabase.com) (a free-tier hosted Postgres database with
built-in login).

### 1. Run the database schema (one-time)
1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/leave-schema.sql` and click **Run**.
   This creates the `profiles`, `leave_requests` and `public_holidays`
   tables, wires up a trigger that auto-creates a profile when someone
   signs up, sets up the access-control (Row Level Security) rules, and
   seeds a starter Singapore public-holiday list for 2026 — edit or add
   to that list directly in the table (Table Editor → `public_holidays`).
3. It's safe to re-run this script later (e.g. after an update) — it won't
   duplicate tables or holidays.

### 2. Connection details
`js/leave-config.js` already points at the project used for this build:
```js
const SUPABASE_URL = "https://vwfntktsvbprwjebhiwj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_...";
```
The anon key is a **public** client-side key — safe to commit and ship in
the browser. All real access control happens server-side via the Row
Level Security policies in `leave-schema.sql`, not by keeping this key
secret. If you ever point this app at a different Supabase project,
update both values here.

### 3. How accounts and roles work
- Anyone can create an account from the "Create account" tab on the Leave
  page using their work email — this automatically creates an `employee`
  profile with 14 days annual and 14 days medical entitlement.
- **Promoting someone to manager** is deliberately not possible from the
  browser (to stop an employee making themselves a manager). After they
  sign up once, an admin runs this in the Supabase SQL Editor:
  ```sql
  update public.profiles set role = 'manager' where email = 'someone@example.com';
  ```
- To change someone's leave entitlement, update their row directly in
  **Table Editor → profiles** (`annual_entitlement`, `medical_entitlement`).
- By default Supabase requires email confirmation before first sign-in.
  For an internal tool this is usually unnecessary friction — you can turn
  it off under **Authentication → Providers → Email → "Confirm email"**.

### 4. What the app does
- **Apply for leave**: pick annual / medical / unpaid, a date range and a
  reason. Working days (excluding weekends and the `public_holidays`
  table) are calculated live as you pick dates.
- **Balance card**: shows entitlement, taken and remaining days per leave
  type for the current calendar year, recalculated from approved requests.
- **Manager approval queue**: anyone with `role = 'manager'` sees every
  pending request company-wide, with approve/reject buttons and an
  optional comment that the employee sees on their own request.
- **Team calendar**: a month grid (manager view) showing everyone's
  approved (solid) and pending (dashed) leave, to spot overlaps before
  approving.



### GitHub Pages
1. Push this folder to a GitHub repository.
2. In the repository, go to **Settings → Pages**.
3. Under "Build and deployment", set **Source** to "Deploy from a branch",
   pick the branch (e.g. `main`) and the root folder (`/`).
4. Save. GitHub will give you a URL like `https://yourname.github.io/repo/`.

### Netlify
1. Go to [netlify.com](https://app.netlify.com) and log in.
2. Drag and drop this whole project folder onto the Netlify "Sites" page
   (or connect it to a Git repository for automatic redeploys).
3. Netlify will give you a live URL immediately.

Both options work because every link and asset in this project uses a
relative path (e.g. `css/styles.css`, not `/css/styles.css`), so the site
works correctly whether it's served from a domain root or a subfolder.

## Security note — please read

Free static hosting (GitHub Pages, Netlify, etc.) is **public on the
internet by default**. The Home, About, Templates, Policies and Guides
pages have no backend or login at all, so:

- **Do not** put confidential company data, client data or personal
  employee data (salaries, ID numbers, medical info, etc.) anywhere on
  those pages. A banner on every page reminds visitors of this.
- **Do not** attempt to "fake" a login or password screen with
  JavaScript — client-side checks like that are trivially bypassed and
  give a false sense of security.

The **Leave Monitoring App** (`leave.html`) is the one exception: it has
real accounts (Supabase Auth) and real server-side access control (Row
Level Security — see `supabase/leave-schema.sql`), so employees only ever
see their own requests and managers see the team's. Even so, keep leave
reasons brief and avoid pasting detailed medical information, since this
is still an internal convenience tool, not a HIPAA/PDPA-grade HR system.

If real access control is needed later, consider one of these instead:
- **Cloudflare Access** — put the whole site behind Cloudflare's
  identity-aware proxy (free tier available); visitors must authenticate
  (e.g. via company Google/Microsoft account) before the site loads at all.
- **Netlify password protection / Visitor Access** — available on paid
  Netlify plans; restricts the whole site behind a simple access gate at
  the hosting layer, not in client-side code.
- A proper backend with authenticated sessions, if the content ever needs
  to include genuinely sensitive data.

## Browser support / testing notes

This site uses only standard HTML5, CSS3 (CSS variables, Grid, Flexbox)
and vanilla JavaScript (`IntersectionObserver`, `localStorage`) — all
supported in current versions of Chrome, Edge, Firefox and Safari.
Layouts have been checked at 375px (mobile), 768px (tablet) and 1440px
(desktop) widths.
