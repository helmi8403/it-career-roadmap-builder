# AZ-305 handoff release notes

Career Builder no longer owns course content on this cleanup branch. The 33 old
HTML paths are lightweight handoff pages; six course assets and the obsolete
redirect-preview generator have been removed. See `PROJECT_CLEANUP_REPORT.md`
for exact retained and removed paths.

1. Deploy and verify the independent Certification Study Platform using a NEW
   Firebase project, never `it-career-builder`.
2. Configure the verified platform HTTPS origin in
   `az305-progress-transfer/config.js`.
3. Test an old deep link with query/fragment on the real old origin. Export browser
   progress before continuing and import it on the LMS under My learning.
4. Merge and release this Career Builder cleanup only after that acceptance.
   Until then source main and existing live lessons remain unchanged.
5. Keep the exporter and old-path handoff pages during the migration window.
   They contain no question banks, renderer, backend or Firebase configuration.
6. For rollback, restore source links/content from main or the pre-cleanup commit.
   Do not redeploy the obsolete `feature/az305-firebase-hosting` branch.

Browser data is origin-scoped. This exporter is the only required migration
adapter on the old site; it never deletes or changes saved notes or attempts.
No progress, user identity or payment information is added to redirect URLs.
Cloud chapter migration is administered separately in the LMS project.
