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

## Current integration update
Google Authentication and Cloud Firestore were reported enabled in Firebase Console. The web-app configuration has been committed to the feature branch. The staging dashboard now creates student profiles and lets signed-in students save eight manual chapter-completion flags in Firestore. The admin section is shown only for an ID token with `admin: true`, but no administrator claim has been assigned yet. The real chapter content, automatic exam grading and attempt-history views have NOT been migrated.

## Deploy staging from your machine
```bash
git clone https://github.com/helmi8403/it-career-roadmap-builder.git
cd it-career-roadmap-builder
git switch feature/az305-firebase-hosting
npm install -g firebase-tools
firebase login
firebase use it-career-builder
firebase deploy --only hosting,firestore:rules,firestore:indexes
```
Open https://it-career-builder.web.app after successful deployment. If you use an existing local clone, fetch the feature branch instead of cloning again.

## Smoke test
1. Confirm the sign-in screen is visible before login.
2. Sign in using a Google account and check that a `users/{uid}` profile is created.
3. Mark Chapter 1 complete, refresh, and confirm the state persists.
4. Sign out; confirm the dashboard is hidden.
5. Sign in with a different Google account; verify Chapter 1 is not marked complete for that account.
6. Attempt direct unauthenticated Firestore reads; confirm permission denied.
7. Confirm no study content or answer keys are included in `firebase-public/`.
8. Confirm the admin panel is hidden for ordinary users.

## Administrator setup
The single administrator has **not** been assigned. Record the selected admin Firebase Authentication UID in a private deployment record. Use Firebase Admin SDK with trusted application credentials to assign the custom claim `{admin: true}` only to that UID, and remove it from any previous administrator. Never add an admin UID, Admin SDK private key, or service-account JSON to this public repository. Custom claims may require sign-out/sign-in or token refresh before they appear. The current rules check the claim but do not independently guarantee that only one account can ever receive it.

## Limitations
- Chapter completion is manually recorded; it does not certify lesson mastery.
- Client-submitted answer attempts are not trusted grades. Production grading requires verified keys and trusted backend processing.
- Hosting serves files publicly; restricted study materials must not be copied to the Hosting public directory.
- Firebase services and deployment have not been tested through this GitHub integration.
