# Changelog

All notable changes to the **Enterprise Multi-Tenant SaaS Platform** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-08-06

### ✨ Added
- **Monorepo Setup**: Initialized Turborepo monorepo with `pnpm` workspaces for backend service and frontend application.
- **Backend Architecture**:
  - NestJS 11 framework integration with TypeScript 5.
  - Prisma ORM 7 database schema with PostgreSQL multi-tenant model.
  - Logical Row-Level Security (RLS) data isolation and dedicated `databaseUrl` connection overrides.
  - Passport authentication supporting JWT access/refresh tokens, Google OAuth 2.0, SAML 2.0 (Okta/Azure AD), and TOTP 2FA.
  - `@casl/ability` RBAC framework supporting standard (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `MEMBER`) and custom tenant roles.
  - Stripe subscription integration with webhooks and plan quotas (`FREE`, `PRO`, `ENTERPRISE`).
  - BullMQ and Redis integration for asynchronous job queues and audit log batch processing.
  - Google Gemini AI Assistant endpoint (`@google/generative-ai`).
  - Data export capabilities including PDF reports (`pdfkit`) and Excel spreadsheets (`xlsx`).
- **Frontend Application**:
  - Next.js 16 (App Router) and React 19 architecture.
  - Tailwind CSS v4 styling with Framer Motion animations.
  - Themeable UI components built with Radix UI, Base UI, and Shadcn UI.
  - Comprehensive dashboard pages for Organization Settings, Audit Logs, Custom Roles, Team Invites, Billing, Analytics, and Data Export.
- **DevOps & Infrastructure**:
  - Containerization setup with multi-stage `Dockerfile` and `docker-compose.yml`.
  - Production Kubernetes deployment manifests using Helm Charts.
  - Cloud Infrastructure as Code using Terraform (AWS KMS, S3, RDS, EKS).
  - GitHub Actions CI workflow configuration (`ci.yml`).
