# DCI Consultants — Employee Portal

A fully static HTML/CSS/JavaScript website for DCI Consultants contract
employees: company templates, policies, user guides, a Leave Application
Form and an Expense Claim Form. No backend, no database, no build step,
no npm dependencies — open `index.html` or deploy as-is to any static host.

## Folder structure

```
index.html            Home page
about.html             About page
templates.html         Company Templates (downloadable forms)
policies.html           Company Policies (accordion)
guides.html             Employee User Guides + FAQ
leave.html              Leave Application Form (fill in, print, sign)
claim.html              Expense Claim Form (fill in, print, sign)
css/styles.css          All styling (shared by every page)
js/main.js              Nav, dark mode, search/filter, accordions (every page)
js/data.js               Content for templates, policies, guides and FAQ
js/leave-form.js          Leave page: row entry, working-day math, print preview
js/claim-form.js          Claim page: row entry, mileage/cap math, print preview
assets/images/          Local image assets (fallback is a CSS gradient block)
assets/docs/            Downloadable files for the Templates/Guides pages
README.md               This file
```

This site intentionally has no database or backend anywhere — the Leave
and Claim pages are pure client-side data entry that only populates a
printable form in your browser tab; nothing is saved or sent anywhere.

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
type, purely so you can print it. Your in-progress entries autosave to
`localStorage` in your own browser (so an accidental refresh doesn't
lose your work) — nothing is sent to a server, and nothing is visible
to anyone else. Use **Clear saved draft** to wipe it and start over.

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

Leave type now covers Annual, Medical, Hospitalisation, Childcare
(GPCL/ECL), NS/Reservist, Compassionate and Unpaid Leave. Childcare Leave
also needs the official **Form GPCL1** (Government-Paid Childcare Leave
declaration) — downloadable from the Company Templates page — submitted
to DCI HR alongside the usual leave form.

This site has no database anywhere by design, including for Leave and
Claim — an earlier version of the Leave page briefly used Supabase for
real accounts and a shared approval queue, but that was removed in favour
of this simpler print-only flow. There is nothing to configure or host;
every page here works by opening the HTML file directly.

## Expense Claim Form (`claim.html`)

Same pattern as the Leave page: no login, no database, just data entry
that fills in a live preview of DCI's official "Approved Company Expense
CLAIM FORM" as you type.

1. **Your details** — staff name, site, and the period (MM/YYYY).
2. **Trips & expenses** — add one row per trip/expense, picking a category
   (Mileage / Taxi / Other). Entering a mileage on a Mileage row suggests
   an amount at DCI's official rate (S$0.25/km, in `MILEAGE_RATE` in
   `js/claim-form.js`) without overriding anything you've typed yourself.
3. **S$250/month cap** — Mileage and Taxi claims are tracked separately
   and summed against the real S$250-per-employee-per-month cap
   (`MILEAGE_TAXI_CAP`); both the live total and the printed form warn in
   red if you go over. "Other" expenses (meals, parking, etc.) aren't
   capped.
4. **Print & sign**, then **Open Infotech Claims Portal** once approved —
   same mechanics as the Leave page.

If someone is claiming car/motorcycle mileage specifically at the capped
monthly rate, point them to the dedicated **Monthly Mileage Claim Form**
on the Templates page instead (it has odometer start/end fields and is
the official standalone version of that calculation).

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
internet by default**. Every page, including the Leave and Claim forms,
has no backend, database or login at all, so:

- **Do not** put confidential company data, client data or personal
  employee data (salaries, ID numbers, medical info, etc.) anywhere on
  this site.
- **Do not** attempt to "fake" a login or password screen with
  JavaScript — client-side checks like that are trivially bypassed and
  give a false sense of security.
- The Leave and Claim pages send nothing to a server — entries only
  autosave to `localStorage` in the staff member's own browser (so a
  refresh doesn't lose their work), and only exist to populate a
  printout. Still, keep leave reasons brief and avoid detailed medical
  information, since the printed page itself is a physical document
  someone will carry around and hand to a manager, and since autosaved
  drafts persist on a shared/public computer until cleared.

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
