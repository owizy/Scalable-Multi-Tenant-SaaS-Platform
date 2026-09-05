import { AbilityBuilder, AbilityClass, PureAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import {
  User,
  Project,
  UserRole,
  Organization,
  Permission,
} from '@prisma/client';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects =
  User | Project | Organization | 'User' | 'Project' | 'Organization' | 'all';
export type AppAbility = PureAbility<[Action, Subjects]>;

type UserWithPermissions = User & {
  userRoles?: {
    role: {
      permissions: Permission[];
    };
  }[];
  organization?: {
    isLegalHoldActive: boolean;
  };
};

@Injectable()
export class AbilityFactory {
  createForUser(user: UserWithPermissions): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );

    const orgId = user.organizationId;

    const hasDynamicRoles = user.userRoles && user.userRoles.length > 0;

    if (hasDynamicRoles) {
      user.userRoles?.forEach((mapping) => {
        mapping.role.permissions.forEach((permission) => {
          const action = permission.action as Action;
          const resource = permission.resource as Subjects;
          // @ts-expect-error CASL subject type limitations
          can(action, resource, { organizationId: orgId });
        });
      });
    } else {
      // Legacy Fallback
      if (user.role === UserRole.ADMIN) {
        can(Action.Manage, 'all', { organizationId: orgId });
      } else if (user.role === UserRole.MANAGER) {
        can(Action.Manage, 'Project', { organizationId: orgId });
        can(Action.Read, 'User', { organizationId: orgId });
        can(Action.Create, 'User', { organizationId: orgId });
        can(Action.Update, 'User', { organizationId: orgId });
      } else {
        can(Action.Read, 'Project', { organizationId: orgId });
        can(Action.Read, 'User', { organizationId: orgId });
      }

      // B2B Bridge: Allow access to projects shared with user's org
      can(Action.Read, 'Project', {
        sharedWithOrgId: orgId,
        isShared: true,
      });
      can(Action.Update, 'Project', {
        sharedWithOrgId: orgId,
        isShared: true,
      });
    }

    // Phase 13: Absolute Litigation Readiness (Legal Hold)
    // If the organization is under 'Legal Hold', any attempt to DELETE is blocked platform-wide.
    if (user.organization?.isLegalHoldActive) {
      cannot(Action.Delete, 'all');
    }

    return build({
      // @ts-expect-error CASL subject type limitations
      detectSubjectType: (item: { __type?: string } | string): Subjects => {
        if (typeof item === 'string') return item as Subjects;
        const constructor = item.constructor as { name?: string } | undefined;
        return (constructor?.name || 'all') as Subjects;
      },
    });
  }
}
