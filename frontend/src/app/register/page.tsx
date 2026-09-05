'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Lock, Mail, Sparkles } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  organizationName: z.string().min(2, 'Organization name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/register/organization', {
        email: data.email,
        password: data.password,
        organizationName: data.organizationName
      });
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md space-y-8 bg-card/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-border/80"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-primary/10 text-primary mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Create your workspace
          </h2>
          <p className="text-sm text-muted-foreground">
            Start your journey with MultiTenant SaaS
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Organization Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                {...register('organizationName')}
                className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 py-2 text-sm font-medium text-foreground transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                placeholder="Acme Corp"
              />
            </div>
            {errors.organizationName && <p className="mt-1 text-xs text-destructive font-medium">{errors.organizationName.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                {...register('email')}
                type="email"
                className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 py-2 text-sm font-medium text-foreground transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                placeholder="admin@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-destructive font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                {...register('password')}
                type="password"
                className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 py-2 text-sm font-medium text-foreground transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-destructive font-medium">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                {...register('confirmPassword')}
                type="password"
                className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 py-2 text-sm font-medium text-foreground transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full py-2.5 h-11 text-sm font-semibold rounded-xl gap-2 shadow-lg shadow-primary/10 transition-all hover:scale-[1.01] mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Creating workspace...' : 'Get Started'}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

