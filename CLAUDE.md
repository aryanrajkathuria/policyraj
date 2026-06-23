# CLAUDE.md — PolicyRaj Web Development Guide

> This file defines the standards, patterns, and best practices for all development work on the **PolicyRaj** website. Every code change must follow these rules to keep the codebase consistent, performant, and mobile-ready.

---

## Project Overview

**PolicyRaj** is a static insurance advisory website for Sachin Kathuria (IRDAI-licensed advisor). It is built entirely with **vanilla HTML, CSS, and JavaScript** — no frameworks, no build tools, no bundlers.

| Item | Detail |
|---|---|
| Stack | Vanilla HTML5 + CSS3 + Vanilla JS (ES6+) |
| Chatbot | Custom IIFE-based AI bot (`chatbot.js`) — no external API |
| Testing | Playwright (`test-chatbot.js`) |
| Deployment | Docker / AWS (see `aws/` and `Docker/`) |
| Primary contact | 9013976999 (Sachin Kathuria) |
| WhatsApp link | `https://wa.me/919013976999` |

---

## File Structure

```
policyraj-1/
├── website/                  ← ALL frontend files live here
│   ├── index.html            ← Main landing page
│   ├── style.css             ← Single global stylesheet
│   ├── script.js             ← Page-level JS (navbar, calculators, forms)
│   ├── chatbot.js            ← Veera AI chatbot (IIFE, 262 KB entries)
│   ├── rakesh-avatar.svg     ← Chatbot avatar
│   ├── policyraj.png         ← Logo
│   ├── ai-scan.html          ← AI document scanner page
│   ├── health.html           ← Insurance category pages
│   ├── life.html
│   ├── motor.html  ... etc
│   └── [insurer].html        ← Partner insurer pages
├── backend/                  ← Backend (separate concern)
├── aws/                      ← AWS deployment configs
├── Docker/                   ← Docker setup
└── CLAUDE.md                 ← This file
```

**Rule:** Never move files out of `website/`. All relative asset paths (`style.css`, `chatbot.js`, images) assume `website/` as the base directory.

---

## 1. HTML Best Practices

### Structure
- Always use semantic HTML5 elements: `<section>`, `<nav>`, `<header>`, `<footer>`, `<main>`, `<article>`
- Every section must have an `id` if it needs navbar linking (e.g., `id="insurance"`, `id="contact"`)
- Section pattern to follow every time:
```html
<section class="[name]-section" id="[name]">
  <div class="container">
    <div class="section-header">
      <span class="section-eyebrow">Short Label</span>
      <h2>Title with <span class="gradient-text">Highlight</span></h2>
      <p class="section-subtitle">Supporting description line</p>
    </div>
    <!-- content -->
  </div>
</section>
```

### Mobile Meta (Required on every HTML page)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Accessibility
- Every `<img>` must have a meaningful `alt` attribute
- All interactive elements (`<button>`, `<a>`) must be keyboard-focusable
- Use `aria-label` on icon-only buttons (e.g., close buttons, send buttons)
- Minimum touch target size: **44×44px** (critical for mobile)
- Color contrast ratio minimum: **4.5:1** for body text, **3:1** for large text

