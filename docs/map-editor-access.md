# Map editor access and publishing

The site never stores a GitHub token; an optional one pasted for publishing is used once and cleared. Map edits are made locally, exported as JSON, and published through normal Git changes so repository permissions stay in GitHub.

## Publishing flow

1. In `map.html`, turn on Edit, adjust markers, and click **Save for review** (a token opens a PR directly; without one the JSON is copied and GitHub's editor opens). Alternatively click **Export JSON** and replace `campaign-data.json` yourself.
2. Only people with Write access to the repository can complete a publish; GitHub enforces this.
3. Run `node scripts/validate-data.mjs` (CI runs it too).
4. Commit on a branch and open a pull request, or push directly if you have access.
5. GitHub Pages serves the updated site after the merge.

## Recommended repository setup

- Trusted editors: Write access (Settings > Collaborators and teams).
- Protect `main` and require a pull request plus the **Validate campaign data** check.
- Read-only observers need no access; the site is public on GitHub Pages.

## Why no browser-side token?

Tokens in a static site can be read from devtools, leaked through logs or copy/paste, and are unsuitable for GitHub Pages. Exporting JSON and committing it keeps review and permissions in GitHub.
