# CLAUDE.md — abdelrahmanhosny.me

## Project Overview
Personal website + blog for Abdelrahman Hosny, hosted on GitHub Pages with Jekyll. Consultant-style branding focused on AI strategy consulting.

## Tech Stack
- **Jekyll** (GitHub Pages native) — no gem-based theme, custom HTML/CSS
- **Tally.so** — embedded contact form at `https://tally.so/embed/KYVAXM`
- **Google Fonts** — Inter (body), Playfair Display (headings)

## Color Palette
- Navy: `#0a1628` (primary bg), `#1a2744` (card/section bg)
- Gold: `#c9a84c` (accents, CTAs)
- White: `#f5f5f5` (body text), Light gray: `#a0aec0` (secondary text)

## Site Structure
```
_config.yml, Gemfile, CNAME (abdelrahmanhosny.me)
_layouts/    — default.html, home.html, post.html
_includes/   — nav.html, footer.html
_posts/      — Markdown blog posts (YYYY-MM-DD-title.md)
assets/css/  — styles.css
assets/js/   — main.js (mobile nav, scroll)
assets/images/logos/ — company/university logos (user adds manually)
blog/index.html — blog listing
index.html   — homepage
```

## Homepage Sections
1. **Hero** — headshot, Brown University + Apple badges (logo + name only), tagline, gold CTA
2. **About** — consulting value prop, stats row (12+ Years R&D, PhD CS, Silicon + AI/ML)
3. **Journey** — horizontal scroll cards (UConn, UCSD, Brown, Cadence, Microsoft, Canonical, ShipBlu [YC S21], Apple)
4. **Contact** — embedded Tally.so form
5. **Footer** — LinkedIn, Blog, Email

## Key Decisions
- Logo images in journey cards and hero badges are **placeholders** — user adds real logos to `assets/images/logos/` and swaps `<div class="journey-logo-placeholder">` for `<img class="journey-logo">`
- Assiut University and xWARE were intentionally removed from the journey
- ShipBlu is marked as YC S21 with an orange badge
- Hero badges show only logo + org name (no subtitles)
- Blog posts use `permalink: /blog/:title/`
- `future: true` in _config.yml to allow future-dated posts

## Local Development
```sh
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
bundle exec jekyll serve
# Site at http://127.0.0.1:4000/
```