### Performance
- Load non-critical scripts at bottom of `<body>`, in this order:
  1. `script.js`
  2. Third-party scripts (vanilla-tilt, etc.)
  3. `chatbot.js` (always last — it's the heaviest file)
- Use `loading="lazy"` on all images below the fold
- Prefer SVG for icons and logos (already used for `rakesh-avatar.svg`)

---

## 2. CSS Best Practices

### Always Use CSS Custom Properties (Design Tokens)

Never hardcode colors, shadows, or radii. Always use the existing variables:

```css
/* ✅ Correct */
color: var(--primary);
border-radius: var(--radius);
box-shadow: var(--shadow);
transition: var(--transition);

/* ❌ Wrong */
color: #1E3A8A;
border-radius: 12px;
```

### Full Token Reference

```css
/* Colors */
--primary: #1E3A8A          /* Main brand blue */
--primary-dark: #102770     /* Darker blue for hover */
--secondary: #e63946        /* Red accent */
--accent: #f4a261           /* Orange accent */
--cta-gold: #B45309         /* Gold CTA */
--cta-gold-light: #D97706

/* Gradients */
--gradient: linear-gradient(135deg, #1E3A8A 0%, #4338ca 100%)
--gradient-gold: linear-gradient(135deg, #92400E 0%, #B45309 40%, #F59E0B 100%)
--gradient-hero: linear-gradient(135deg, #060d24 0%, #0f2460 55%, #1a3c8f 100%)
--gradient-soft: linear-gradient(135deg, #eef2ff 0%, #e8efff 100%)

/* Neutrals */
--white: #ffffff
--off-white: #F8FAFC
--gray-light: #f1f4f9
--gray: #8896a5
--gray-dark: #3d4f65
--text: #0F172A
--text-light: #475569
--border: #dde3ee

/* Effects */
--shadow: 0 4px 24px rgba(26,60,143,0.10)
--shadow-hover: 0 12px 40px rgba(26,60,143,0.22)
--shadow-gold: 0 8px 32px rgba(180,83,9,0.35)
--radius: 12px
--radius-lg: 20px
--transition: 0.25s ease
```

### Typography System

Two fonts are loaded globally — use them correctly:

```css
/* Headings — Poppins (bold, display) */
h1 { font-family: 'Poppins', sans-serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; }
h2 { font-family: 'Poppins', sans-serif; font-size: clamp(1.5rem, 3.5vw, 2.2rem); font-weight: 700; }

/* Body — IBM Plex Sans (readable, professional) */
body { font-family: 'IBM Plex Sans', 'Inter', sans-serif; }
```

**Rule:** Always use `clamp()` for heading font sizes — never fixed `px` values for `h1`/`h2`. This auto-scales on mobile.

### Layout

Always use CSS Grid for multi-column layouts and Flexbox for single-axis alignment:

```css
/* Grid for card layouts */
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

/* Flex for nav items, button groups, icon+text */
.row { display: flex; align-items: center; gap: 12px; }
```

### Mobile-First Responsive Breakpoints

Write base styles for **mobile first**, then add larger screen overrides:

```css
/* Base = mobile (320px+) */
.my-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

/* Tablet */
@media (min-width: 600px) { .my-grid { grid-template-columns: repeat(2, 1fr); } }

/* Desktop */
@media (min-width: 1024px) { .my-grid { grid-template-columns: repeat(4, 1fr); } }
```

**Existing breakpoints used in this project (match these exactly):**

| Breakpoint | Use for |
|---|---|
| `max-width: 480px` | Small phones |
| `max-width: 768px` | Tablets, large phones |
| `max-width: 900px` | Small desktops |
| `max-width: 1024px` | Laptops |
| `max-width: 1100px` | Wide screens |

### Mobile-Specific CSS Rules (Always Apply)

```css
/* Prevent horizontal scroll on mobile */
body { overflow-x: hidden; }

/* Touch-friendly buttons — never smaller than 44px tall */
.btn { min-height: 44px; padding: 12px 24px; }

/* Fluid images */
img { max-width: 100%; height: auto; }

/* Readable font size on mobile — never smaller than 14px */
p, li { font-size: max(14px, 0.88rem); }

/* Stack navigation on mobile */
@media (max-width: 768px) {
  .nav-links { flex-direction: column; }
}
```

### Naming Convention — BEM-lite

Follow the existing project naming pattern (not strict BEM, but consistent):

```css
/* Section wrapper */
.section-name-section { }

/* Inner container always uses .container */
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

/* Section header block */
.section-header { }
.section-eyebrow { }   /* small label above h2 */
.section-subtitle { }  /* text below h2 */

/* Component prefix matching section */
.aq-card { }           /* Ask Veera cards */
.cb-bubble { }         /* Chatbot bubbles */
.clc-logo { }          /* Company listing cards */
```

### Animations

- Always respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```
- Use `transform` and `opacity` for animations (GPU-accelerated, no layout reflow)
- Default transition: `var(--transition)` = `0.25s ease`
- Hover lift pattern: `transform: translateY(-4px)`

---

## 3. JavaScript Best Practices

### No Frameworks — Vanilla JS Only

This project uses **no jQuery, no React, no Vue**. All JS is vanilla ES6+.

### chatbot.js — IIFE Architecture

The chatbot is wrapped in an IIFE to prevent global scope pollution:

```javascript
(function () {
  // All chatbot code here — ctx, KB, detectIntent, UI helpers
  // Only expose what the page needs:
  window.toggleChat = function () { ... };
  window.sendChatMessage = function () { ... };
  window.handleChatKey = function (e) { ... };
})();
```

**Rule:** Never add variables directly to `window` unless they must be called from HTML attributes (`onclick="..."`) or other scripts. The current exposed globals are:
- `window.toggleChat`
- `window.sendChatMessage`
- `window.handleChatKey`
- `window.askVeera` (defined in script.js — connects Q&A section to chatbot)

### Knowledge Base (KB) Entry Format

When adding new chatbot topics, always follow this exact format:

```javascript
{
  id: 'unique_snake_case_id',
  weight: 2,                              // 1=low priority, 2=normal, 3=high (about/contact)
  patterns: ['keyword one', 'phrase match', 'another phrase'],  // LOWERCASE, NO apostrophes in single-quoted strings
  response: () => `${greet()}<strong>🎯 Title</strong><br><br>Content here...`,
  quickReplies: ['Follow-up 1', 'Follow-up 2', 'Speak to Sachin']
}
```

**Critical rules for KB entries:**
- `id` must be unique — check before adding
- `patterns` array: use single quotes, **never use apostrophes inside** (e.g., write `dont` not `don't` — breaks JS string)
- Responses are HTML strings inside template literals
- Always start response with `${greet()}` for name personalization
- Always end with a CTA: phone number `9013976999` or WhatsApp link
- `quickReplies` max 4 items

### DOM Manipulation

```javascript
// ✅ Use getElementById for single elements (fastest)
const el = document.getElementById('chatbotInput');

// ✅ Use querySelector for CSS selector queries
const first = document.querySelector('.aq-card');

// ✅ Use querySelectorAll + forEach for collections
document.querySelectorAll('.aq-tab').forEach(tab => tab.classList.remove('active'));

// ❌ Never use innerHTML to insert user input (XSS risk)
// ✅ Use textContent for user-supplied text
span.textContent = userInput;
// ✅ Use innerHTML only for trusted, hardcoded HTML templates
bubble.innerHTML = trustedHtmlTemplate;
```

### Event Handling

```javascript
// ✅ Use addEventListener (not onclick attributes for new code in .js files)
btn.addEventListener('click', handleClick);

// ✅ Event delegation for dynamic elements
document.addEventListener('click', (e) => {
  if (e.target.matches('.aq-qr-btn')) handleQuickReply(e.target);
});

// ✅ Debounce scroll/input handlers
let timer;
input.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(doSearch, 250);
});
```

### Async / API Calls

```javascript
// ✅ Always use async/await with try/catch for fetch calls
async function submitForm(data) {
  try {
    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Form submission failed:', err);
    showToast('error');
  }
}
```

---

## 4. Mobile App / PWA Best Practices

This website is designed to feel like an app on mobile. Always apply these rules:

### Touch & Tap

- Minimum tap target: **44×44px** (Apple HIG + Google Material standard)
- Add `touch-action: manipulation` on buttons to remove 300ms tap delay:
```css
button, a, .clickable { touch-action: manipulation; }
```
- Never use `:hover`-only interactions — pair with `:focus` and `:active` for touch
- Avoid click events for critical actions — prefer `touchend` on mobile-critical elements

### Viewport & Scroll

- Use `100dvh` (dynamic viewport height) where applicable to avoid address-bar overlap on mobile:
```css
.hero { min-height: 100dvh; }  /* better than 100vh on mobile browsers */
```
- Prevent body scroll when modal/chatbot is open:
```javascript
document.body.style.overflow = 'hidden';   // lock
document.body.style.overflow = '';          // unlock
```
- Use `-webkit-overflow-scrolling: touch` for smooth scroll in overflow containers on iOS

### Forms on Mobile

```html
<!-- Always set input types correctly for mobile keyboards -->
<input type="tel" />         <!-- numeric keypad -->
<input type="email" />       <!-- email keyboard with @ -->
<input type="number" />      <!-- number pad -->
<input type="search" />      <!-- search keyboard with return -->

<!-- Prevent zoom on focus in iOS (font-size must be ≥ 16px) -->
<input style="font-size: 16px;" />
```

### Chatbot Mobile Rules

- Chatbot window uses fixed positioning — always test on real mobile (iOS Safari and Android Chrome)
- Keep chatbot input `font-size: 16px` minimum to prevent iOS zoom-on-focus
- Quick reply buttons: minimum height 40px, readable font, wrap gracefully
- On mobile, after sending a message, scroll chatbot messages to bottom automatically (already implemented)

### Performance for Mobile Networks

- Lazy-load all below-fold images: `<img loading="lazy">`
- Avoid loading unused fonts — only 2 fonts are used (Poppins + IBM Plex Sans)
- Keep individual JS files under 500KB (chatbot.js is ~370KB — acceptable, no further bloat)
- No unused CSS — don't add new utility classes, use existing ones
- Prefer CSS transitions over JS animations (hardware accelerated on mobile)

### Safe Areas (Notch / Home Indicator)

For full-screen elements (hero, chatbot overlay), account for device safe areas:
```css
.chatbot-window {
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}
```

---

## 5. Chatbot Development Rules

### Adding New KB Entries

1. Open `website/chatbot.js`
2. Find the insertion point: before `/* ─── THANKS ─── */` comment
3. Add entry following the KB format above
4. Run syntax check: `node -e "const fs=require('fs'); new Function(fs.readFileSync('website/chatbot.js','utf8')); console.log('OK')"`
5. Update the `related` map in `detectIntent()` if new entries belong to an existing category

### Running the Chatbot Test

```bash
# Start local server first (website/ as root)
cd website && npx http-server -p 5500

# Then run the test (from project root)
node test-chatbot.js
```
Target: **30/30 questions, 100% pass rate**

### Pattern Writing Rules

```javascript
// ✅ Good patterns — lowercase, varied phrasing, no apostrophes
patterns: ['health insurance', 'medical cover', 'health plan', 'medical policy']

// ❌ Bad — apostrophe inside single-quoted string (syntax error!)
patterns: ['what's health insurance', "don't know insurance"]

// ✅ Fix apostrophes — either remove or use the word without contraction
patterns: ['what is health insurance', 'dont know about insurance']
```

---

## 6. Security Rules

- **Never** put API keys, phone numbers to hardcode differently, or secrets in frontend JS
- **Never** use `eval()` or `new Function(userInput)`
- **Never** set `innerHTML` from user input — always `textContent`
- Form submissions go to the backend API — never expose admin credentials
- WhatsApp link format: `https://wa.me/91XXXXXXXXXX` (with country code, no spaces)
- Phone `tel:` links: `tel:9013976999`

---

## 7. New Page Checklist

When creating a new HTML page (e.g., a new insurer page):

```
☐ Correct <meta viewport> tag
☐ Link to style.css (relative path)
☐ Link to script.js at bottom of body
☐ Link to chatbot.js after script.js
☐ <title> tag with "PageName – PolicyRaj"
☐ SEO meta description
☐ Navbar copied from index.html (same structure)
☐ Chatbot widget HTML block copied from index.html
☐ WhatsApp float button
☐ Back to top button
☐ All section wrappers use .container
☐ Mobile breakpoints added for new sections
☐ Images have alt text
☐ Tested on mobile viewport (375px width)
```

---

## 8. What NOT To Do

| ❌ Don't | ✅ Do Instead |
|---|---|
| Use jQuery or any library | Vanilla JS only |
| Hardcode `#1E3A8A` in CSS | Use `var(--primary)` |
| Fixed `px` font sizes for headings | Use `clamp()` |
| Add `console.log` in production code | Remove before commit |
| Use `!important` casually | Fix specificity properly |
| Inline all styles in HTML | Keep in `style.css` |
| Create new CSS files | Add to bottom of `style.css` |
| Use `var` for JS variables | Use `const` / `let` |
| Put user input in `innerHTML` | Use `textContent` |
| Add apostrophes in pattern strings | Write `dont` not `don't` |
| Make buttons smaller than 44px on mobile | Always min 44px tap targets |
| Forget mobile testing | Test at 375px width always |
| Add new KB entry without ID uniqueness check | Check existing IDs first |

---

## 9. Contact & Business Info (Hardcoded Values)

These values are used throughout the codebase — always use exactly these:

```
Advisor name:    Sachin Kathuria
Phone:           9013976999 / 8383813408
Email:           sachin@policyraj.in / aryanrajkathuria@gmail.com
WhatsApp:        https://wa.me/919013976999
Website:         https://policyraj.in/
AI Bot name:     Veera
Bot avatar:      rakesh-avatar.svg
Logo:            policyraj.png
```
