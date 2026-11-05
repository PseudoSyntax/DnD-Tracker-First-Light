## Live website

[Open DnD Tracker: First Light](https://pseudosyntax.github.io/DnD-Tracker-First-Light/)

## How it works

`campaign-data.json` is the single source of truth. Both the journal (`index.html`) and the interactive map (`map.html`) load it at runtime, so edits to the file update both pages.

Because the pages fetch the JSON, serve the folder instead of opening files directly:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

### Data format

- `currentChapter` – id of the chapter the party is on (earlier chapters show as completed).
- `world` – overview text shown on the map when nothing is selected.
- `party` – optional list of `{ "name", "role", "note" }`; the Party panel appears when it has entries.
- `chapters[]` – `id`, `number`, `title`, `location`, `session`, `summary`, `snippet`, `description`, `image`, map position `x`/`y` (percent of the map image), `quests` (`{ "text", "done" }`) and `npcs` (`{ "name", "note" }`).

Validate changes with `node scripts/validate-data.mjs`. The *Validate campaign data* workflow runs the same check on pushes and pull requests.

## Interactive map

The map UI follows the layout of the [DEFRA interactive-map basic example](https://defra.github.io/interactive-map/examples/basic-map): a full-width map with square white controls on the right, a docked details panel, a bottom-left options bar and an attribution strip.

- Drag to pan; scroll, pinch, or use the **+ / −** buttons to zoom (zoom follows the cursor). The home button resets the view and the corners button toggles full screen.
- The view is kept in the URL as `?map:center=x,y&map:zoom=z` (centre in percent of the image, zoom as a power of two), so any view can be shared. `#chapter-id` selects a marker.
- With the map focused: arrow keys pan, `+`/`-` zoom, `0` resets, `?` opens keyboard help, `Esc` deselects.
- Markers are numbered by chapter (blue = current, green = completed) and joined by a toggleable route line and labels.
- Select a marker (or use Prev/Next) to read its details; links open the matching journal chapter.

### Editing the map

1. Switch **Edit** on (bottom-left).
2. Drag markers (or select one and use the arrow keys, `Shift` for bigger steps) and edit its text fields.
3. Edits are saved in your browser's local storage until you publish them.
4. **Save for review** makes them permanent:
   - With a [fine-grained token](https://github.com/settings/personal-access-tokens/new) limited to this repository (Contents and Pull requests: read and write), pasted into the token field, it opens a pull request updating `campaign-data.json`. The token is kept only in the field, never stored, and is cleared after publishing. Merge the PR to go live.
   - Without a token it copies the JSON and opens GitHub's editor for `campaign-data.json`; paste and commit.
5. **Export JSON** downloads the file instead; **Import JSON** loads a file back as local edits; **Discard local edits** reverts to the published data.

## Journal extras

Each chapter lists objectives you can tick off and a private notes box. Both are stored in your browser only and are not published.

## Repository access

See `docs/map-editor-access.md` for permissions and the publishing workflow.
