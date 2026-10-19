# DCI Consultants — Employee Portal

A plain HTML/CSS/JavaScript website (no frameworks, no build step) for DCI
Consultants contract employees: company templates, policies and user guides.

## Folder structure

```
index.html          Home page
about.html           About page
templates.html       Company Templates (downloadable forms)
policies.html        Company Policies (accordion)
guides.html          Employee User Guides + FAQ
css/styles.css       All styling (shared by every page)
js/main.js           All behaviour: nav, dark mode, search/filter, accordions
js/data.js           Content for templates, policies, guides and FAQ
assets/images/       Local image assets (fallback is a CSS gradient block)
assets/docs/         Placeholder downloadable files for the Templates page
README.md            This file
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
internet by default**. This site has no real backend or login system, so:

- **Do not** put confidential company data, client data or personal
  employee data (salaries, ID numbers, medical info, etc.) anywhere on
  this site. A banner on every page reminds visitors of this.
- **Do not** attempt to "fake" a login or password screen with
  JavaScript — client-side checks like that are trivially bypassed and
  give a false sense of security.

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
