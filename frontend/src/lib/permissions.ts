export type Role = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  organizationId: string;
  tenantId?: string;
}

export type Action = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE';
export type Resource = 'Project' | 'Task' | 'User' | 'Organization';

export interface Permission {
  action: Action;
  resource: Resource;
  conditions?: (user: User, data?: any) => boolean;
}

// Map roles to their base permissions (RBAC)
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    { action: 'MANAGE', resource: 'Project' },
    { action: 'MANAGE', resource: 'Organization' },
    { action: 'MANAGE', resource: 'User' },
  ],
  MANAGER: [
    { action: 'READ', resource: 'Project' },
    { action: 'CREATE', resource: 'Project' },
    { action: 'UPDATE', resource: 'Project' },
    { action: 'READ', resource: 'User' },
  ],
  USER: [
    { action: 'READ', resource: 'Project' },
    {
      action: 'UPDATE',
      resource: 'Project',
      conditions: (user, data) => data?.ownerId === user.id,
    },
    {
      action: 'DELETE',
      resource: 'Project',
      conditions: (user, data) => data?.ownerId === user.id,
    },
  ],
};

export const can = (user: User | null, action: Action, resource: Resource, data?: any): boolean => {
  if (!user) return false;

  const userPermissions = ROLE_PERMISSIONS[user.role] || [];

  return userPermissions.some((permission) => {
    // If user can 'MANAGE' the resource, they can do anything
    if (permission.resource === resource && (permission.action === 'MANAGE' || permission.action === action)) {
      if (permission.conditions) {
        return permission.conditions(user, data);
      }
      return true;
    }
    return false;
  });
};
