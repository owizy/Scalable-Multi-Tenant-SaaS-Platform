'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('Redirecting to login...');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
          Redirecting to login...
       </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-in fade-in duration-500">
        {children}
      </div>
    </DashboardLayout>
  );
}
