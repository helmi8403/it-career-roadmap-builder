# Career Builder cleanup report

Repository: https://github.com/helmi8403/it-career-roadmap-builder
Cleanup branch: `feature/az305-progress-handoff`.

## Project boundary

Career Builder owns career planning only. The LMS repository owns course lessons,
question banks, grading, study dashboards, accounts and certification backend code.
No LMS backend, Firebase app, rules, course data or copied chapter-progress code
is present in this Career Builder branch.

## Kept

| Path | Reason |
|---|---|
| `index.html` | Career planning application; unchanged from source main |
| `career-map.html` | Career map; unchanged from source main |
| `v2.js` | Career Builder behavior; unchanged from source main |
| `README.md`, `package.json`, `tests/` | This project's documentation and dependency-free validation |

## Intentional compatibility remnants

| Path | What remains |
|---|---|
| `az305-study-guide/**/*.html` | 23 small handoff pages; no lessons or question data |
| `az305-cue-cards/*.html` | 9 small handoff pages; no cue-card renderer |
| `az305-litware-cue-cards/index.html` | 1 small handoff page; no case-study data |
| `az305-progress-transfer/` | Read-only old-origin exporter, fixed route allowlist and unconfigured destination |
| `AZ305_HANDOFF.md` | Release and rollback instructions |

The old folder names remain solely to preserve bookmarks and access to old-origin
browser progress. All 33 old HTML files are handoff stubs under 1,200 bytes each.
They route to the local export page, not to a caller-supplied destination. No
automatic cross-origin redirect runs before a learner can export progress.
The exporter reads only the four original AZ-305 browser keys, never writes or
deletes them, and contains no LMS import, chapter, grading or account functions.
These compatibility paths can be retired after the migration window and after
learners have exported their progress; removing them now would break old links.

## Removed from this branch

- Original lesson, cue-card and case-study implementations at all 33 HTML paths.
- `az305-study-guide/readability.css`.
- `az305-study-guide/cue-cards/progress-data.js`.
- `az305-study-guide/cue-cards/progress.js`.
- `az305-study-guide/cue-cards/results.css`.
- `az305-study-guide/cue-cards/results.js`.
- `az305-study-guide/cue-cards/transcription-audit.json`.
- Obsolete `scripts/prepare-legacy-redirects.mjs` and its now-empty `scripts/` folder.
- Local ignored `handoff-preview/` test output.
- The LMS chapter key and import/merge functions formerly copied into the exporter.

Course content is preserved in the separate LMS repository, not deleted from Git
history. No Career Builder production file was deployed or overwritten.

## Validation

Six Node tests pass: unchanged Career Builder core files, read-only four-key
export, malformed-storage handling, 33 valid handoff pages/relative links,
absence of LMS/Firebase assets, and fixed-destination route/query/hash validation.
No new live deployment or Firebase service tests were performed.

## Remaining release work and historical code

Set `az305-progress-transfer/config.js` to the VERIFIED independent LMS HTTPS
origin and test export/import and course continuation before merging/deploying.
The default is null; until configured, the page allows export but offers no
unverified external course link. GitHub Pages project paths and custom domains
both work because exporter links are relative.

`main` is deliberately unchanged and therefore still contains the old live AZ-305
files until this cleanup branch is reviewed and released. The historical branch
`feature/az305-firebase-hosting` is untouched and still contains the old Firebase
staging shell/configuration for `it-career-builder`; do not merge or deploy that
branch into this cleanup. Its history is retained for rollback, not imported into
Career Builder or the independent LMS cleanup. No branch was deleted.
