# ikes-edge-website

Public website for Ike's Edge.

## Overview

This repository contains the static marketing site for Ike's Edge, including:

- the landing page markup in `index.html`
- the flagship Ike's Trades detail page in `ikes-trades.html`
- the Stock Picks detail page in `stock-picks.html`
- the Performance detail page in `performance.html`
- the Resources landing page in `resources.html`
- legal and policy pages in `terms.html`, `privacy.html`, and `disclosures.html`
- site styling in `styles.css`
- small interactive behaviors in `script.js`
- brand and preview assets in `images/`

## Current site highlights

The current version includes:

- a V1 static-site baseline covering homepage, product pages, resources, performance reporting, and legal/policy pages
- V2 UAT review refinements for the homepage, Ike's Trades hero carousel, Stock Picks hero carousel, performance CTA routing, and legal-page date callouts
- enhanced Ike's Edge logo placement in the header and footer
- standardized header navigation across all public pages
- rotating homepage, Ike's Trades, and Stock Picks hero feature panels with manual indicators, hover/focus pause handling, and accessible hidden-panel behavior
- a homepage hero trial panel with a prominent Whop CTA, per-panel carousel timing, and a redesigned 7-day free trial card
- an Ike's Trades hero carousel using the redesigned 7-day trial card, 5-second hero-card timing, and a refreshed SPX pin-zone visual
- a Stock Picks hero carousel with a green 7-day trial card, matching tile icons across carousel panels, and a Stock Picks-specific Whop CTA
- improved hero readability with a subtle educational-use notice near the primary CTA area
- standardized two-line heading hierarchy across the major homepage sections
- refined "Choose Your Edge" spacing, typography hierarchy, and wider product-card layout
- alternating homepage section backgrounds from the hero through FAQ for clearer panel separation
- homepage Membership Options cards with visible pricing and 7-day free trial messaging
- centered membership buttons and stronger product-card copy readability
- a compact three-pillar homepage difference panel focused on experience, community, and transparency
- a homepage community section that explains Ike's Edge lounges without fake chat content or testimonials
- a homepage transparency section with process visibility bullets and the verified Crumbs+1 July 2026 snapshot
- refined dark and light section panels for stronger readability and visual consistency
- a real Daily Brief product image in the Experience section instead of a mock trading graphic
- a dedicated flagship Ike's Trades detail page with rotating feature panels, early pricing visibility, trading-day flow, strategy coverage, Trading Lounge context, membership pricing, FAQ content, and Whop calls to action
- a dedicated Stock Picks detail page with rotating feature panels, early pricing visibility, organized watchlists, live portfolios, Dividend Portfolio updates, stock alerts, membership pricing, and FAQ content
- a dedicated Performance detail page with documented Crumbs+1 July 2026 results, a reporting framework hero, methodology, portfolio and strategy tracking dashboards, strategy context, and disclosures
- a dedicated Resources landing page that previews member tools, Daily Dealer Levels, market prep, a "Don't Trade Alone" community access panel, alerts, watchlists, portfolio updates, and performance tracking
- dedicated Terms & Conditions, Privacy Policy, and Disclosures pages with reusable legal-page layout styles, standardized effective/last-updated callout boxes, and shared footer links
- a July 2026 Crumbs+1 performance spotlight with documented monthly results and strategy details
- an Ike's Trades performance spotlight CTA that routes to the dedicated Performance page
- an in-section Ike profile portrait in the About section
- direct Whop membership links for both Ike's Trades and Stock Picks
- improved in-page navigation offsets for sticky-header section links
- browser compatibility support for blur and mask effects

## Assets

The `images/` directory currently includes branded and preview imagery used by the site:

- `ikes-edge-logo-header.png`
- `ikes-edge-logo.png`
- `ikes-dealer-levels-preview.png`
- `performance-dashboard-summary.png`
- `performance-dashboard-calendars.png`
- `performance-dashboard-stocks.png`
- `performance-dashboard-swing-trades.png`
- `Daily Brief Image.png`
- `Ike-Profile.jpeg`
- `Ike-Oval-Version.jpeg`

## Local preview

Because this is a simple static site, you can preview it by opening `index.html`, `ikes-trades.html`, `stock-picks.html`, `performance.html`, `resources.html`, `terms.html`, `privacy.html`, or `disclosures.html` in a browser, or by serving the folder with any lightweight static server.

## V1 baseline

The V1 baseline uses the same header navigation order on every page: Home, Ike's Trades, Stock Picks, Performance, Resources, About, FAQ, and Join Ike's Edge. The Join Ike's Edge header link points to Whop and opens in a new tab.
