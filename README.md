# 🚀 Enterprise SaaS Platform

<p align="center">
  <strong>Production-ready multi-tenant SaaS architecture built for scale, security, and enterprise workloads.</strong>
</p>

<p align="center">
  A full-stack enterprise platform featuring tenant isolation, RBAC, SSO/SAML, subscription billing, real-time communication, background jobs, AI integration, observability, and cloud-native infrastructure.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Monorepo-Turborepo%20%7C%20pnpm-3178C6?style=for-the-badge&logo=turborepo" alt="Turborepo" />
  <img src="https://img.shields.io/badge/Frontend-Next.js%2016-000000?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Backend-NestJS%2011-E0234E?style=for-the-badge&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" alt="MIT License" />
</p>

---

## 📖 Overview

**Enterprise SaaS Platform** is a scalable full-stack foundation for building modern **B2B multi-tenant SaaS applications**.

The platform is designed around a tenant-first architecture where organizations can securely operate within the same application while maintaining strict data boundaries.

It combines application-level tenant isolation with optional dedicated database infrastructure, making the architecture suitable for both shared SaaS environments and enterprise customers requiring stronger isolation.

The platform includes:

* Multi-tenant organization management
* Fine-grained RBAC
* Enterprise SSO and SAML
* OAuth authentication
* MFA / 2FA
* Subscription billing
* Usage metering and quotas
* Feature flags
* Real-time WebSockets
* Redis-backed background processing
* AI-powered capabilities
* Audit logging
* Data exports
* AWS infrastructure
* Kubernetes deployment
* Terraform infrastructure as code
* OpenTelemetry observability

---

# ✨ Core Capabilities

## 🏢 Multi-Tenancy

The platform supports multiple organizations operating independently within the same application.

### Tenant isolation

Every authenticated request is associated with an organization context.

```text
User
 │
 ▼
Authentication
 │
 ▼
Organization Context
 │
 ▼
Tenant Authorization
 │
 ▼
Database Query
 │
 ▼
Tenant-Scoped Data
```

The architecture supports two isolation strategies:

### Shared Database

Organizations share the same PostgreSQL infrastructure while records are scoped by tenant identifiers.

### Dedicated Database

Enterprise tenants can be configured with dedicated database connection URLs for stronger physical isolation.

---

## 🔐 Enterprise Authentication

The authentication layer supports multiple authentication strategies.

### Supported methods

* Email/password
* JWT authentication
* Google OAuth 2.0
* SAML 2.0
* Enterprise SSO
* TOTP-based MFA / 2FA
* Recovery codes
* Secure session management

Enterprise identity providers can include:

* Okta
* Microsoft Azure AD
* Ping Identity
* Google

---

## 🛡️ Role-Based Access Control

Authorization is implemented using granular permissions and role-based access control.

### Default roles

```text
SUPER_ADMIN
     │
     ├── ADMIN
     │
     ├── MANAGER
     │
     └── MEMBER
```

The architecture also supports custom tenant-specific roles.

Permissions can be used to control access to:

* Organizations
* Users
* Projects
* Billing
* Settings
* Administrative functions
* Data exports
* Security configuration

---

# 💳 Subscription & Billing

The platform integrates with **Stripe** to manage SaaS subscriptions.

### Billing capabilities

* Subscription creation
* Subscription upgrades
* Subscription downgrades
* Subscription cancellation
* Stripe webhooks
* Billing status synchronization
* Plan-based limits
* Usage tracking
* API rate limiting
* Feature entitlements

Example subscription model:

```text
Free
 │
 ▼
Pro
 │
 ▼
Enterprise
```

Each plan can define different:

* User limits
* Project limits
* API quotas
* Features
* Usage limits

---

# 🚦 Usage Metering & Rate Limiting

The platform provides mechanisms for controlling resource consumption.

Capabilities include:

* API rate limiting
* Monthly usage tracking
* Tenant quotas
* User limits
* Project limits
* Subscription-based restrictions
* Feature flags
* Trial expiration

This allows SaaS operators to enforce commercial and technical limits at the tenant level.

---

# ⚡ Real-Time Infrastructure

Real-time communication is powered by **Socket.IO**.

Potential use cases include:

* Live notifications
* Team activity
* Real-time dashboard updates
* Collaboration events
* System notifications
* Security events

```text
Client
  │
  │ WebSocket
  ▼
NestJS
  │
  ▼
Socket.IO
  │
  ├── User Events
  ├── Organization Events
  └── System Events
```

---

# 🔄 Background Jobs

Long-running and asynchronous operations are handled using **BullMQ + Redis**.

Example workloads include:

* Email delivery
* Audit processing
* Data exports
* Report generation
* Webhook processing
* Background AI tasks

