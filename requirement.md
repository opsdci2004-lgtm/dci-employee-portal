
# Task
Build a polished, modern, responsive website for **DCI Consultants** contract employees, giving them one place to find internal information (company templates, policies and user guides).

# Tech constraints
- **Plain vanilla HTML, CSS and JavaScript only.** No frameworks, no build step, no npm dependencies. It must work by opening index.html and deploy as-is to free static hosting (GitHub Pages, Netlify, Cloudflare Pages or Vercel).
- Use relative paths for all links and assets so it works from any subfolder or URL.
- Shared header, footer and navigation must stay consistent across pages. Keep the CSS in one `styles.css` and the JS in one `main.js`.

# Pages (exactly 5, no more)
1. **Home** (`index.html`): hero section with headline, short welcome message and call-to-action buttons; quick-link cards to the other four pages; a "Latest announcements" block (3 placeholder items); a short "Need help?" contact strip.
2. **About** (`about.html`): company overview, mission and values, what contract employees can expect, and an HR/Admin contact section.
3. **Company Templates** (`templates.html`): a card grid of downloadable templates (e.g. timesheet, leave application, expense claim, onboarding checklist, NDA acknowledgement). Include a category filter and a search box (JS). Each card has an icon, title, short description, file type badge and Download button.
4. **Company Policies** (`policies.html`): policies grouped in expandable accordion sections (e.g. code of conduct, leave and attendance, timesheet and payment schedule, data protection and confidentiality, IT acceptable use, workplace safety). Include "last updated" dates and a search box.
5. **Employee User Guides** (`guides.html`): step-by-step guides (e.g. how to submit a timesheet, apply for leave, claim expenses, access company systems, who to contact for what). Use numbered steps, tip callouts and an FAQ section.

# Design requirements
- Visually appealing, professional and modern: clean layout, generous whitespace, rounded cards, subtle shadows, smooth hover and scroll animations (CSS only where possible).
- Define a cohesive colour palette and typography using CSS variables (a deep blue primary with one accent colour, and Google Fonts such as Inter or Poppins).
- **Images:** include plenty of relevant visuals: a hero image or illustration on every page, team and office photography, and icons on cards. Use royalty-free images (Unsplash direct URLs) with descriptive `alt` text and `loading="lazy"`, plus a local fallback (inline SVG or gradient) if an image fails to load. Put any downloaded images in `/assets/images/`.
- Sticky top navigation with the active page highlighted, and a hamburger menu on mobile.
- Mobile-first and responsive (phone, tablet, desktop). Include a dark-mode toggle only if it is simple to do well.
- Accessible: semantic HTML, good colour contrast, keyboard-navigable, visible focus states.

# Content
- Write realistic, professional placeholder content for every section (no "lorem ipsum"). Mark anything needing real company details with `[PLACEHOLDER]` so it is easy to find and replace.
- Create small placeholder files in `/assets/docs/` (e.g. sample .docx/.pdf/.txt) so Download buttons work.

# Easy maintenance
- Staff who are not developers will update this site. Keep content in clearly commented, repeated HTML blocks (or a simple `data.js` array for templates, policies and guides) so adding an item means copying one block.
- Write a short `README.md` covering: how to edit text, add a template or policy, replace images, preview locally, and deploy to GitHub Pages or Netlify step by step.

# Security note
- Free static hosting is public by default. Add a clear banner or comment that no confidential or personal data should be put on this site. If I want access control later, suggest options (e.g. Cloudflare Access, Netlify password protection) in the README. Do not fake security with a client-side password.

# Deliverables and done criteria
- Folder structure: `index.html`, 4 other pages, `/css`, `/js`, `/assets/images`, `/assets/docs`, `README.md`.
- Test that all links and navigation work, there are no console errors, and layouts hold at 375px, 768px and 1440px widths.
- When finished, give a brief summary of the files created and how to preview locally (e.g. `npx serve` or opening index.html).



