# IT Career Roadmap Builder

A mobile-friendly roadmap for beginners seeking their first IT job.

## Publish with GitHub Pages

1. Create a new public GitHub repository.
2. Upload `index.html` and `.nojekyll` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then press **Save**.

GitHub will provide the website address after deployment finishes.

## Project scope and AZ-305 handoff

This repository owns Career Builder only. Course content belongs to the separate certification-study-platform repository. On the cleanup branch, old AZ-305 paths retain only progress handoff pages. See PROJECT_CLEANUP_REPORT.md and AZ305_HANDOFF.md before releasing.

Run this project's checks with: node --test tests/*.test.mjs
