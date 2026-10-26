# AZ-305 Firebase migration (staging branch)

Firebase project: `it-career-builder`
Branch: `feature/az305-firebase-hosting`

## Current state
- Separate branch created; existing GitHub Pages deployment on main is untouched.
- Firebase Hosting configuration and a **login-only staging shell** are prepared.
- Google sign-in and student profile creation are wired, pending web-app configuration.
- Firestore rules restrict profile and progress documents to the owner; admin authorization uses a trusted custom claim.
- **Not production ready**: protected lessons, answer-key isolation, server-side grading, admin bootstrap, migration and end-to-end testing are pending.

## Firebase console setup
1. Register a Web app in project `it-career-builder`.
2. Copy its `apiKey` and `appId` into `firebase-public/firebase-config.js`; confirm authDomain and projectId.
3. Enable Authentication > Sign-in method > Google, and add `it-career-builder.web.app` (and any custom domain) under Authorized domains.
4. Create Cloud Firestore in production mode in a chosen region.
5. Install Node.js and Firebase CLI: `npm install -g firebase-tools`; `firebase login`.
6. From repo root: `firebase use it-career-builder`; `firebase deploy --only hosting,firestore:rules,firestore:indexes`.
7. Verify Google login and user profile write. **Do not invite students yet.**

## Critical security requirements
- Firebase Hosting files are always publicly retrievable. Never copy current study HTML, question banks, answer keys, screenshots or confidential material to `firebase-public/` until they have been separated into a protected delivery system.
- Firestore `lessons` should contain only authorised, licensed, published material. A signed-in student can inspect delivered content; login is not DRM.
- `users/{uid}/attempts` stores answer selections only. The existing client-side `progress.js` uses proposed answer keys; its scores are not authoritative. Verified scoring requires a trusted server component (for example Cloud Functions/Cloud Run, potentially requiring Blaze billing). Never allow students to write trusted scores.
- Bootstrap the **single** admin custom claim using a trusted Admin SDK environment, never a web browser or checked-in service-account key. Revocation and reauthentication must be tested. Admin write rules should be expanded only after data validation and auditing.
- Firestore indexes, security rules, and app behavior require emulator and manual testing before launch.

## Next migration work
1. Inventory all study pages, cue-card data, assets and case studies; verify content rights and question keys.
2. Extract lessons and questions from the monolithic HTML into versioned, access-controlled data.
3. Build authenticated study views and per-user progress/attempt history; define migration from localStorage with consent and deduplication.
4. Implement trusted grading and admin content management, then test denial cases (unauthenticated access, cross-user access, role escalation).
5. Deploy staging, run mobile/accessibility/performance tests, and only then switch users to Firebase Hosting.

## Rollback
Existing GitHub Pages on `main` remains unaffected. Firebase Hosting deployments can be rolled back using Firebase release history.
