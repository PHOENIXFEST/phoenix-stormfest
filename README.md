# PHOENIX AI StormFest — Static Prototype

This repository contains a lightweight static HTML/CSS/JS prototype for the PHOENIX AI StormFest event website. It's designed for a quick Netlify deploy and to be easy to iterate on.

What I added:
- index.html — responsive landing page with hero, countdown, lineup snapshot, schedule, sponsors, tickets CTA, and contact form using Netlify Forms.
- styles.css — dark theme styles tuned to the supplied logo aesthetic.
- scripts.js — small scripts for countdown and interactions.
- netlify.toml — simple Netlify config (static site)

Next steps to deploy on Netlify:
1. Push the repo to GitHub (this commit is pushed by the assistant).
2. In Netlify, "New site" → "Import from Git" → connect your GitHub account and choose `PHOENIXFEST/phoenix-stormfest`.
3. Set build command to blank and publish directory to `/` (this is a static site).
4. Add site environment variables or replace placeholder assets (assets/logo.png, assets/sponsorship-brochure.pdf) in the repo.

Assets:
- Replace /assets/logo.png with the SVG or PNG logo you prefer.
- Add hero video or imagery as /assets/hero.mp4 or /assets/hero.jpg

If you want, I can:
- Add the real logo and hero media if you upload them here.
- Connect the Netlify site and configure continuous deploy (I will need collaborator access or you can connect the repo in Netlify yourself).


Please update any content (dates, ticket links) in index.html. If you want me to continue, confirm and grant collaborator access or tell me to create a PR with changes.