```text
API Request
    │
    ▼
Create Job
    │
    ▼
Redis / BullMQ
    │
    ▼
Worker
    │
    ▼
Background Task
```

This prevents expensive operations from blocking API requests.

---

# 🤖 AI Integration

The platform includes integration with the **Google Gemini API** for AI-powered functionality.

Potential applications include:

* AI assistants
* Tenant-aware insights
* Data analysis
* Automated summaries
* Intelligent recommendations
* AI-assisted workflows

The AI layer is designed to operate within the application's tenant context.

---

# 📊 Reporting & Data Export

The platform supports multiple export formats.

### Available formats

* PDF
* Excel
* ZIP archives

These capabilities can be used for:

* Business reports
* Audit reports
* Data exports
* Administrative reports
* Tenant analytics

---

# ☁️ Cloud & Infrastructure

The project is designed with cloud deployment in mind.

### AWS

Infrastructure support includes:

* Amazon S3
* AWS KMS
* Amazon RDS
* Amazon EKS

Tenant-specific encryption keys can be associated with individual organizations when required.

---

# 🐳 Containerization

The application includes Docker-based deployment support.

```text
┌───────────────────────┐
│       Frontend        │
│       Next.js         │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│        Backend        │
│        NestJS         │
└───────────┬───────────┘
            │
       ┌────┴────┐
       ▼         ▼
 PostgreSQL    Redis
```

Docker Compose can be used for local development infrastructure.

---

# ☸️ Kubernetes

Production workloads can be deployed using Kubernetes and Helm.

The repository includes Helm deployment configuration for running the platform in a Kubernetes environment.

Typical deployment flow:

```text
Source Code
     │
     ▼
Docker Image
     │
     ▼
Container Registry
     │
     ▼
Kubernetes
     │
     ▼
EKS Cluster
```

---

# 🏗️ Infrastructure as Code

AWS infrastructure is managed through **Terraform**.

Infrastructure can include:

* VPC networking
* RDS
* S3
* KMS
* EKS
* IAM
* Security configuration

Example:

```bash
cd terraform

terraform init
terraform plan

# Apply when ready
terraform apply
```

---

# 📈 Observability

The backend includes an observability foundation using **OpenTelemetry**.

The architecture is designed to support:

* Distributed tracing
* Structured logging
* Request monitoring
* Service diagnostics
* Performance analysis

This becomes particularly important when the platform is distributed across multiple services and infrastructure components.

---

# 🏛️ System Architecture

```mermaid
graph TD

    User([User / Browser])

    User --> Frontend[Next.js Frontend]

    Frontend --> API[NestJS API]

    API --> Auth[Authentication & SSO]
    API --> Tenant[Multi-Tenant Engine]
    API --> RBAC[RBAC / Authorization]
    API --> Billing[Stripe Billing]
    API --> Queue[BullMQ]
    API --> AI[Gemini AI]
    API --> WS[Socket.IO]

    Tenant --> DB[(PostgreSQL)]
    API --> Redis[(Redis)]

    Queue --> Redis

    API --> Storage[AWS S3]
    API --> KMS[AWS KMS]

    Billing --> Stripe[Stripe API]

    Auth --> Identity[OAuth / SAML Providers]

    API --> Telemetry[OpenTelemetry]
```

---

# 📁 Monorepo Structure

```text
enterprise-saas-platform/
│
├── apps/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed/
│   │
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── organizations/
│   │   │   ├── billing/
│   │   │   ├── roles/
│   │   │   ├── webhooks/
│   │   │   └── ai/
│   │   │
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── decorators/
│   │   │   └── tenant/
│   │   │
│   │   └── main.ts
│   │
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   │
│   └── package.json
│
├── helm/
│   └── enterprise-saas/
│
├── terraform/
│   ├── modules/
│   ├── environments/
│   └── main.tf
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

# 🛠️ Technology Stack

| Layer                | Technology           |
| -------------------- | -------------------- |
| Monorepo             | Turborepo            |
| Package Manager      | pnpm                 |
| Frontend             | Next.js 16           |
| UI                   | React 19             |
| Language             | TypeScript 5         |
| Styling              | Tailwind CSS         |
| UI Components        | Radix UI / Base UI   |
| Animation            | Framer Motion        |
| Backend              | NestJS 11            |
| API                  | REST                 |
| Database             | PostgreSQL           |
| ORM                  | Prisma               |
| Cache                | Redis                |
| Background Jobs      | BullMQ               |
| Real-Time            | Socket.IO            |
| Authentication       | JWT / Passport       |
| Enterprise SSO       | SAML 2.0 / OAuth 2.0 |
| MFA                  | TOTP                 |
| Authorization        | CASL / RBAC          |
| Billing              | Stripe               |
| AI                   | Google Gemini        |
| Storage              | AWS S3               |
| Encryption           | AWS KMS              |
| Observability        | OpenTelemetry        |
| Containers           | Docker               |
| Orchestration        | Kubernetes           |
| Kubernetes Packaging | Helm                 |
| Infrastructure       | Terraform            |
| CI/CD                | GitHub Actions       |

---

# ⚡ Getting Started

## Prerequisites

Make sure you have the following installed:

* Node.js `20.x` or later
* pnpm `9.x` or later
* Docker
* Docker Compose
* PostgreSQL
* Redis

Install pnpm if necessary:

```bash
npm install -g pnpm
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/owizy/enterprise-saas-platform.git
```

```bash
cd enterprise-saas-platform
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start PostgreSQL and Redis

