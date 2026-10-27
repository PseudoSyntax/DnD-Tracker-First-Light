## Secure map editing and repo access

This project can be edited safely without exposing a GitHub token in the browser. The recommended setup is to manage access in GitHub and use the included workflow to validate and publish map updates.

### Recommended workflow

- Trusted users get Write access to the repository.
- The `main` branch is protected.
- Verified changes are published through the Actions workflow.
- The browser still lets you edit and preview the map locally, but final publishing happens in GitHub.

### Repository setup instructions

1. Open the repository.
2. Go to Settings > Collaborators and teams.
3. Add trusted editors with Write access.
4. Go to Settings > Branches.
5. Add a protection rule for `main`.
6. Enable the protections you want, such as required pull requests.
7. Go to Settings > Actions > General.
8. Set Workflow permissions to Read and write permissions.
9. If you need workflow-based publishing from a maintainer account, add a PAT secret named `GH_PAT`.

### Local editing workflow

1. Open `map.html` in a browser.
2. Adjust map points and metadata.
3. Use Save Browser to keep the edits locally.
4. Open the updated `campaign-data.json` file in the repo.
5. Commit the change or trigger the publish workflow.

### More detail

See `docs/map-editor-access.md` for the full permission and publishing guide.
