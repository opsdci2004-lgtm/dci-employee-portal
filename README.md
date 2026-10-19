# DCI Consultants — Employee Portal

A fully static HTML/CSS/JavaScript website for DCI Consultants contract
employees: company templates, policies, user guides, and a Leave
Application Form. No backend, no build step, no npm dependencies —
open `index.html` or deploy as-is to any static host.

## Folder structure

```
index.html            Home page
about.html             About page
templates.html         Company Templates (downloadable forms)
policies.html           Company Policies (accordion)
guides.html             Employee User Guides + FAQ
leave.html              Leave Application Form (fill in, print, sign)
css/styles.css          All styling (shared by every page)
js/main.js              Nav, dark mode, search/filter, accordions (pages 1–5)
js/data.js               Content for templates, policies, guides and FAQ
js/leave-form.js          Leave page: row entry, working-day math, print preview
assets/images/          Local image assets (fallback is a CSS gradient block)
assets/docs/            Placeholder downloadable files for the Templates page
README.md               This file
```

**Parked for later** — a database-backed version of the Leave page (real
accounts, a shared manager approval queue, a team calendar) was built
against Supabase and then shelved in favour of the simpler print-only
flow above. Its code is kept, unused, in `js/leave.js`, `js/leave-config.js`
and `supabase/leave-schema.sql` in case it's worth reviving later — see
[Leave app: current vs. parked database version](#leave-app-current-vs-parked-database-version).

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

## Leave Application Form (`leave.html`)

This page has no login and no database — it's a data-entry form that
fills in a live preview of DCI Consultants' official leave form as you
type, purely so you can print it. Nothing is saved anywhere; refreshing
the page clears it.

1. **Your details** — name, department, and the month leave is applied for.
2. **Your current leave balance** — entered manually (Annual/Medical Leave
   earned and already taken this year), since there's no database to look
   these up automatically. Default both "earned" fields to 14 days or
   whatever your real entitlement is.
3. **Leave dates** — add one row per block of leave (type, start/end date,
   reason). Working days are calculated automatically, excluding weekends
   and the Singapore public holidays hard-coded in `js/leave-form.js`
   (`SG_PUBLIC_HOLIDAYS_2026`) — update that list for future years, or
   add more public holidays for your context.
4. **Print & sign** — the form preview updates live; click **Print / Save
   as PDF** (uses the browser's native print dialog — no PDF library
   involved) and hand the signed printout to a manager.
5. **After approval** — a button links out to the real **Infotech Leave
   Management System** so the now-approved leave gets logged there too:
   `https://login-infotech.com/Login?rUrl=...`. Update that URL in
   `leave.html` if it ever changes.

### Leave app: current vs. parked database version
An earlier version of this page used [Supabase](https://supabase.com) for
real accounts, a shared manager approval queue and a team calendar — more
powerful, but needing a backend (contradicting the rest of this site's
"plain static, no backend" design). That version's code is still in the
repo, unused by any page right now:
- `js/leave.js` / `js/leave-config.js` — the Supabase-backed app logic and connection details.
- `supabase/leave-schema.sql` — the database schema + Row Level Security policies it depends on.

To revive it: swap `leave.html`'s closing scripts back to
`leave-config.js` + `leave.js` (instead of `leave-form.js`), restore the
sign-in/approval-queue/calendar markup (see git history around the
"Add Leave Monitoring App" commit), and follow the setup steps that were
previously documented here (run `leave-schema.sql` in the Supabase SQL
Editor once, promote a manager via `update public.profiles set role =
'manager' where email = '...'`, optionally turn off "Confirm email" under
Authentication → Providers → Email).

## Deploying

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
internet by default**. Every page, including the Leave Application Form,
has no backend or login at all, so:

- **Do not** put confidential company data, client data or personal
  employee data (salaries, ID numbers, medical info, etc.) anywhere on
  this site. A banner on every page reminds visitors of this.
- **Do not** attempt to "fake" a login or password screen with
  JavaScript — client-side checks like that are trivially bypassed and
  give a false sense of security.
- The Leave page keeps nothing entered into it anywhere — it only exists
  in the browser tab while filling in the form, to populate a printout.
  Still, keep leave reasons brief and avoid detailed medical information,
  since the printed page itself is a physical document someone will carry
  around and hand to a manager.

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