```bash
cd backend
docker compose up -d
cd ..
```

---

# 🔐 Environment Configuration

Create your environment file from the provided example:

```bash
cp backend/.env.example backend/.env
```

Example configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/enterprise_saas?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="change-this-in-production"
JWT_EXPIRES_IN="1d"
REFRESH_TOKEN_SECRET="change-this-too"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Google Gemini
GEMINI_API_KEY="your-api-key"

# AWS
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket"
AWS_KMS_KEY_ARN="your-kms-key"
```

> Never commit production secrets or environment files to source control.

---

# 🗄️ Database Setup

Generate the Prisma client:

```bash
pnpm --filter @multi-tenant/backend prisma:generate
```

Run database migrations:

```bash
pnpm --filter @multi-tenant/backend exec prisma migrate dev
```

---

# ▶️ Development

Start all applications:

```bash
pnpm dev
```

Build the entire monorepo:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
```

Run linting:

```bash
pnpm lint
```

Format the project:

```bash
pnpm format
```

Clean build artifacts:

```bash
pnpm clean
```

Run an individual application:

```bash
pnpm --filter @multi-tenant/backend dev
```

```bash
pnpm --filter @multi-tenant/frontend dev
```

---

# 🔒 Security Architecture

Security is treated as a core part of the platform rather than an afterthought.

The architecture includes:

### Tenant isolation

All organization-scoped operations are associated with an authenticated tenant context.

### RBAC

Authorization is enforced at the application layer using roles and permissions.

### MFA

TOTP-based two-factor authentication provides an additional authentication layer.

### Audit logging

Sensitive operations can be recorded for security and compliance purposes.

### Encryption

AWS KMS can provide tenant-specific encryption keys.

### Session security

Authentication supports secure HTTP-only cookies and token lifecycle management.

---

# 🚀 Deployment

The platform is designed to support several deployment models.

### Local

```text
Docker Compose
      │
      ├── PostgreSQL
      └── Redis
```

### Kubernetes

```text
Kubernetes
    │
    ├── Frontend
    ├── Backend
    ├── Workers
    ├── Redis
    └── PostgreSQL / RDS
```

### AWS

```text
AWS
├── EKS
├── RDS
├── S3
├── KMS
└── IAM
```

Infrastructure configuration is managed through Terraform.

---

# 🗺️ Roadmap

### Platform

* [x] Multi-tenant architecture
* [x] Organization management
* [x] RBAC
* [x] Authentication
* [x] Subscription architecture
* [x] Redis integration
* [x] Background jobs
* [x] WebSockets
* [x] AI integration
* [x] Infrastructure as Code

### Enterprise

* [x] SAML SSO
* [x] OAuth
* [x] MFA
* [x] Tenant isolation
* [x] Audit logging
* [x] Custom domains
* [x] White-labeling
* [x] Regional infrastructure support

### Future

* [ ] Advanced analytics
* [ ] Full admin console
* [ ] Advanced tenant provisioning
* [ ] Automated tenant migration
* [ ] Expanded compliance tooling
* [ ] More identity providers
* [ ] Advanced observability dashboards
* [ ] Automated disaster recovery

---

# 🤝 Contributing

Contributions are welcome.

### Fork the repository

```bash
git clone https://github.com/owizy/enterprise-saas-platform.git
```

### Create a feature branch

```bash
git checkout -b feature/your-feature
```

### Commit your changes

```bash
git add .
git commit -m "feat: add your feature"
```

### Push the branch

```bash
git push origin feature/your-feature
```

Then open a Pull Request with a clear description of the changes.

---

# 📜 License

This project is distributed under the **MIT License**.

See the [`LICENSE`](./LICENSE) file for details.

---

# 👨‍💻 Author

**Owizy**

GitHub:
https://github.com/owizy

---

# ⭐ Support

If this project is useful to you, consider giving it a ⭐ on GitHub.

It helps showcase the project and supports continued development.

---

<p align="center">
  <strong>Enterprise SaaS infrastructure, built with modern TypeScript.</strong>
</p>
