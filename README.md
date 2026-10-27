# DnD Tracker: First Light

A static campaign-tracker website for a DnD campaign journal. The project uses a dark fantasy, chapter-based layout inspired by a world atlas and campaign progression screen.

## Features

- Chapter-based campaign dashboard with a large active chapter view
- Eight campaign chapters in a side panel
- Hover expansion on chapter cards for extra visual detail
- Campaign map image embedded on the homepage
- Interactive subpage for the world map (`map.html`)
- Responsive layout for desktop and mobile screens
- Lightweight static app using plain HTML, CSS, and JavaScript

## Project structure

- `index.html` — homepage and campaign chapter dashboard
- `map.html` — standalone interactive world map page
- `styles.css` — visual styling and campaign layout
- `script.js` — chapter list data and interactive behavior
- `image-1.png` — campaign map artwork used on the home page and map page
- `README.md` — project overview and usage info

## Local usage

Open `index.html` directly in a browser.

If you want to run it through a local web server instead:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## GitHub Pages

This project is designed to work as a static site on GitHub Pages.

Expected public URL:

```text
https://PseudoSyntax.github.io/DnD-Tracker-First-Light/
```

To publish it on GitHub Pages:

1. Open the repository settings
2. Choose Pages
3. Set source to `Deploy from a branch`
4. Choose branch `main`
5. Set folder to `/` (root)
6. Save

## Chapter data

The chapter list is defined in `script.js` in the `chapters` array. You can update titles, summaries, locations, sessions, and image URLs there.

Example:

```js
{
  number: 1,
  title: "The Whispering Forest",
  location: "Forest of Hollow Pine",
  session: "Session 01",
  summary: "The party enters the Blackbriar frontier...",
  snippet: "A forest of ash and moonlight where a lantern-first omen sets the campaign in motion.",
  image: "https://images.unsplash.com/..."
}
```

## Design inspiration

The visual design aims to feel like a fantasy campaign ledger and field atlas: dark, atmospheric, and adventure-driven, with a polished dungeon-master style layout.

## Notes

This project intentionally avoids a framework so it remains easy to update and host anywhere that serves static files.
