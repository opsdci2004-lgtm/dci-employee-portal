This folder is for local images (e.g. your real office/team photos).

The site currently links hero images directly from Unsplash, so no local
image file is required for it to work. To switch any image to a local
file:
1. Put the image here, e.g. assets/images/office-team.jpg
2. In the relevant .html page, change that <img src="..."> to
   src="assets/images/office-team.jpg"

Every <img> on the site already has a built-in fallback (a colour gradient
block) if the image fails to load, so the layout never breaks.
