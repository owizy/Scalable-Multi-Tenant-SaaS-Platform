# ⚛️ Frontend Integration Guide: The Elite SaaS Interface

This guide is for the Frontend team to bridge our Shadcn/React architecture to the **0.0000001% Elite** backend features.

## 🔐 1. Authentication & Tenant Context
**Objective**: ensure every request is physically scoped to the organization.

*   **Tenant Mapping**: the backend uses `x-tenant-id` header or subdomain routing.
*   **Context Hook**:
    ```tsx
    // useTenant.ts
    export const useTenant = () => {
      const { user } = useAuth();
      return {
        orgId: user?.organizationId,
        region: user?.organization?.region, // US, EU, ASIA
        isLocked: user?.organization?.isLocked,
      };
    };
    ```

## 🚨 2. Implementing the "Panic Button" (Emergency Lockdown)
**Objective**: allow Admins to physically kill all platform access.

*   **Component**: `components/organization/LockdownButton.tsx`
*   **Logic**:
    ```tsx
    const handleLockdown = async () => {
      const confirmed = await confirm("TRIGGER EMERGENCY LOCKDOWN?");
      if (confirmed) {
        await api.patch(`/organizations/${orgId}/lockdown`, { 
          reason: "Suspected credential leak" 
        });
        toast.error("ORGANIZATION HAS BEEN LOCKED.");
      }
    };
    ```

## 🧠 3. AI Copilot: Interactive "Ask About Data"
**Objective**: a persistent AI bar that performs workspace actions.

*   **Endpoint**: `POST /ai/ask`
*   **Payload**: `{ query: "Create a new project named 'Final Dominance' and invite Mohamed." }`
*   **UX**:
    -   Show "Copilot is thinking..." indicator.
    -   The backend will perform the `createProject` and `inviteUser` actions automatically via Tool-Use.
    -   Refresh your query state after the AI confirms "Action Complete."

## 📊 4. AI-Powered "Team Energy" Dashboard
**Objective**: visualize high-EQ burnout risks.

*   **Endpoint**: `GET /analytics/team-energy`
*   **Chart**: use `ResponsiveContainer` from **Recharts**.
*   **Columns**:
    -   `BurnoutScore (0-100)`: Map to a color gradient (Green -> Red).
    -   `VibrationIndex`: Show as a pulse metric.
*   **Alert**: if `score > 80`, display: "⚠️ Alert: Team exhaustion detected. Suggest a mandatory cooling window."

## 🧼 5. Compliance: "PII Scrub" Export Button
**Objective**: provide anonymized RELATIONAL data for auditing.

*   **Logic**:
    ```tsx
    const downloadAuditDump = async () => {
      const response = await api.get(`/data-export/pii-scrub`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_scrubbed_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
    };
    ```

## 📱 6. Multi-Channel Identity (WhatsApp)
**Objective**: cross-platform session management.

*   **Setting**: `Settings > Account > Security`
*   **Input**: `phoneNumber` field.
*   **Verification**: The backend uses this phone number to authorize incoming WhatsApp/Messenger AI queries.
*   **Frontend UI**: "Verified Phone Number for Mobile AI Bridge."

## 🏗️ 7. Developer API Sandboxes
**Objective**: isolated testing environments for your clients.

*   **Component**: `OrganizationSettings > Developers`
*   **Logic**: `POST /organizations/sandbox`.
*   **UX**: Display a "Create Isolated Sandbox" button. Once created, show a toggle: `[Switch to Sandbox Mode]`.

---

## 🚀 Final Polish
1.  **Skeleton States**: use `Skeleton` loaders for AI-heavy analytics.
2.  **Optimistic UI**: Use `React Query` mutations for Project creation.
3.  **Toasts**: always confirm "Sovereign Audit Log Updated" for compliance-sensitive actions.

**Your UI is now as elite as your infrastructure. Dominance is here.**
