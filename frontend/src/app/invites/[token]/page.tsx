'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Mail, Shield, CheckCircle2, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import Cookies from 'js-cookie';

interface ValidatedInvite {
  email: string;
  role: string;
  organizationName?: string;
}

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<ValidatedInvite | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    const validateToken = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.get(`/invites/validate/${token}`);
        setInvite(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired invitation token.');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      // Register with the invited email & password
      const { data } = await apiClient.post('/auth/register', {
        email: invite?.email,
        password,
        inviteToken: token,
      });

      if (data.accessToken) {
        Cookies.set('access_token', data.accessToken);
        if (data.refreshToken) Cookies.set('refresh_token', data.refreshToken);
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-sm font-semibold text-muted-foreground">Validating invitation link...</p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md rounded-2xl shadow-xl border-destructive/30">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="text-xl font-bold text-destructive">Invitation Error</CardTitle>
            <CardDescription>{error || 'Invitation not found or expired.'}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push('/login')} className="rounded-xl font-semibold">
              Return to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-2xl shadow-2xl border-border/60">
        <CardHeader className="text-center pb-2">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 border border-primary/20">
            <UserCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">Accept Invitation</CardTitle>
          <CardDescription>
            You've been invited to join the team as an{' '}
            <Badge variant="outline" className="ml-1 uppercase text-[10px] font-bold text-primary border-primary/30">
              {invite.role}
            </Badge>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Invited Email</Label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 text-sm font-medium text-muted-foreground border border-border/50">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{invite.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="rounded-xl"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" disabled={submitting} className="w-full rounded-xl font-bold py-5 gap-2 shadow-lg shadow-primary/20">
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Complete Registration & Join Workspace
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
