# Issue and PR disposition — Phase 0, task 0.5

> **Status:** Applied 2026-11-15 against commit `37d2da8`. Open items after triage: 44 issues and 79 pull requests (from 91 and 221).
> **Source of truth:** [`ROADMAP.md` Section 13](../ROADMAP.md#13-appendix-a--issue-and-pr-disposition).
> **Approved by:** repository maintainer, 2026-11-15.

This document is the item-level record behind [`ROADMAP.md` Section 13](../ROADMAP.md#13-appendix-a--issue-and-pr-disposition). Every open issue and pull request at the time of the freeze has exactly one disposition:

- **Retain / redirect** — aligned with v2.0.0, mapped to a roadmap phase.
- **Close** — removed feature, duplicate, obsolete, false premise, or superseded by a new design.
- **Defer** — valid but outside v2.0.0.

Dispositions were derived from the Section 13 appendix, not from an independent opinion. Items missing from the appendix were added to it first so that the two documents agree.

## Summary

| Set | Count |
|---|---:|
| Open issues | 91 |
| Issues retained or redirected | 44 |
| Issues closed | 47 |
| Open pull requests | 221 |
| PRs retained or kept as canonical | 65 |
| PRs closed as removed or obsolete | 103 |
| PRs closed as duplicates | 39 |
| PRs deferred beyond v2.0.0 | 9 |
| PRs held for rebuild | 5 |

No PR is merged by this disposition. Every surviving PR is rebased or rewritten against Phase 1–3 before merge; Section 13 states that no old PR should be merged before its cluster is reviewed.

---

## 1. Issues — retain or redirect (44)

| Issue | Title | Area | Roadmap destination |
|---|---|---|---|
| #94 | Fix missing env variables and necessary keyword handling | Operability | Phase 1/4 |
| #168 | fix: reduce sensitive body logging and add timestamps in logger middleware | Operability | Phase 1/4 |
| #236 | Centralize API Base URL via a Shared HTTP Client Abstraction | Frontend data layer | Phase 3 |
| #241 | Dashboard and Reports Routes Have No Authentication Middleware | Auth/authorization | Phase 1 |
| #242 | Low-Stock Threshold is Hardcoded in Two Separate Locations with Different Values | Catalog/cache | Phase 3 |
| #259 | Order Creation Has No MongoDB Transaction — Server Crash Mid-Write Leaves Stock and… | Payment correctness | Phase 1 |
| #274 | Enhancement: Centralize API Calls with an HTTP Client Wrapper | Frontend data layer | Phase 3 |
| #289 | User Profile API Routes Lack Authentication Middleware (Any User Can Read or Write … | Auth/authorization | Phase 1 |
| #298 | [Critical Security Fix] Unauthenticated order creation (/demo-success) & IDOR vulne… | Payment correctness | Phase 1 |
| #351 | Stock Can Go Negative Via MongoDB '$inc' With No Lower Bound | Inventory integrity | Phase 1 |
| #354 | Product 'reserved' Field Lacks Schema-Level Minimum Constraint | Inventory integrity | Phase 1 |
| #357 | Firebase Admin SDK 'getUser()' Called Without Caching (Potential Rate Limit Issues) | Security hygiene | Phase 4 |
| #360 | Body Parser Limit (10KB) May Be Too Restrictive | Security hygiene | Phase 4 |
| #361 | Duplicate Google Fonts Import via Inline '<style>' in Every Component | Frontend quality | Phase 3 |
| #443 | Bug: Admin product updates do not invalidate Redis product cache | Catalog/cache | Phase 3 |
| #446 | Improvement: Add keyboard navigation and ARIA roles to CartDrawer | Frontend quality | Phase 3 |
| #512 | Refactor: Standardize error formats across authentication middleware | API/error contract | Phase 3 |
| #514 | Testing: Add unit tests for the newly refactored resolveFirebaseUser utility | Tests | Phase 4 |
| #547 | Security: POST /api/payment/demo-success has no authentication - anyone can create … | Payment correctness | Phase 1 |
| #584 | Feature: Implement Debounced Product Search to Reduce Unnecessary API Requests | Catalog/cache | Phase 3 |
| #630 | CI: Backend tests run with '\|\| true', so failing tests never block a PR | CI and tooling | Phase 4 |
| #637 | Enhancement : Add Zod validation for GET /api/products query parameters | Catalog/cache | Phase 3 |
| #638 | Testing: Add an automated frontend test setup (Vitest + React Testing Library) | Tests | Phase 4 |
| #650 | Hardcoded Admin UID in Frontend | Auth/authorization | Phase 1 |
| #656 | Fresh setup fails due to Vite/plugin-react version mismatch and missing frontend de… | Setup/reproducibility | Phase 4 |
| #673 | Tooling: Add ESLint configuration for the 'server/' package | CI and tooling | Phase 4 |
| #677 | Tooling: Add Prettier + pre-commit hooks (Husky + lint-staged) | CI and tooling | Phase 4 |
| #684 | Docs: README advertises "PWA Ready" but there is no manifest or service worker | Docs/process | Phase 0/5 |
| #685 | Security: Restrict development admin access to configured dev admin email | Auth/authorization | Phase 1 |
| #696 | Performance: Lazy-load images app-wide (only 2 of 24 '<img>' tags use 'loading="laz… | Performance | Phase 4 |
| #698 | Bug: React Query 'QueryClient' is created inside 'App()' render and is recreated on… | Frontend quality | Phase 3 |
| #719 | Reliability: Express server has no graceful shutdown (SIGTERM/SIGINT) handling | Operability | Phase 1/4 |
| #725 | Enhancement: Add a real '/health' readiness endpoint (with DB check) instead of the… | Operability | Phase 1/4 |
| #728 | Performance: Add gzip/compression middleware to the Express API | Operability | Phase 1/4 |
| #732 | Refactor: Route handlers use ad-hoc 'console.*' (83 calls across 15 files) instead … | Operability | Phase 1/4 |
| #735 | Add spacing between "Continue Shopping" and "Checkout" buttons in Cart | Frontend quality | Phase 3 |
| #736 | Cart drawer overlaps the header on the Shopping page | Frontend quality | Phase 3 |
| #738 | Bug: Reserved stock from abandoned carts is never released (inventory leak) | Payment correctness | Phase 1 |
| #741 | Reliability: No Razorpay webhook — payment confirmation relies solely on the client… | Payment correctness | Phase 1 |
| #742 | Tooling: Pin the Node.js version ('engines' field + '.nvmrc') | CI and tooling | Phase 4 |
| #750 | Repo hygiene: Add GitHub issue templates (only a PR template exists) | Docs/process | Phase 0/5 |
| #760 | Bug: DELETE /api/products/:id returns success for non-existent products | Catalog/cache | Phase 3 |
| #862 | fix(server): remove deprecated useNewUrlParser and useUnifiedTopology options in se… | Operability | Phase 1/4 |
| #877 | CI fails: npm ci in backend tests fails with 'Missing: gcp-metadata@7.0.1 from lock… | CI and tooling | Phase 4 |

## 2. Issues — close (47)

| Issue | Title | Cluster | Reason |
|---|---|---|---|
| #57 | feat: add prop-types validation to Navbar and CartDrawer | Stale duplicates | Duplicate, vague, or superseded by the rebuild |
| #110 | feat(client): extend PropTypes validation to additional components | Stale duplicates | Duplicate, vague, or superseded by the rebuild |
| #257 | Welcome Discount Can Be Applied to Multiple Orders via Race Condition | Welcome discount | Discount removed |
| #290 | Improve the Admin Bug Tracker with Search, Filtering by Status, and Pagination | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #348 | Empty/Placeholder Buttons With No Functionality | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #352 | Missing Input Sanitization on Bug Reporter Fields (Stored XSS Risk) | Bug reporter | Feature removed |
| #359 | FitnessCenter Mongoose Schema Silently Drops Seed Data Fields | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #365 | Enhancement: Graceful error handling for Gemini AI Chatbot API limits | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #423 | Refactor: Abstract logic out of workouts.js into workoutService.js | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #431 | UI/UX: Implement WorkoutLogSkeleton for NotesPage | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #445 | UX: Add skeleton loading states to Admin Customers page | Stale duplicates | Duplicate, vague, or superseded by the rebuild |
| #451 | Performance: Cache external ExerciseDB responses using Redis | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #467 | Enhancement: Implement useInfiniteQuery for Admin Customers list | Stale duplicates | Duplicate, vague, or superseded by the rebuild |
| #509 | Enhancement: Auto-fill Calorie Calculator from Baseline Metrics using checkbox | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #526 | UX/Performance: Paginate the FitRewards transaction history | Rewards/loyalty | Feature removed |
| #533 | Fix: Update FitnessCenter Schema to include missing seed data fields (#359) | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #534 | Extract common data fetching patterns into reusable React hooks | Stale duplicates | Duplicate, vague, or superseded by the rebuild |
| #537 | FitRewards: Allow users to redeem points for discounts during checkout | Rewards/loyalty | Feature removed |
| #544 | FitRewards: Implement 6-month points expiry logic via cron job | Rewards/loyalty | Feature removed |
| #551 | Page is loading Very Slow | Stale duplicates | Duplicate, vague, or superseded by the rebuild |
| #556 | Refactor: Remove redundant try/catch blocks across backend routes (Express 5) | Stale duplicates | Duplicate, vague, or superseded by the rebuild |
| #569 | Testing: Add unit tests for chatConfig.js fallback responses | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #579 | Cleanup: Remove leftover console.log statements from ExercisePage | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #586 | Testing: Add unit tests for workouts validation schemas | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #619 | UI/UX: Implement WorkoutLogSkeleton for NotesPage | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #645 | fix(chat): conversation history is ignored when building Gemini prompt | Chat/AI | Feature removed |
| #693 | Baseline Metrics and Caloric Maintenance Calculator form allows invalid scientific … | Fitness/calculators | Feature removed (includes FitnessCenter schema work) |
| #714 | Reliability: External API calls (Gemini, ExerciseDB, fitness centers) have no reque… | External API timeouts | Applies only to removed integrations (Gemini, ExerciseDB, fitness centers) |
| #715 | start assigning issues to contributors | Process-only | Not a product task; handled by maintenance governance |
| #838 | Chat message length limit is overly restrictive and API key prefix is logged to con… | Chat/AI | Feature removed |
| #884 | fix(chat): conversation history ignored due to prompt construction logic | Chat/AI | Feature removed |
| #983 | Phase 1 - Membership + Program Data Spine | Programs/memberships | Retired product direction |
| #984 | Program Model Schema Definition | Programs/memberships | Retired product direction |
| #985 | Program Model Validation and Database Indexes | Programs/memberships | Retired product direction |
| #986 | Program Model Unit Tests | Programs/memberships | Retired product direction |
| #987 | Program Seed Data Creation | Programs/memberships | Retired product direction |
| #988 | GET /api/programs List Endpoint | Programs/memberships | Retired product direction |
| #989 | GET /api/programs Detail Endpoint | Programs/memberships | Retired product direction |
| #990 | Programs Router Mounting, Zod Validation, and Route Integration | Programs/memberships | Retired product direction |
| #991 | Membership Model Schema Definition | Programs/memberships | Retired product direction |
| #992 | Membership Model Validation and Database Indexes | Programs/memberships | Retired product direction |
| #993 | Membership Model Unit Tests | Programs/memberships | Retired product direction |
| #994 | POST /api/memberships Create Endpoint | Programs/memberships | Retired product direction |
| #995 | GET /api/memberships List Endpoint (Owner and Admin) | Programs/memberships | Retired product direction |
| #996 | DELETE /api/memberships Cancel Endpoint | Programs/memberships | Retired product direction |
| #997 | Workout Logging Integration with Program Day Progress | Programs/memberships | Retired product direction |
| #998 | Program and Membership Documentation Updates | Programs/memberships | Retired product direction |

## 3. Pull requests — retain or keep as canonical (65)

"Canonical" means the PR is the reference for its cluster's intent, not that it can be merged as-is.

| PR | Title | Cluster | Appendix wording |
|---|---|---|---|
| #700 | fix: Move QueryClient to module scope to prevent recreation on every render | QueryClient stability | Keep one |
| #710 | fix(ci): Remove \|\| true from backend tests so failures block PRs | CI/test gates | Retain |
| #711 | feat: Wire debounced search to server-side filtering via useInfiniteProducts | Debounced catalog search | Keep one canonical PR |
| #731 | feat: add /health readiness endpoint with MongoDB connection check | Health/graceful/compression | Consolidate one each |
| #752 | chore: add GitHub issue templates for bug reports and feature requests | Issue templates | Retain |
| #765 | Refactor: Validate process.env using Zod on server startup | Env validation | Retain/adapt |
| #778 | Add confirmation dialog before clearing cart | Clear-cart confirmation | Retain into Phase 3 |
| #786 | refactor: validate process.env using zod (#763) | Env validation | Retain/adapt |
| #787 | test: add Jest unit tests for orderService (Closes #769) | CI/test gates | Retain |
| #816 | feat: add pagination to GET /api/orders/:userId endpoint | Orders pagination | Keep one canonical PR |
| #818 | ci: add dependency vulnerability scanning (npm audit + CodeQL) | Security headers/scanning | Retain/adapt |
| #832 | fix: refresh cart after Firebase auth state restoration | Cart auth refresh | Retain if still relevant |
| #856 | fix: use shared LOW_STOCK_THRESHOLD constant in dashboard.js (fixes #… | Low-stock threshold | Keep one |
| #863 | fix(server): remove deprecated useNewUrlParser and useUnifiedTopology from seed.js | Seed deprecation fix | Keep one; mirrors issue #862 |
| #867 | feat: expand Zod validation to /api/user and /api/customers | User/customer validation | Retain/adapt |
| #885 | fix: replace native alerts with sonner toasts in ProductPage and Cart… | Alert-to-toast | Keep one canonical PR |
| #891 | Security: Configure strict Content Security Policy (CSP) in Helmet | Security headers/scanning | Retain/adapt |
| #894 | Fix mongodb retry backoff | MongoDB retry backoff | Retain; small reliability fix referenced by issue #862, rebase after Phase 2 |
| #921 | feat(server): implement global ApiError handling | API error handling | Retain/adapt |
| #922 | Feature/enable compression | Health/graceful/compression | Consolidate one each |
| #924 | perf: add native lazy loading to product images | Lazy images | Keep one or fold into Phase 4 |
| #932 | Fix/memory leak admin inventory | Admin inventory leak | Retain/rebuild in Phase 3 |
| #945 | A11y/add aria labels navigation | A11y labels | Retain into Phase 3 |
| #946 | Feat/add loading state profile address | Profile address loading | Retain into Phase 3 |
| #952 | fix: implement graceful shutdown for Express server | Health/graceful/compression | Consolidate one each |
| #953 | security: enforce HTTPS with HSTS via Helmet | Security headers/scanning | Retain/adapt |
| #958 | perf: add compound product indexes | Indexes | Retain if it matches final query plan |
| #962 | fix: trap keyboard focus inside CartDrawer and all modals | Accessibility/focus | Retain |
| #963 | build: sync server package-lock.json to fix npm ci in CI | Lockfile/Node pin | Keep one each |
| #967 | feat(navbar): add active visual states to routing links | Navbar/route polish | Retain into Phase 3 UI |
| #978 | chore: enforce conventional commits using commitlint and husky | Conventional commits | Keep one or defer |
| #1003 | chore(deps): bump firebase-admin from 13.10.0 to 14.3.0 in /server | Dependabot | Dependency bump |
| #1008 | chore(deps-dev): bump @eslint/js from 9.39.5 to 10.0.1 in /client | Dependabot | Dependency bump |
| #1009 | test: add frontend testing setup | Frontend test setup | Keep one canonical PR; close duplicates |
| #1010 | chore(deps): bump qs from 6.15.2 to 6.16.0 in /server | Dependabot | Dependency bump |
| #1011 | chore(deps-dev): bump browserslist from 4.28.2 to 4.28.8 in /server | Dependabot | Dependency bump |
| #1012 | chore(deps-dev): bump @humanfs/node from 0.16.7 to 0.16.8 in /client | Dependabot | Dependency bump |
| #1013 | fix: add minimum validation for stock and reserved fields | Stock constraints | Consolidate one schema/guard change |
| #1017 | chore(deps-dev): bump globals from 15.15.0 to 17.12.0 in /client | Dependabot | Dependency bump |
| #1018 | chore(deps): bump framer-motion from 12.42.2 to 13.2.0 in /client | Dependabot | Dependency bump |
| #1020 | chore: pin Node.js version with engines field and .nvmrc | Lockfile/Node pin | Keep one each |
| #1022 | chore(deps-dev): bump baseline-browser-mapping from 2.10.33 to 2.11.22 in /server | Dependabot | Dependency bump |
| #1024 | chore(deps-dev): bump js-yaml from 3.14.2 to 3.15.2 in /server | Dependabot | Dependency bump |
| #1026 | chore(deps-dev): bump js-yaml from 4.3.0 to 4.3.2 in /client | Dependabot | Dependency bump |
| #1039 | chore(deps): bump @grpc/grpc-js from 1.14.3 to 1.14.5 in /server | Dependabot | Dependency bump |
| #1042 | chore(deps): bump axios from 1.18.1 to 1.20.0 in /server | Dependabot | Dependency bump |
| #1047 | chore(deps): bump @fastify/busboy from 3.2.0 to 3.2.2 in /server | Dependabot | Dependency bump |
| #1052 | chore(deps): bump brace-expansion in /server | Dependabot | Dependency bump |
| #1054 | chore(deps): bump proxy-addr from 2.0.7 to 2.0.8 in /server | Dependabot | Dependency bump |
| #1055 | chore(deps): bump source-map-js from 1.2.1 to 1.2.2 in /client | Dependabot | Dependency bump |
| #1056 | chore(deps-dev): bump brace-expansion from 1.1.16 to 1.1.21 in /client | Dependabot | Dependency bump |
| #1060 | chore(deps-dev): bump vite from 8.2.2 to 8.3.5 in /client | Dependabot | Dependency bump |
| #1061 | chore(deps): bump follow-redirects from 1.16.0 to 1.16.1 in /server | Dependabot | Dependency bump |
| #1062 | refactor: centralize Google Fonts imports | Google Fonts cleanup | Keep one |
| #1063 | Harden GET /api/products query validation | Product query validation | Keep one canonical PR |
| #1064 | chore(deps): bump dompurify from 3.4.14 to 3.4.17 in /client | Dependabot | Dependency bump |
| #1065 | chore(deps): bump multer from 2.2.0 to 2.5.0 in /server | Dependabot | Dependency bump |
| #1066 | chore(deps): bump ip-address from 10.2.0 to 10.7.5 in /server | Dependabot | Dependency bump |
| #1067 | chore(deps): bump nodemailer from 9.0.6 to 10.1.4 in /server | Dependabot | Dependency bump |
| #1068 | chore(deps): bump body-parser from 2.3.0 to 2.4.0 in /server | Dependabot | Dependency bump |
| #1069 | chore(deps): bump zod from 4.4.3 to 4.6.6 in /server | Dependabot | Dependency bump |
| #1070 | chore(deps): bump re2js from 2.8.6 to 2.9.1 in /client | Dependabot | Dependency bump |
| #1072 | chore(deps): bump mongoose from 9.9.4 to 9.11.4 in /server | Dependabot | Dependency bump |
| #1073 | chore(deps): bump fast-xml-parser from 5.7.3 to 5.12.0 in /server | Dependabot | Dependency bump |
| #1075 | fix: increase body parser limit to 1mb | Body-size limit | Keep one; mirrors issue #360 |

## 4. Pull requests — close (103)

| PR | Title | Cluster | Reason |
|---|---|---|---|
| #686 | fix: restrict development admin access to configured dev admin email | Admin authorization | Rebuild as claims; do not merge env-UID patches |
| #687 | added prop-types validation to Navbar and CartDrawer components | PropTypes | Close |
| #688 | fix: add onClick handlers to placeholder buttons #348 | Placeholder buttons | Close; dead UI removed |
| #689 | docs: remove unsupported PWA Ready claim from README | PWA docs/feature | Close |
| #690 | docs: remove unsupported PWA Ready claim from README | PWA docs/feature | Close |
| #692 | Fix pwa readme | PWA docs/feature | Close |
| #695 | Fix number input validation | Calculator/notes/plans | Close |
| #701 | feat: Allow users to redeem FitRewards points for discounts during checkout | Rewards | Close |
| #702 | Feature/redeem points 537 | Rewards | Close |
| #707 | feat: Implement PWA support with vite-plugin-pwa | PWA docs/feature | Close |
| #708 | feat: Implement 6-month points expiry logic via daily cron job | Rewards | Close |
| #709 | fix(chat): include conversation history in Gemini prompt | Chat history fixes | Close; chatbot removed |
| #712 | refactor: Remove leftover debug console.log from ExercisePage | ExercisePage console logs | Close; page removed |
| #713 | fix(auth): Remove hardcoded admin UID fallback from frontend bundle | Admin authorization | Rebuild as claims; do not merge env-UID patches |
| #716 | feat: add request timeouts to external API calls (Gemini, ExerciseDB, GitHub) | External API timeouts | Close; integrations removed |
| #718 | docs: improve README with open source contribution guide | README/setup docs | Replace with Phase 5 rewrite |
| #721 | refactor: remove debug console logs from ExercisePage | ExercisePage console logs | Close; page removed |
| #724 | Fix chat history | Chats/AI | Close |
| #737 | refactor: replace ad-hoc console.* calls with structured logger across server | Logging | Replace with Phase 4 logger; do not merge multiple |
| #740 | Fix: add spacing between Continue Shopping and Checkout buttons in Ca… | Cart spacing/drawer duplication | Close after UI rewrite |
| #745 | Fix cart drawer overlapping header on shopping page | Cart spacing/drawer duplication | Close after UI rewrite |
| #747 | Fix cart drawer overlapping header on shopping page | Cart spacing/drawer duplication | Close after UI rewrite |
| #748 | fix: add spacing between cart buttons (#735) | Cart spacing/drawer duplication | Close after UI rewrite |
| #759 | feat: add PropTypes validation to Navbar and CartDrawer | PropTypes | Close |
| #761 | Return 404 when deleting a non-existent product | Delete-product 404 | Close; archive design replaces it |
| #762 | fix: return 404 when deleting non-existent product | Delete-product 404 | Close; archive design replaces it |
| #767 | feat(server): implement centralized backend logging with Winston | Logging | Replace with Phase 4 logger; do not merge multiple |
| #768 | Add PropTypes validation for Navbar and CartDrawer | PropTypes | Close |
| #770 | Added  " morgan" library as logger : Improvised the code . | Logging | Replace with Phase 4 logger; do not merge multiple |
| #772 | docs: improve README prerequisites formatting | README/setup docs | Replace with Phase 5 rewrite |
| #775 | issue#774 resolved  Modify CartDrawer.jsx and productPage.jsx | Cart drawer/product page fixes | Fold into the Phase 3 cart rewrite |
| #781 | feat: implement global Scroll to Top Floating Action Button | Scroll-to-top | Close |
| #783 | Fix/delete product 404 | Delete-product 404 | Close; archive design replaces it |
| #785 | Fix/cart buttons spacing | Cart spacing/drawer duplication | Close after UI rewrite |
| #788 | refactor: replace localStorage workout state with Zustand store (Closes #784) | Zustand workout store | Close; feature removed and no global store |
| #789 | feat: implement global scroll to top floating action button | Scroll-to-top | Close |
| #790 | feat: implement global scroll to top floating action button | Scroll-to-top | Close |
| #795 | feat: add PWA manifest and service worker | PWA docs/feature | Close |
| #803 | Refactor code structure for improved readability and maintainability | Vague refactors | Close |
| #804 | feat: extract common data fetching into reusable useFetch hook | useFetch abstraction | Close; React Query is the data layer |
| #806 | fix(chatbot): render gemini responses with react-markdown and tailwin… | Chats/AI | Close |
| #812 | fix: add placeholder handlers for homepage buttons | Placeholder buttons | Close; dead UI removed |
| #817 | feat: migrate from static VITE_ADMIN_UID to Role-Based Access Control | Admin authorization | Rebuild as claims; do not merge env-UID patches |
| #828 | Add vitest frontend tests | Frontend test setup duplicates | Fold into the canonical test-setup PR above |
| #846 | fix(security): stop Gemini API key prefix logging; configurable chat length | Chats/AI | Close |
| #847 | fix: make chat message length configurable and remove API key logging | Chats/AI | Close |
| #852 | fix(chat): make message length configurable and remove API key logging | Chats/AI | Close |
| #855 | fix(chat): make message length configurable via CHAT_MAX_MESSAGE_LENG… | Chats/AI | Close |
| #860 | Add timeout handling for external API calls | External API timeouts | Close; integrations removed |
| #880 | Improve chat route validation and prompt handling | Chats/AI | Close |
| #881 | perf: implement debouncing for Admin Bugs search input | Admin bug search | Close; bug tracker removed |
| #882 | fix(chat): make message length configurable and remove API key logging | Chats/AI | Close |
| #886 | fix(chat): make message length configurable and remove API key logging | Chats/AI | Close |
| #890 | fix(navbar): show compact github star button on mobile and tablet | GitHub star widgets | Close |
| #893 | feat: resolve multiple project issues from backlog | Vague refactors | Close |
| #896 | feat: add native pull to refresh for mobile lists | Pull-to-refresh | Close/defer |
| #897 | feat: pull-to-refresh for mobile product, orders, and bugs lists (closes #895) | Pull-to-refresh | Close/defer |
| #898 | fix(chat): restore conversation history in prompt | Chats/AI | Close |
| #906 | feat: add pre-hydration loading spinner | Pre-hydration spinners | Close/defer; not a v2.0.0 concern |
| #908 | feat(mobile): implement native pull-to-refresh for mobile lists (#895) | Pull-to-refresh | Close/defer |
| #909 | Fix/mobile GitHub star button | GitHub star widgets | Close |
| #910 | refactor: unify NotesPage form validation with react-hook-form and Zod | Calculator/notes/plans | Close |
| #912 | test(client): add unit tests for Stars component | Stars component tests | Close; ratings removed |
| #915 | feat: add pull-to-refresh support for mobile product list | Pull-to-refresh | Close/defer |
| #917 | fix: resolve FitnessChatBot test failure | Chats/AI | Close |
| #918 | Add PropTypes to navbar cart drawer | PropTypes | Close |
| #925 | fix admin KPI grid skeleton loader | Admin KPI skeletons | Close; admin layout is rebuilt |
| #926 | feat: add Admin KPI skeleton loader | Admin KPI skeletons | Close; admin layout is rebuilt |
| #927 | Feat/910 notes rhf zod | Calculator/notes/plans | Close |
| #928 | feat: add pre-hydration CSS spinner | Pre-hydration spinners | Close/defer; not a v2.0.0 concern |
| #930 | fix: configure chat message length limit | Chats/AI | Close |
| #931 | docs(utils): add JSDoc comments to utility functions | JSDoc utilities | Close; TypeScript types replace JSDoc for utilities (ADR-09) |
| #933 | Feat/add input validation bmi calculator | Calculator/notes/plans | Close |
| #934 | A11y/add aria labels calculators | Calculator/notes/plans | Close |
| #935 | Fix/replace alert with toast notepage | Calculator/notes/plans | Close |
| #936 | Feat/add input validation calorie calculator | Calculator/notes/plans | Close |
| #943 | Refactor/standardize error messages payment | Payment error messages | Superseded by the Phase 3 error contract |
| #944 | Feat/add loading state exercise page | Exercise page loading state | Close; page removed |
| #948 |     fix: homepage button functionality | Placeholder buttons | Close; dead UI removed |
| #959 | fix: correct Welcome Bot workflow YAML | Noisy automation | Close/disable in Phase 6; not product work |
| #972 | fix(chat): make message length configurable and remove API key logging | Chats/AI | Close |
| #975 | feat: add asynchronous email queue with BullMQ | Email queue | Close; ADR-12 rejects a queue for v2.0.0 |
| #999 | feat(program): add program model schema | Programs/memberships | Close |
| #1001 | feat: implement Program/Exercise models and realistic seed data | Programs/memberships | Close |
| #1014 | feat(models): add Membership schema (#991) | Programs/memberships | Close |
| #1023 | feat(programs): mount programs router with Zod validation | Programs/memberships | Close |
| #1025 | feat(memberships): add POST /api/memberships enrolment endpoint | Programs/memberships | Close |
| #1030 | feat: add prop-types validation to Navbar and CartDrawer | PropTypes | Close |
| #1032 | feat(memberships): add GET /api/memberships list endpoint | Programs/memberships | Close |
| #1036 | Add PropTypes validation to Navbar and CartDrawer | PropTypes | Close |
| #1038 | feat(programs): add Program validators, indexes and unit tests | Programs/memberships | Close |
| #1043 | docs(programs): document Program and Membership models and APIs | Programs/memberships | Close |
| #1044 | feat(workouts): link workout logging to program day progress (#997) | Programs/memberships | Close |
| #1046 | feat: seed fitness programs and exercises | Programs/memberships | Close |
| #1048 | feat: add exercise and program seed data | Programs/memberships | Close |
| #1050 | Fix formatting of fitnessCenters.js entry in README | README fitness-centers row | Close; README is rewritten in Phase 5 |
| #1053 | feat(seed): add realistic program and exercise seed data (#987) | Programs/memberships | Close |
| #1057 | chore(deps): bump the minor-and-patch group across 1 directory with 10 updates | Dependabot | Close; older group bump superseded by per-package PRs |
| #1059 | feat: seed fitness programs and exercises | Programs/memberships | Close |
| #1071 | chore(deps): bump the minor-and-patch group across 1 directory with 15 updates | Dependabot | Close; older group bump superseded by per-package PRs |
| #1074 | fix(chat): update chat message length configuration andfix(chat): make message leng… | Chats/AI | Close |
| #1076 | feat(seed): program seed data (#987) | Programs/memberships | Close |
| #1079 | fix(chat): configurable message limit & remove API key from logs (#838) | Chats/AI | Close |

## 5. Pull requests — close as duplicates (39)

| PR | Title | Cluster | Canonical PR |
|---|---|---|---|
| #681 | feat: add frontend testing setup with Vitest and React Testing Library | Frontend test setup | #1009 |
| #683 | feat: implement debounced product search using useDebounce hook | Debounced catalog search | #711 |
| #691 | fix: move Google Fonts import to index.cssfix: move Google Fonts import to index.css | Google Fonts cleanup | #1062 |
| #694 | feat: add frontend test setup with Vitest and React Testing Library | Frontend test setup | #1009 |
| #697 | perf: lazy-load images app-wide to improve LCP and reduce initial payload | Lazy images | #924 |
| #699 | Fix QueryClient recreation on every App render | QueryClient stability | #700 |
| #703 | refactor: remove duplicate Google Fonts imports | Google Fonts cleanup | #1062 |
| #704 | Testing: Add automated frontend test setup (Vitest + React Testing Li… | Frontend test setup | #1009 |
| #705 | Refactor: Remove duplicate Google Fonts imports (#361) | Google Fonts cleanup | #1062 |
| #706 | Adds frontend testing support using Vitest and React Testing Library. | Frontend test setup | #1009 |
| #717 | Add lazy loading to non-critical images | Lazy images | #924 |
| #720 | Add schema-level minimum validation for stock and reserved fields | Stock constraints | #1013 |
| #722 | Refactor duplicate Google Fonts imports | Google Fonts cleanup | #1062 |
| #723 | feat: add graceful shutdown handling for SIGTERM/SIGINT | Health/graceful/compression | #952 |
| #729 | feat: add frontend test setup with Vitest + React Testing Library | Frontend test setup | #1009 |
| #730 | perf: add gzip compression middleware to Express API | Health/graceful/compression | #922 |
| #744 | chore: pin Node.js version with engines field and .nvmrc | Lockfile/Node pin | #1020 |
| #746 | Feat/add vitest frontend tests | Frontend test setup | #1009 |
| #749 | Increase URL-encoded body limit to fix issue in index | Body-size limit | #1075 |
| #771 | Add Vitest and React Testing Library to clientAdd client tests | Frontend test setup | #1009 |
| #773 | test(client): add vitest and react-testing-library setup (#638) | Frontend test setup | #1009 |
| #776 | fix(inventory): unify low stock threshold | Low-stock threshold | #856 |
| #779 | test(client): add Vitest + React Testing Library frontend test setup | Frontend test setup | #1009 |
| #796 | Add pagination support to GET /api/orders/:userId | Orders pagination | #816 |
| #805 | Add pagination support to GET /api/orders endpoint | Orders pagination | #816 |
| #813 | Add strict Mongoose validation constraints to Product schema | Stock constraints | #1013 |
| #814 | Add strict Mongoose validation constraints to Product schema | Stock constraints | #1013 |
| #829 | Add Vitest + RTL test harness with starter tests, wire into CI | Frontend test setup | #1009 |
| #845 | feat(ux): replace alert() calls with sonner toast notifications | Alert-to-toast | #885 |
| #849 | test(client): add Vitest and React Testing Library setup | Frontend test setup | #1009 |
| #864 | chore: enforce conventional commits using commitlint and husky | Conventional commits | #978 |
| #866 | feat: enforce conventional commits using Husky and Commitlint | Conventional commits | #978 |
| #878 | chore: sync server/package-lock.json with package.json | Lockfile/Node pin | #963 |
| #913 | fix(ui): add lazy loading to product images | Lazy images | #924 |
| #916 | refactor(client): remove duplicate Google Fonts imports | Google Fonts cleanup | #1062 |
| #956 | fix: add min:0 validation to stock field in Product schema | Stock constraints | #1013 |
| #976 | test: add frontend testing setup and utility teststest: add frontend testing setup … | Frontend test setup | #1009 |
| #1045 | refactor: centralize Google Font imports | Google Fonts cleanup | #1062 |
| #1049 | Add Zod validation for GET /api/products query parameters | Product query validation | #1063 |

## 6. Pull requests — defer beyond v2.0.0 (9)

| PR | Title | Cluster | Note |
|---|---|---|---|
| #751 | feat: add interactive hover effect for category cards | Category hover effect | Defer beyond v2.0.0 |
| #754 | Add Open Graph and Twitter Card meta tags for social sharing | SEO/Open Graph | Defer beyond v2.0.0 |
| #755 | SEO: Add Open Graph / Twitter Card meta tags for social sharing | SEO/Open Graph | Defer beyond v2.0.0 |
| #756 | feat(SEO): add Open Graph and Twitter card meta tags | SEO/Open Graph | Defer beyond v2.0.0 |
| #757 | feat: add Open Graph meta tags | SEO/Open Graph | Defer beyond v2.0.0 |
| #854 | feat: implement React Helmet for dynamic product meta tags | SEO/Open Graph | Defer beyond v2.0.0 |
| #876 | test: setup Playwright E2E tests for checkout flow | Playwright E2E | Defer; not in v2.0.0 without explicit approval |
| #939 | feat: integrate Sentry for global error tracking | Sentry | Defer/optional |
| #1007 | chore(deps): bump @fullcalendar/react from 6.1.20 to 7.0.2 in /client | Dependabot | Close after Phase 2; package is removed |

## 7. Pull requests — held for rebuild (5)

| PR | Title | Cluster | Note |
|---|---|---|---|
| #734 | fix: prevent cart race condition and add fetch timeouts | Cart service/race | Rebuild after quote design |
| #739 | fix: release reserved stock from abandoned carts using background job | Webhook/abandoned cart | Rebuild into Phase 1 services |
| #743 | feat: add Razorpay webhook handler for reliable payment confirmation | Webhook/abandoned cart | Rebuild into Phase 1 services |
| #858 | Refactor: Extract complex cart logic into cartService.js | Cart service/race | Rebuild after quote design |
| #1031 | Fix payment flow with server-side pricing and order snapshot validation | Payment flow | Review; rebuild to Phase 1 design |

---

## Applying this disposition

Applied on 2026-11-15 in one reviewed pass, after explicit maintainer approval. Result, verified against the GitHub API afterwards:

| Check | Before | After |
|---|---:|---:|
| Open issues | 91 | 44 |
| Open pull requests | 221 | 79 |

- 47 issues and 142 pull requests were closed. Every close carried a comment linking to `docs/SCOPE.md` or `ROADMAP.md` Section 13, and a label.
- Labels created: `phase-1`, `phase-2`, `phase-3`, `phase-4`, `phase-5`, `out-of-scope`, `superseded`. Retained issues were tagged with their destination phase.
- Deferred PRs were commented and labeled but left open.
- No pull request was merged. Every surviving PR is rebased or rewritten against Phase 1–3 before merge.
- Zero failures; no target item remained open after the pass.

