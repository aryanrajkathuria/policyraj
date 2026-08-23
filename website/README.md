# PolicyRaj — Frontend (`website/`)

The entire static frontend lives in this folder. No build step — every file here is served as-is. For the full project overview, architecture diagrams, and deployment guide, see the [root README](../README.md).

## Structure

| Path | Purpose |
|---|---|
| `index.html` | Campaign landing page — the front door |
| `home.html` | Full site: products, calculators, contact |
| `health.html`, `life.html`, `motor.html`, `business.html`, `home-insurance.html` | Insurance category pages |
| `annuity-plans.html`, `child-plan.html`, `endowment-policy.html`, `money-back-policy.html`, `pension-plan.html`, `tax-saving.html` | Plan-specific product pages |
| `hdfc-life.html`, `hdfc-ergo.html`, `icici-lombard.html`, `bajaj-allianz.html`, `lic-india.html`, `niva-bupa.html`, `tata-aig.html` | Insurer partner pages |
| `ai-scan.html` | AI document scanner |
| `blog.html`, `faq.html`, `claims.html`, `compare.html`, `insurance-companies.html` | Content & comparison pages |
| `disclaimer.html`, `privacy-policy.html`, `terms.html` | Legal pages |
| `style.css` | Single global stylesheet — all design tokens (`--primary`, `--radius`, `--shadow`, …) live here |
| `script.js` | Page-level JS — navbar, calculators, forms |
| `chatbot.js` | **Veera** — the 277-entry AI chatbot (IIFE, no external API) |
| `js/quote-api.js` | Quote lead client — calls the AWS Lambda Function URL, falls back to WhatsApp |
| `policyraj.png`, `rakesh-avatar.svg` | Brand assets (logo, chatbot avatar) |

## Run locally

```bash
npx http-server -p 5500 --cors
# open http://localhost:5500
```

## Adding a new page

Follow the checklist in [`CLAUDE.md`](../CLAUDE.md) § New Page Checklist — viewport meta, `style.css`/`script.js`/`chatbot.js` links (in that order, at the bottom of `<body>`), navbar copied from `home.html`, chatbot widget block, WhatsApp float button, and mobile testing at 375px.

## Editing the chatbot

KB entries live in `chatbot.js`. Format, pattern-writing rules, and the syntax-check command are documented in [`CLAUDE.md`](../CLAUDE.md) § Chatbot Development Rules. Run `node ../test-chatbot.js` (with this folder served on port 5500) after any KB change.

## Customisation

- **Colors / spacing / shadows**: edit the CSS custom properties at the top of `style.css` (`:root { ... }`) — never hardcode a color or radius elsewhere.
- **Phone / email**: `9013976999` / `sachin@policyraj.in` — search-and-replace across `.html` files if these ever change.
- **Logo**: replace `policyraj.png`.
