# Multi-Tenant SaaS Backend Architecture Documentation

This documentation provides a comprehensive overview of the Enterprise Multi-Tenant SaaS Backend, built using **NestJS**, **TypeScript**, **Prisma (PostgreSQL)**, and **Redis/BullMQ**. 

It is structured to support tiered tenant subscriptions, advanced enterprise compliance (legal holds, SIEM integration, lockdown mechanisms), white-label customization, AI emotional/predictive metrics, and Bring Your Own Key (BYOK) data encryption.

---

## 🏛️ System Architecture Overview

The system uses a shared database, multi-tenant database approach where some tenants reside in a shared schema with dynamic row-level isolation logic, while elite tenants can be provisioned with dedicated isolated database URLs.

```mermaid
graph TD
    Client[Web/Mobile Client] -->|HTTPS Requests| MainApp[NestJS Backend Port: 4000]
    
    subgraph Request Pipeline
        MainApp --> ReqId[RequestIdMiddleware]
        ReqId --> ClsCtx[ClsModule Request Context]
        ClsCtx --> Throttler[TenantThrottlerGuard]
        Throttler --> IpGuard[IpAccessGuard]
        IpGuard --> Lockdown[LockdownGuard]
        Lockdown --> AuthGuard[JwtAuthGuard / ApiKeyGuard]
        AuthGuard --> FeatGuard[FeatureGuard]
        FeatGuard --> QuotaGuard[QuotaGuard]
    end
    
    subgraph Services & Processing
        QuotaGuard --> Controllers[Controller / Module Actions]
        Controllers --> Audit[AuditLogInterceptor]
        Controllers --> KMS[EncryptionService AWS KMS BYOK]
        Controllers --> Gemini[AiService Gemini API]
        Controllers --> Jobs[BullMQ / Redis Background Jobs]
    end
    
    subgraph Storage Layer
        Controllers --> Prisma[Prisma ORM Client]
        Prisma --> SharedDB[(Shared PostgreSQL DB)]
        Prisma --> DedicatedDB[(Isolated Tenant DBs)]
        Controllers --> S3[StorageService AWS S3]
    end
```

---

## 🗄️ Database Schema & Data Model (`prisma/schema.prisma`)

The database uses PostgreSQL as the core transactional engine, with PGVector for semantic embedding storage.

### Core Models

#### 1. `Organization` (Tenant Model)
Serves as the tenant boundary. Contains configurations for various phases of maturity:
* **Tenant Hierarchies**: `parentId` and self-relation `children` allow enterprise organizations to map departments or subsidiaries.
* **Billing & Subscriptions**: Holds references to `stripeCustomerId`, `subscriptionId`, `subscriptionTier` (`FREE`, `PRO`, `ENTERPRISE`), and status.
* **White-Labeling & Customization**: Supports custom brand colors (`brandColorPrimary`, `brandColorSecondary`), logos (`logoUrl`), custom domain settings (`customDomain`, `customDomainStatus`), and timezones/branding metadata (`settings`).
* **Security & Isolation**: Contains `allowedIPs`, `whitelistedDomains` for network access lists, AWS KMS Key ARNs for tenant-specific encryption (BYOK), SIEM webhook URLs, database isolation URLs (`databaseUrl`), and legal hold and emergency lockdown locks (`isLocked`, `isFrozen`, `isLegalHoldActive`).

#### 2. `User`, `Role`, `Permission`, & `UserRoleMapping`
* Supports both static/legacy roles (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `MEMBER`) and dynamic custom roles.
* **Role-Based Access Control (RBAC) & Attribute-Based Access Control (ABAC)**: Custom roles are bound to specific `Permission` rules containing matching `action` (e.g., `read`, `create`) and `resource` (e.g., `Project`, `User`, `all`) strings mapped at the organization level.

#### 3. `Project`
The main tenant-owned entity. Includes properties representing advanced integration features:
* **Semantic Embeddings**: `embedding` vector (1536-dimension) for RAG/AI queries.
* **B2B Cross-Tenant Sharing**: `sharedWithOrgId` and `isShared` fields allow project records to be exposed to external organizations securely.
* **Predictive AI Metrics**: `riskScore` and emotional analysis scores (`teamEnergyScore`).

#### 4. Supporting Infrastructure Tables
* **`AuditLog`**: Stores action logs along with actor identifiers and detailed changes.
* **`ApiKey`**: Standard hashed API keys allowing secure developer programmatic access.
* **`WebhookEndpoint` & `WebhookDelivery`**: Powers event-driven outbound notifications with HMAC signature validation.
* **`Invite`**: Handles token-based invitation flows within the tenant context.
* **`RefreshToken`**: Manages session rotation.

---

## ⚙️ Module-by-Module Breakdown

The application structure resides inside `src/modules/` and `src/infrastructure/`:

