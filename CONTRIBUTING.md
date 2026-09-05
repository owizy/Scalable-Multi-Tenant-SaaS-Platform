# Contributing Guidelines

Thank you for your interest in contributing to the **Enterprise Multi-Tenant SaaS Platform**! We welcome contributions from developers of all skill levels.

Please take a moment to review this document before submitting your code or opening an issue.

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How Can I Contribute?](#-how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Local Development Setup](#-local-development-setup)
- [Monorepo & Coding Standards](#-monorepo--coding-standards)
  - [Git Commit Guidelines](#git-commit-guidelines)
  - [Code Linting & Formatting](#code-linting--formatting)
  - [Testing Standards](#testing-standards)
- [Pull Request Checklist](#-pull-request-checklist)

---

## 📜 Code of Conduct

This project adheres to our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold these standards. Please report unacceptable behavior to security or maintainers.

---

## 💡 How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please search existing issues to avoid duplicates.

When filing a bug report via [GitHub Issues](https://github.com/your-org/multi_tenant/issues):
* Use the **Bug Report** template.
* Include a clear and descriptive title.
* Provide step-by-step instructions to reproduce the problem.
* Mention your Node.js, pnpm, browser, operating system, and database versions.
* Include relevant log snippets, error tracebacks, or screenshots.

### Suggesting Features

Feature requests are tracked via [GitHub Issues](https://github.com/your-org/multi_tenant/issues):
* Use the **Feature Request** template.
* Provide a clear rationale explaining why this capability is useful to multi-tenant applications.
* Outline the expected API endpoints, UI layouts, or data model changes.

### Submitting Pull Requests

1. **Fork the Repository**: Create your copy of the repository.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/my-new-feature
   # or
   git checkout -b fix/issue-123-bug-fix
   ```
3. **Commit Your Changes**: Follow our Conventional Commits standard.
4. **Push to Your Fork**:
   ```bash
   git push origin feature/my-new-feature
   ```
5. **Open a Pull Request**: Submit your PR targeting the `main` branch.

---

## 💻 Local Development Setup

1. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/multi_tenant.git
   cd multi_tenant
   ```

2. **Install workspace dependencies**:
   ```bash
   pnpm install
   ```

3. **Start local services (PostgreSQL & Redis)**:
   ```bash
   cd backend
   docker compose up -d
   cd ..
   ```

4. **Environment setup & database migration**:
   ```bash
   cp backend/.env.example backend/.env
   pnpm --filter @multi-tenant/backend prisma:generate
   pnpm --filter @multi-tenant/backend exec prisma migrate dev
   ```

5. **Start development mode**:
   ```bash
   pnpm dev
   ```

---

## 🛠️ Monorepo & Coding Standards

### Git Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature or capability (e.g., `feat(auth): add SAML 2.0 single sign-on support`)
- `fix:` A bug fix (e.g., `fix(billing): resolve quota calculation offset`)
- `docs:` Documentation changes only (e.g., `docs: update architecture guidelines`)
- `style:` Formatting changes with no production logic modifications
- `refactor:` Code refactoring that neither fixes a bug nor adds a feature
- `test:` Adding or updating unit/integration tests
- `chore:` Maintenance tasks, dependency bumps, build configurations

### Code Linting & Formatting

Run the linter and formatter before committing:
```bash
# Check code style and formatting
pnpm lint

# Auto-format code
pnpm format
```

### Testing Standards

All pull requests introducing new backend services or frontend components must include automated tests:

```bash
# Run unit & integration test suite
pnpm test
```

- **Backend**: Use **Jest** and NestJS Testing Module for unit specs (`*.spec.ts`) and end-to-end specs (`test/jest-e2e.json`).
- **Data Isolation**: Ensure unit tests verify tenant ID isolation logic.

---

## ✅ Pull Request Checklist

Before marking your PR as ready for review:

- [ ] My code builds cleanly using `pnpm build`.
- [ ] All lint checks pass with `pnpm lint`.
- [ ] Automated tests pass with `pnpm test`.
- [ ] I have added appropriate tests for new code logic.
- [ ] I have updated relevant documentation (`README.md`, inline JSDoc/Swagger annotations).
- [ ] My commit messages follow Conventional Commits format.

Thank you for helping build an enterprise-ready SaaS framework! 🚀
