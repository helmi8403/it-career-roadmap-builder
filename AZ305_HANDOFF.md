# AZ-305 independent-platform handoff

This branch adds only a same-origin progress export utility at
`az305-progress-transfer/`. It does not remove study pages, change Firebase,
or redirect production traffic.

Publish the exporter on the SAME origin as the learner's existing study guide
before switching links. Browser storage cannot be read from another origin.
The Firebase staging shell did not serve the study guide, so its chapter flags
are a separate server-side migration.

Destination repository: `helmi8403/certification-study-platform`, branch
`feature/az305-independent-lms`. Its `/progress.html` accepts the exported JSON.
The export preserves the four original localStorage keys and leaves source data
untouched. No account identifiers or notes appear in a redirect URL.

## Switch-over, only after staging is verified

1. Review and merge this exporter branch on its own schedule.
2. Deploy and verify the independent platform in a NEW Firebase project.
3. Confirm the final platform HTTPS origin and let learners export their progress.
4. Replace only `az305-study-guide/**`, `az305-cue-cards/**` and
   `az305-litware-cue-cards/**` links with the corresponding platform routes.
   Retain `az305-progress-transfer/` on the original origin.
5. Use temporary redirects first. Carry query strings and fragments, but never
   accept a caller-supplied destination. Do not redirect the Career Builder root,
   `career-map.html`, or unrelated career routes.
6. Retain this branch and the old study files for rollback until verified.

The destination build contains fixed same-origin legacy aliases at all existing
AZ-305 HTML paths. Cross-origin redirect activation is deliberately pending the
verified destination address; there is no deployed target to redirect to yet.

After the final address is verified, prepare reviewable old-origin handoff pages:

```sh
node scripts/prepare-legacy-redirects.mjs https://VERIFIED-PLATFORM-ORIGIN
```

Only `handoff-preview/` is written. These pages prompt for progress export before
offering a fixed new-course link with the original query and fragment. They do
not auto-redirect away from unexported browser progress. Review the exporter link
if the old site uses a custom domain instead of its GitHub Pages project path.
Deploy only the reviewed AZ-305 files after the migration window. Existing
source pages, root homepage and Firebase configuration are never modified by
this preparation command.