### 1. Security & Identity
* **`auth`**: Handles local email/password sign-in, JWT token generation, 2FA setup with OTP code verification, Google OAuth 2.0, and SAML-based Enterprise Single Sign-On (SSO).
* **`ability`**: Incorporates CASL policies. Resolves user permissions recursively through user role mappings. Applies hard compliance restrictions (e.g., denying deletion operations when `isLegalHoldActive` is enabled on the organization).
* **`encryption`**: AWS KMS Integration for BYOK. Allows data columns to be dynamically encrypted/decrypted using tenant-specific AWS KMS Key ARNs.
* **`api-keys`**: Enables clients to provision and verify developer API tokens, checking status and caching hits.
* **`scim`**: Implements SCIM 2.0 endpoints (`/scim/v2/Users`) supporting standard enterprise user provisioning, directory updates, and user deprovisioning.

### 2. Multi-Tenant Administration & Operations
* **`organizations`**: Manages organization lifecycles, configuration metadata updates, IP/domain whitelist rule engines, and parent-child organizational hierarchy linkages.
* **`custom-domains`**: Coordinates domain validation check triggers (DNS CNAME checks) to support white-labeled endpoints.
* **`vendor-admin`**: Super-admin diagnostic suite for cross-tenant overview stats, health monitoring, and tier distribution counts.
* **`maintenance`**: Automated routines:
  * **`DrDrillService`**: Simulates and logs Disaster Recovery drills.
  * **`SecurityAuditorService`**: Periodically flags non-compliant settings (e.g., disabled 2FA for administrators).
  * **`CleanupService`**: Handles permanent deletion of soft-deleted assets.
* **`trash`**: Implements the soft-delete pattern across the system, allowing items to be sent to a trash queue and restored within a set period.

### 3. Core Capabilities & Integration
* **`projects`**: Handles core project management, including AI team energy updates and cross-tenant resource sharing check hooks.
* **`billing`**: Integrates with Stripe. Provisions customers, creates Checkout Sessions for upgrades, initiates billing portals, and processes incoming webhook events (`checkout.session.completed`, subscription updates) to keep tier models updated.
* **`webhooks`**: A pub/sub structure registering external webhook endpoints. When an event fires, it schedules asynchronous delivery jobs via BullMQ, compiling event payloads signed with HMAC-SHA256 headers.
* **`activity-stream`**: Collects events occurring within organizations to render audit logs and active dashboards.
* **`ai`**: Connects to Google Generative AI (Gemini). Generates vectors/embeddings, executes risk analyses, and evaluates project metadata.
* **`data-export`**: Generates archives (PDF summaries, Excel spreadsheets) of project histories and exports them directly into S3 for download.
* **`notifications`**: Dispatches system alerts and emails.

---

## 🛡️ Request Lifecycle & Security Middleware Pipeline

Requests entering the NestJS backend traverse multiple guards and pipes in the following execution order:

1. **`RequestIdMiddleware`**: Attaches a unique UUID to each incoming request (`X-Request-Id`) for distributed log tracing.
2. **`ClsModule` (AsyncLocalStorage)**: Captures the active request context (tenant ID, request ID, active user) globally, making it accessible throughout any layer of the code without needing to pass the Request object downstream.
3. **`TenantThrottlerGuard`**: Evaluates custom rate limiting rules based on the tenant's active tier.
4. **`IpAccessGuard`**: Matches the client's source IP address against the whitelist configuration (`allowedIPs` / `whitelistedDomains`) defined on the resolved `Organization`.
5. **`LockdownGuard`**: Rejects all API requests with `403 Forbidden` if the organization is marked as `isLocked` (e.g., during emergency incident response).
6. **`AuthGuard`**: Authenticates requests using either `JwtAuthGuard` (session/token) or `ApiKeyGuard` (programmatic developer API keys).
7. **`FeatureGuard`**: Blocks access to endpoints requiring features that are disabled or not yet unlocked on the tenant's current plan.
8. **`QuotaGuard`**: Monitors monthly usage numbers. Blocks requests if the tenant has exceeded their tier limits (e.g., maximum allowed API calls), and increments the metric on success.
9. **`AuditLogInterceptor`**: Intercepts successful mutations and pushes corresponding event records to the `AuditLog` database table.

---

## 🛠️ Getting Started & Local Development

### Prerequisites
* Node.js (v18+)
* PostgreSQL (with vector support for embeddings)
* Redis (for BullMQ background queues)

### Environment Setup
Create a `.env` file in the root backend directory:
```ini
# Application Configurations
PORT=4000
DATABASE_URL="postgresql://postgres:password@localhost:5432/multi_tenant?schema=public"
REDIS_HOST="localhost"
REDIS_PORT=6379

# Encryption Keys & Security
JWT_SECRET="your-jwt-signing-secret"
JWT_EXPIRATION="8h"
AWS_REGION="us-east-1"

# Third-party Integrations
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
GEMINI_API_KEY="AIzaSy..."
FRONTEND_URL="http://localhost:3000"
```

### Installation
Install the project dependencies using `pnpm`:
```bash
pnpm install
```

### Database Migrations & Seeds
Synchronize the Prisma models with your local database instance:
```bash
# Run migrations
npx prisma migrate dev

# Seed database permissions & starter roles
npx ts-node prisma/seed-permissions.ts
```

### Running the Application

```bash
# Development (with reload)
pnpm run start:dev

# Watch debug mode
pnpm run start:debug

# Production build and run
pnpm run build
pnpm run start:prod
```

### Running Tests

```bash
# Unit tests
pnpm run test

# End-to-end (e2e) tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```
