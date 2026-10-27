# Map editor access and secure publishing

This project is intentionally designed to avoid browser-side GitHub tokens. The secure approach is to keep publishing in GitHub, where repository permissions are managed by the repo owner.

## Option 1: direct edit access for trusted users

If you want someone to be able to directly edit the repository:

1. Open your repository on GitHub.
2. Go to Settings > Collaborators and teams.
3. Click Add people.
4. Add the user and choose a role.
   - Write: can push directly to the repository
   - Admin: can manage repo settings and collaborators
5. If you want to restrict direct pushes to the main branch, enable branch protection.

Recommended branch protection for main:

- Require a pull request before merging
- Require status checks to pass
- Optionally restrict who can push to main

## Option 2: secure GitHub Actions publishing

Use this flow if you want a safer publishing gate without storing a token in the browser:

1. Open the repo on GitHub.
2. Go to Settings > Actions > General.
3. Set Workflow permissions to:
   - Read and write permissions
4. Go to Settings > Secrets and variables > Actions.
5. If needed, add a PAT secret named `GH_PAT` for a maintainer account.
6. Use the `publish-map.yml` workflow to validate and commit updates from GitHub.

The workflow is triggered from the Actions tab and can push directly on the current branch when the repo permissions allow it.

## Recommended rule for your repo

For a shared campaign tracker, use this setup:

- repository owners/admins: Admin access
- trusted editors: Write access
- branch protection: enabled for `main`
- publishing: use the GitHub Actions workflow for controlled updates

## Why not store a token in the browser?

Browser-side tokens are risky:

- they can be exposed in the browser devtools
- they are easy to leak through copy/paste or saved logs
- they are not ideal for a static website on GitHub Pages

The safer design is:

- users edit the map in the browser
- the repo owner or maintainer reviews the JSON changes
- the GitHub Actions workflow publishes the final JSON to the branch

## Permissions summary

Minimum permissions by role:

- Read-only observer: none
- Content editor: Write access to repo
- Maintainer: Write or Admin access
- GitHub Actions publisher: repository write permission or PAT secret

## Local testing checklist

1. Open `map.html` in the browser.
2. Edit points, drag markers, and save to browser storage.
3. Export or copy the updated `campaign-data.json` content.
4. Commit it in GitHub or trigger the publish workflow.
5. Verify the site reflects the changes on the live page.
