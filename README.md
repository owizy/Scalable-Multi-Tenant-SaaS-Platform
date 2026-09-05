# 🚀 Enterprise Multi-Tenant SaaS Platform

[![Monorepo Structure](https://img.shields.io/badge/Monorepo-Turborepo%20%7C%20pnpm-blue.svg?style=for-the-badge&logo=turborepo)](https://turbo.build/)
[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016%20App%20Router-black.svg?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS 11](https://img.shields.io/badge/Backend-NestJS%2011-e0234e.svg?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Database-Prisma%20%2B%20PostgreSQL-2D3748.svg?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.x-3178C6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](#license)

An enterprise-grade, high-performance, multi-tenant B2B SaaS boilerplate and application core built with modern monorepo architecture. Designed from the ground up for strict data isolation, scalable tenant management, enterprise SSO/SAML authentication, Stripe subscription billing, granular role-based access control (RBAC), and multi-region infrastructure deployment.

---

## 📋 Table of Contents

- [Architectural Highlights](#-architectural-highlights)
- [Key Features & Capability Matrix](#-key-features--capability-matrix)
- [System Architecture](#-system-architecture)
- [Monorepo Structure](#-monorepo-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Local Setup](#installation--local-setup)
  - [Environment Configuration](#environment-configuration)
  - [Database Setup & Migrations](#database-setup--migrations)
- [Available Scripts](#-available-scripts)
- [Infrastructure & Deployment](#-infrastructure--deployment)
  - [Docker & Docker Compose](#docker--docker-compose)
  - [Kubernetes & Helm](#kubernetes--helm)
  - [Terraform Infrastructure as Code](#terraform-infrastructure-as-code)
- [Security & Compliance](#-security--compliance)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Architectural Highlights

* **Monorepo Workflow**: Managed via **Turborepo** and **pnpm workspaces** for maximum caching efficiency, rapid builds, and shared tooling across apps and services.
* **Dual Multi-Tenancy Engine**: Supports both **Logical Row-Level Security (RLS)** / tenant ID filtering for shared databases and **Dedicated Database URL Override** for enterprise-grade physical data isolation.
* **Modern SaaS Frontend**: Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Framer Motion**, and **Shadcn UI / Base UI** components, providing a modern themeable interface (Light/Dark mode).
* **Robust Enterprise Backend**: Powered by **NestJS 11**, incorporating dependency injection, modular controllers, Passport authentication strategies, OpenTelemetry distributed tracing, and Redis job queues.
* **Production Infrastructure Ready**: Includes production **Dockerfiles**, **Helm Charts** for Kubernetes orchestration, and **Terraform** modules for AWS provisioning (KMS, S3, RDS, EKS).

---

## 🛠️ Key Features & Capability Matrix

### 🔒 Enterprise Security & Authentication
- **Multi-Provider Auth**: Native Email/Password authentication with bcrypt encryption alongside OAuth 2.0 (Google) and Enterprise SAML 2.0 (Okta, Azure AD, Ping Identity).
- **Two-Factor Authentication (2FA/MFA)**: TOTP-based 2FA with QR code setup, recovery codes, and `otplib` validation.
- **Granular RBAC**: Fine-grained authorization powered by `@casl/ability` supporting system roles (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `MEMBER`) and custom tenant roles.
- **Security Guardrails**: IP Whitelisting, Domain Whitelisting, Legal Hold status enforcement, and emergency Organization Locking.

### 🏢 Multi-Tenancy & Governance
- **Tenant Isolation**: Strict tenant scoping across all database operations with Prisma middleware/extensions.
- **Organization Hierarchies**: Support for parent-child organization relationships and inherited policy rules.
- **White-Labeling & Custom Domains**: Custom CNAME domain routing, verification status tracking, custom brand logos, and dynamic primary/secondary color theme injection.
- **Data Sovereignty & Multi-Region**: Region group tagging (`US`, `EU`, `ASIA`), regional storage allocation (AWS S3), and isolated KMS key encryption per tenant.

### 💰 Billing, Metering & Feature Flags
- **Stripe Integration**: Complete subscription lifecycle management with Stripe Webhooks, supporting Free, Pro, and Enterprise subscription tiers.
- **Hard Quotas & Rate Limiting**: Monthly API usage tracking, user/project limits per tier, and rate throttling using NestJS Throttler.
- **Dynamic Feature Flags**: Tenant-specific feature flag toggles with trial expiration windows.

### 🔄 Real-Time & Background Processing
- **Distributed Queues**: Async job processing powered by **BullMQ** and **Redis** for tasks like email delivery, data exports, and audit logging.
- **Real-Time WebSockets**: Live event streaming using **Socket.IO** for in-app updates and team notifications.
- **SIEM & External Webhooks**: Event dispatching system for external security webhooks and Slack notifications.

### 🤖 AI & Analytics Engine
- **Generative AI Assistant**: Integrated **Google Gemini API** (`@google/generative-ai`) for smart insights and tenant context assistance.
- **Data Export & Reporting**: Built-in PDF report generation (`pdfkit`), Excel spreadheet exports (`xlsx`), and multi-file zip archiving (`archiver`).

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([User / Web Browser]) -->|HTTPS| Frontend[Next.js 16 Frontend App]
    Frontend -->|REST API / WebSockets| Backend[NestJS 11 Backend API]
    
    subgraph Monorepo Boundary
        Backend --> AuthService[Auth & SAML Module]
        Backend --> TenantService[Multi-Tenant & RBAC Engine]
        Backend --> BillingService[Stripe Billing & Quotas]
        Backend --> QueueService[BullMQ Queue Manager]
        Backend --> AIService[Gemini AI Integration]
    end

    Backend -->|Prisma ORM| Postgres[(PostgreSQL Database)]
    Backend -->|Caching & State| Redis[(Redis Broker)]
    QueueService --> Redis
    Backend -->|Storage & KMS| AWS[AWS S3 / KMS Key Vault]
    BillingService -->|Webhooks & Checkout| Stripe[Stripe API]
    AuthService -->|SAML 2.0 / OAuth| IdP[Identity Providers / Okta / Google]
```

---

## 📁 Monorepo Structure

```text
multi_tenant/
├── apps / services / packages
│   ├── backend/                     # NestJS enterprise backend API
│   │   ├── prisma/                  # Prisma schema, migrations, & seeds
│   │   ├── src/
│   │   │   ├── modules/             # Auth, Users, Orgs, Billing, Roles, Webhooks, AI
│   │   │   ├── common/              # Guards, Interceptors, Decorators, RLS Filters
│   │   │   └── main.ts              # Backend entrypoint & Swagger setup
│   │   ├── Dockerfile               # Backend container specification
│   │   └── docker-compose.yml       # Local database & Redis setup
│   │
│   └── frontend/                    # Next.js 16 modern SaaS frontend UI
│       ├── src/
│       │   ├── app/                 # Next.js App Router (Dashboard, Settings, Admin)
│       │   ├── components/          # Reusable UI component library (Shadcn / Base UI)
│       │   └── lib/                 # API clients, hooks, state utilities
│       └── package.json
│
├── helm/                            # Kubernetes Helm deployment manifests
├── terraform/                       # Infrastructure as Code for Cloud (AWS KMS, S3, EKS)
├── turbo.json                       # Turborepo build task orchestrator
├── pnpm-workspace.yaml              # Monorepo workspace configuration
└── package.json                     # Root monorepo scripts & dependencies
```

---

## 💻 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Monorepo & Tooling** | Turborepo, pnpm workspaces, TypeScript 5, Prettier, ESLint |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & UI Components** | Tailwind CSS v4, Framer Motion, Radix UI, Base UI, Lucide Icons |
| **State & Forms** | React Hook Form, Zod validation, Axios, js-cookie |
| **Backend Framework** | NestJS 11, Express, TypeScript |
| **Database & ORM** | PostgreSQL 16+, Prisma ORM 7, Redis 7+ |
| **Queue & Messaging** | BullMQ, Socket.IO, ioredis |
| **Security & Auth** | Passport.js, SAML 2.0 (`@node-saml/passport-saml`), JWT, bcrypt, OTPLib |
| **Integrations** | Stripe API, AWS SDK (S3, KMS), Google Gemini AI API |
| **Telemetry & Observability** | OpenTelemetry Node SDK, Winston Logger |
| **DevOps & Cloud** | Docker, Kubernetes / Helm, Terraform, GitHub Actions |

---

## ⚡ Getting Started

### Prerequisites

Ensure you have the following installed on your developer machine:

* **Node.js**: `v20.x` or higher
* **pnpm**: `v9.x` or higher (`npm install -g pnpm`)
* **Docker Desktop** (or Docker Engine + Docker Compose)
* **PostgreSQL** & **Redis** (or run via Docker Compose)

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/multi_tenant.git
   cd multi_tenant
   ```

2. **Install monorepo dependencies**:
   ```bash
   pnpm install
   ```

3. **Start local infrastructure services (PostgreSQL & Redis)**:
   ```bash
   cd backend
   docker compose up -d
   cd ..
   ```

---

### Environment Configuration

Configure the `.env` file in the `backend` directory. An example template is available at `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

Key environment variables:

```env
# Database Connections
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/multi_tenant_db?schema=public"
REDIS_URL="redis://localhost:6379"

# Security & JWT
JWT_SECRET="super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="1d"
REFRESH_TOKEN_SECRET="super-secret-refresh-key"

# Billing (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AI Integrations
GEMINI_API_KEY="AIzaSy..."

# AWS Storage & Encryption (Optional for Local Dev)
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="multi-tenant-storage"
AWS_KMS_KEY_ARN="arn:aws:kms:us-east-1:123456789012:key/example"
```

---

### Database Setup & Migrations

From the root directory, generate the Prisma Client and run database migrations:

```bash
# Generate Prisma Client code
pnpm --filter @multi-tenant/backend prisma:generate

# Run schema migrations on the database
pnpm --filter @multi-tenant/backend exec prisma migrate dev
```

---

## 🚀 Available Scripts

Run scripts from the workspace root to execute across all apps using Turborepo:

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts development servers for both `frontend` and `backend` concurrently |
| `pnpm build` | Builds production artifacts for all workspace apps |
| `pnpm test` | Runs unit and integration test suites |
| `pnpm lint` | Runs ESLint code checks across all workspace modules |
| `pnpm format` | Formats code files using Prettier |
| `pnpm clean` | Cleans build output folders (`dist`, `.next`) and Turborepo caches |

To target a specific package:
```bash
pnpm --filter @multi-tenant/backend dev
pnpm --filter @multi-tenant/frontend dev
```

---

## 🐳 Infrastructure & Deployment

### Docker & Docker Compose

To build and run the backend service in containerized mode:

```bash
cd backend
docker build -t multi-tenant-backend .
docker compose up -d
```

### Kubernetes & Helm

Production deployment manifests are structured under the `helm/` directory:

```bash
# Lint Helm chart template
helm lint ./helm

# Dry-run deployment to target cluster
helm install multi-tenant-app ./helm --dry-run --debug
```

### Terraform Infrastructure as Code

Cloud infrastructure resources (AWS S3 buckets, KMS encryption keys, RDS databases, EKS cluster roles) are managed in `terraform/`:

```bash
cd terraform
terraform init
terraform plan
# terraform apply
```

---

## 🛡️ Security & Compliance

This platform enforces enterprise security best practices:

* **Zero-Trust Tenant Isolation**: Every request is scoped to an authenticated Organization ID context.
* **Audit Logging**: Sensitive actions (role changes, data export, SSO configuration) produce immutable audit records.
* **Physical Isolation Ready**: Enterprise tenants can be configured with distinct dedicated database connection strings (`databaseUrl`) and regional AWS KMS encryption keys (`kmsKeyArn`).
* **Session & Token Management**: Secure HttpOnly cookie support, token revocation via Redis blacklists, and rotation strategies for JWT refresh tokens.

---

## 🤝 Contributing

Contributions are always welcome! Please read the contribution guidelines before submitting pull requests:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
# Scalable-Multi-Tenant-SaaS-Platform
