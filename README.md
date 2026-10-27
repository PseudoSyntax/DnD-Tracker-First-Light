# DnD Tracker: First Light

A book-inspired campaign journal for a DnD campaign tracking sessions over time.

## What this project includes
- a parchment-and-ink style single-page interface
- a campaign ledger with session entries, dates, and summaries
- image panels for memorable in-game moments
- responsive layout for desktop and mobile

## Run locally
Open `index.html` in a browser.

## GitHub Pages
When GitHub Pages is enabled for this repository, the site can be served from the root branch at:
https://pseudoSyntax.github.io/DnD-Tracker-First-Light/

## Design inspiration
The page is styled as a leatherbound storybook to evoke a campaign journal or grimoire.

## Files
- `index.html` — main page structure
- `styles.css` — the visual design and book layout
- `script.js` — session data and dynamic rendering

## Authoring session entries
Edit the `sessions` array in `script.js` to add new chapters, dates, summaries, tags, and image URLs.

For example:
```js
{
  number: "Session 08",
  date: "Moon 17, 1179",
  title: "Broken Oath",
  summary: "A new chapter begins as the party faces the fallout from the dawn."
  tags: ["Conflict", "Choices", "Legacy"],
  image: "https://images.unsplash.com/..."
}
```

This project is intentionally lightweight and can be hosted as a static site without a framework.


