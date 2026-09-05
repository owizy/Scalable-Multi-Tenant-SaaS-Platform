# Security Policy & Vulnerability Disclosure

Security is a fundamental priority for the **Enterprise Multi-Tenant SaaS Platform**. We take vulnerabilities, data isolation bugs, authentication flaws, and authorization bypasses very seriously.

---

## 🛡️ Supported Versions

We provide security updates and patches for the following versions of the project:

| Version | Supported |
| :--- | :--- |
| `0.x.x` (Latest / Main) | :white_check_mark: Supported |
| `< 0.1.0` | :x: Not Supported |

---

## 🔒 Reporting a Vulnerability

**DO NOT file a public GitHub issue for security vulnerabilities.**

If you discover a potential security flaw, tenant isolation bypass, privilege escalation, or credential leak:

1. **Email Us Privately**: Send an email describing the vulnerability to `security@multi-tenant-saas.com`.
2. **Details to Include**:
   - Type of vulnerability (e.g., Cross-Site Scripting, SQL Injection, RLS Bypass, SAML Assertion Forgery, IDOR).
   - Component affected (`backend`, `frontend`, database schema, cloud infrastructure).
   - Step-by-step proof-of-concept (PoC) or reproduction steps.
   - Potential impact on tenant data or organization boundaries.

---

## ⏱️ Response Policy

* **Acknowledgement**: We will acknowledge receipt of your vulnerability report within **24 hours**.
* **Triage & Assessment**: Our team will investigate and confirm the report within **3 business days**.
* **Remediation**: If validated, we aim to release a patch or mitigation within **7 to 14 business days** (depending on severity).
* **Public Disclosure**: We coordinate public disclosure with reporters after a security patch has been released and verified.

---

## 🧱 Built-in Security Controls

This repository incorporates defense-in-depth security architectures out of the box:

- **Strict Tenant Isolation**: Middleware-level Organization ID verification preventing cross-tenant access.
- **Dedicated Database Override**: Support for physical database isolation per tenant (`databaseUrl` override).
- **Authentication & Encryption**: Password hashing using `bcrypt`, JWT access and refresh token rotation, TOTP 2FA, and AWS KMS data-at-rest encryption.
- **Resource Hardening**: Rate-limiting throttler guards (`@nestjs/throttler`), secure HTTP response headers (`helmet`), and sanitized database queries via Prisma ORM parameterized queries.
- **SIEM & Audit Logging**: Immutable audit log records for high-risk tenant admin operations.

Thank you for helping us maintain a secure platform for all tenants! 🔐
