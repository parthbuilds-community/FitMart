# 🤝 Contributing to FitMart

First off — **thank you** for taking the time to contribute! 🎉

Whether you're fixing a bug, adding a feature, improving docs, or just asking a question — every contribution matters and you are welcome here.

This guide will walk you through **everything** you need to know to contribute to FitMart, whether you're contributing to open source for the first time or you're a seasoned developer.

---

## 📌 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How Can I Contribute?](#-how-can-i-contribute)
- [Getting Started (Step-by-Step)](#-getting-started-step-by-step)
- [Picking an Issue](#-picking-an-issue)
- [Branching Strategy](#-branching-strategy)
- [Making Your Changes](#-making-your-changes)
- [Commit Message Convention](#-commit-message-convention)
- [Submitting a Pull Request](#-submitting-a-pull-request)
- [PR Review Process](#-pr-review-process)
- [Project Structure Reference](#-project-structure-reference)
- [Style Guide](#-style-guide)
- [Need Help?](#-need-help)

---

## 🧭 Code of Conduct

By participating in this project, you agree to be respectful and constructive. We expect everyone to:

- Use welcoming and inclusive language
- Be respectful of different viewpoints and experiences
- Gracefully accept constructive feedback
- Focus on what's best for the community

Harassment or toxic behavior of any kind will not be tolerated.

---

## 💡 How Can I Contribute?

You don't need to write code to contribute! Here are all the ways you can help:

| Type | Examples |
|------|---------|
| 🐛 **Bug Fix** | Fix broken functionality, handle edge cases |
| ✨ **New Feature** | Add something new to the app |
| 📖 **Documentation** | Improve README, add JSDoc comments, fix typos |
| 🎨 **UI/UX** | Improve design, responsiveness, accessibility |
| 🧪 **Tests** | Add unit or integration tests |
| 🔧 **Refactor** | Clean up code without changing behavior |
| 💬 **Discussion** | Comment on issues, review PRs, share ideas |

---

## 🚀 Getting Started (Step-by-Step)

### For Beginners — Read This Carefully!

If this is your first time contributing to open source, follow every step below. Don't skip anything!

---

### Step 1: Fork the Repository

Go to the [FitMart GitHub page](https://github.com/parthnarkar/FitMart) and click the **Fork** button (top right corner).

This creates your own copy of the project under your GitHub account.

---

### Step 2: Clone Your Fork

```bash
git clone https://github.com/<your-username>/FitMart.git
cd FitMart
```

> Replace `<your-username>` with your actual GitHub username.

---

### Step 3: Add the Upstream Remote

This connects your local copy to the original FitMart repo so you can pull in future updates:

```bash
git remote add upstream https://github.com/parthnarkar/FitMart.git
```

Verify it worked:

```bash
git remote -v
# Should show both origin (your fork) and upstream (original)
```

---

### Step 4: Set Up the Project Locally

Follow the [Quick Start guide in README.md](../README.md#-quick-start) to get both the client and server running locally.

You will need accounts or API keys for the following services:

| Service | Required? | Purpose |
|---|---|---|
| MongoDB Atlas (or local) | ✅ Required | Primary database |
| Firebase | ✅ Required | Authentication |
| Razorpay | ⚠️ Optional | Payment processing |
| Google Gemini API | ⚠️ Optional | AI chatbot |
| RapidAPI (ExerciseDB) | ⚠️ Optional | Exercise library |
| SMTP provider | ⚠️ Optional | Transactional emails |

> ✅ Make sure the app runs on your machine **before** making any changes.
> Optional services fail gracefully — you don't need all of them to run the app locally.

---

### Step 5: Keep Your Fork Updated

Before starting any new work, always sync with the latest changes from the original repo:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

---

## 🎯 Picking an Issue

### Finding Issues to Work On

Browse the [Issues tab](https://github.com/parthnarkar/FitMart/issues) and look for these labels:

| Label | Meaning |
|-------|---------|
| `good first issue` | 🌱 Great for beginners — well-scoped and documented |
| `help wanted` | Open for anyone to pick up |
| `bug` | Something is broken |
| `enhancement` | New feature or improvement |
| `documentation` | Docs-related work |

### Before You Start

**Always comment on the issue first!** Say something like:

> "Hey, I'd like to work on this! I'll have a PR ready by [rough timeline]."

This prevents two people from working on the same thing. The maintainer will assign it to you.

### Good First Contributions

If you're not sure where to start, here are some concrete areas that always benefit from attention:

- Replacing any hardcoded `http://localhost:5000` API URLs with `import.meta.env.VITE_API_URL`
- Improving responsiveness of existing pages on mobile viewports
- Adding JSDoc comments to utility functions in `client/src/utils/`
- Writing more thorough input validation on form components
- Improving accessibility (ARIA labels, keyboard navigation)

### Want to Work on Something Not Listed?

Open a new issue first and describe what you'd like to do. Wait for a maintainer to respond before starting large changes — this avoids wasted effort.

---

## 🌿 Branching Strategy

**Never commit directly to `main`.** Always work on a separate branch.

### Branch Naming

Use this format: `type/short-description`

```bash
# Examples:
git checkout -b fix/cart-reservation-bug
git checkout -b feat/product-search
git checkout -b docs/improve-contributing-guide
git checkout -b refactor/api-url-standardize
git checkout -b feat/workout-sync
```

| Prefix | Use For |
|--------|---------|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes |
| `refactor/` | Code cleanup |
| `test/` | Adding/updating tests |
| `chore/` | Build scripts, config, etc. |

---

## 🛠️ Making Your Changes

1. Make sure you're on your feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes in small, logical steps.

3. Test your changes locally — make sure everything still works.

4. If you've added a new route to the server, verify it appears correctly in the API Reference section of the README, and update it if not.

5. If you've added a new page or component, verify the [Project Structure](#-project-structure-reference) in the README accurately reflects it.

6. Stage and commit your changes (see commit format below):
   ```bash
   git add .
   git commit -m "feat: add product search functionality"
   ```

7. Push to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```

---

## 📝 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard. This keeps the history clean and readable.

### Format

```
type(scope): short description

[optional longer description]

[optional: closes #issue-number]
```

### Examples

```bash
feat(cart): add quantity update button on cart page
fix(auth): resolve Google sign-in redirect loop
docs(readme): add environment variable instructions
refactor(client): replace hardcoded API URLs with VITE_API_URL
feat(exercises): add exercise browser with ExerciseDB integration
fix(chatbot): add Gemini fallback responses for API unavailability
chore: update dependencies
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting (no logic change) |
| `refactor` | Code restructure (no feature/fix) |
| `test` | Adding or updating tests |
| `chore` | Build, config, tooling changes |

> 💡 Keep the subject line under **72 characters** and in **lowercase**.

---

## 🔃 Submitting a Pull Request

Once your changes are pushed to your fork:

1. Go to the original [FitMart repo](https://github.com/parthnarkar/FitMart).
2. You'll see a **"Compare & pull request"** banner — click it.
3. Fill out the PR template completely (see below).
4. Set the base branch to `main`.
5. Click **"Create Pull Request"**.

### PR Title Format

Use the same convention as commits:

```
feat(product): add product filter by category
fix(payment): handle failed payment edge case
docs(contributing): update env variable table
```

### PR Description Template

Please fill this out when opening a PR:

```markdown
## 📋 What does this PR do?
A clear summary of the changes made.

## 🔗 Related Issue
Closes #<issue-number>

## 🧪 How was this tested?
Describe how you tested your changes (manual steps, screenshots, etc.)

## 📸 Screenshots (if UI changes)
Before / After screenshots if you changed any UI.

## ✅ Checklist
- [ ] I've read the CONTRIBUTING guide
- [ ] My code follows the project's style guidelines
- [ ] I've tested my changes locally
- [ ] I've linked the related issue
- [ ] I haven't introduced any new secrets or API keys
- [ ] I've updated README.md if I added a new route, page, component, or env variable
```

---

## 🔍 PR Review Process

After you open a PR:

1. **Automated checks** may run (linting, etc.) — make sure they pass.
2. The **maintainer (Parth)** will review your PR and may leave comments.
3. If changes are requested:
   - Make the changes on the **same branch**
   - Push the new commits — the PR updates automatically
   - Reply to comments once addressed
4. Once approved, your PR will be **merged** 🎉

> ⏱️ Be patient — reviews can take a few days. Feel free to ping if there's no response after a week.

---

## 📁 Project Structure Reference

```
FitMart/
├── client/                   # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components (uses Framer Motion for animations)
│   │   ├── auth/             # Firebase auth setup & hooks
│   │   ├── pages/            # Route-level page components
│   │   └── utils/            # Helper/utility functions
│   └── .env.local            # ⚠️ Not committed — create manually
│
├── server/                   # Node.js + Express Backend
│   ├── middleware/           # Express middleware (logger, auth verification)
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Route handlers
│   ├── services/             # Business logic services (email, etc.)
│   ├── db.js                 # MongoDB connection
│   ├── firebaseAdmin.js      # Firebase Admin SDK setup
│   ├── index.js              # Server entry point (middleware, routes, error handler)
│   ├── seed.js               # Product DB seed script
│   └── seedFitnessCenters.js # Fitness center DB seed script
│
└── docs/
    ├── CONTRIBUTING.md                 # This file
    ├── FIRST_PURCHASE_EMAIL_SETUP.md   # Email feature setup guide
    └── SECURITY.md                     # Responsible disclosure policy
```

### Key Conventions to Know

**Adding a new backend route:**
1. Create your route file in `server/routes/your-feature.js`
2. Register it in `server/index.js` with `app.use('/api/your-feature', require('./routes/your-feature'))`
3. Create the corresponding Mongoose model in `server/models/YourModel.js` if needed
4. Update the API Reference table in `README.md`

**Adding a new frontend page:**
1. Create your component in `client/src/pages/YourPage.jsx`
2. Import it in `client/src/App.jsx` and add the `<Route>` entry
3. Update the Pages & Routes table in `README.md`
4. If your page needs auth guarding, wrap it in `<AdminRoute>` or `<NonAdminRoute>`

**Adding a new environment variable:**
1. Add it to `server/.env` or `client/.env` locally
2. Document it in the Environment Variables section of `README.md`
3. Add a `.env.example` entry if one exists for that directory

**Adding a new service (email, third-party API, etc.):**
1. Create it in `server/services/your-service.js`
2. Fail gracefully when env variables are missing — never crash the server
3. Document the required env variables in `README.md` and `docs/FIRST_PURCHASE_EMAIL_SETUP.md` (or a new doc) if the setup is non-trivial

---

## 🎨 Style Guide

### JavaScript / React

- Use **functional components** with hooks (no class components)
- Prefer **`const`** over `let`; avoid `var`
- Use **async/await** over raw Promises where possible
- Keep components small and single-purpose
- Name component files with **PascalCase** (e.g., `ProductCard.jsx`)
- Name utility files with **camelCase** (e.g., `formatPrice.js`)
- Use the `normalizeProduct` utility from `client/src/utils/normalizeProduct.js` when working with product data from the API to safely handle both `id` and `productId` fields

### CSS / Tailwind

- Use **Tailwind utility classes** wherever possible
- Stick to the `stone-*` color palette only — no blue, green, or purple (see the Design System in `client/DesignSystem.md`)
- Keep custom CSS to a minimum
- Ensure UI is responsive and works on mobile
- Use `rounded-full` for buttons, `rounded-2xl` for cards, and `rounded-lg` for inputs
- Always precede major section headings with the eyebrow label pattern: `text-xs tracking-[0.2em] uppercase text-stone-400`
- Use `DM Serif Display` for headings and `DM Sans` for body/UI text

### Backend (Node/Express)

- Keep route files focused on a single resource
- Put business logic and reusable logic in `server/services/` — not directly in routes
- Always validate input (required fields, types) and return clear error messages
- Always handle errors with try/catch and return a clean JSON error response
- Use the `verifyFirebaseToken` middleware from `server/middleware/verifyFirebaseToken.js` for any endpoint that requires a logged-in user
- Never log or expose sensitive values (API keys, passwords) — the request logger already redacts `password`, `token`, `secret`, and `apiKey` keys
- New services that depend on env variables must fail gracefully (log a warning, return null, and allow the rest of the app to function) — do not call `process.exit()`

### Animations (Framer Motion)

- Use **Framer Motion** for all UI animations — page transitions, modal entrances, hover effects
- Keep animations quick (150-300ms) and subtle — no distracting or overly complex movements
- Prefer `motion` components over CSS transitions for interactive elements
- Use `AnimatePresence` for exit animations on unmounting components
- Example pattern:
  ```jsx
  import { motion, AnimatePresence } from 'framer-motion';
  
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
  >
  ```

### General

- **No hardcoded URLs** — use `import.meta.env.VITE_API_URL` on the client and environment variables on the server
- **No committed secrets** — `.env` files are gitignored for a reason
- Delete commented-out code before submitting a PR
- Write clear variable and function names — code should read like English
- When touching `UserProfile`, remember it tracks `email`, `firstPurchaseEmailSentAt`, and `lastReminderEmailSentAt` for the email services — don't overwrite these fields unintentionally
- **Animations** — Use **[Framer Motion](https://www.framer.com/motion/)** for all animations and transitions (page entrances, modals, hover effects, etc.). Keep animations subtle and performant — avoid over-animating.

---

## 🆘 Need Help?

Stuck? Don't worry — everyone was a beginner once.

- 💬 **Comment on the issue** you're working on with your question
- 🐛 **Open a new issue** with the `question` label
- 📖 **Re-read the README** — the setup steps cover most common problems
- 🔐 **For security issues**, follow the responsible disclosure process in [`docs/SECURITY.md`](SECURITY.md) — do not open a public issue

> There are no dumb questions. Ask away! 🙌

---

<div align="center">

**Happy coding! We're glad you're here.** 🚀

Made with ❤️ by [Parth Narkar](https://github.com/parthnarkar) and the [Parth Builds Community](https://www.instagram.com/parth.builds/)

</div>