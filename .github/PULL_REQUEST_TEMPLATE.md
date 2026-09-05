## 📌 Description

Please include a summary of the change, relevant context, and motivation. List any dependencies required for this change.

Fixes #(issue)

---

## 🛠️ Type of Change

- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality)
- [ ] 💥 Breaking change (fix or feature causing existing functionality to break)
- [ ] 📝 Documentation update
- [ ] 🔧 Refactoring or performance optimization
- [ ] 🐳 DevOps / CI/CD pipeline adjustment

---

## 🔒 Security & Multi-Tenancy Review

- [ ] Does this change respect tenant data isolation (`organizationId` filter / dynamic database routing)?
- [ ] Are input parameters validated with `class-validator` or `zod`?
- [ ] Have authentication/authorization checks (CASL abilities) been verified?

---

## ✅ Checklist

- [ ] My code follows the project's coding and style guidelines.
- [ ] I have performed a self-review of my own code.
- [ ] I have commented complex or non-obvious code logic.
- [ ] I have updated corresponding documentation (`README.md`, inline Swagger/JSDoc).
- [ ] My changes generate no new warnings or lint errors (`pnpm lint`).
- [ ] I have added tests that prove my fix is effective or feature works (`pnpm test`).
- [ ] All existing automated tests pass locally.
