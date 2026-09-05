'use client';

import React from 'react';
import { useAuth } from '@/providers/auth-provider';
import { can, Action, Resource } from '@/lib/permissions';

interface CanProps {
  I: Action;
  a: Resource;
  data?: any;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ I, a, data, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;

  if (can(user, I, a, data)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export const Ability = {
  can,
};
