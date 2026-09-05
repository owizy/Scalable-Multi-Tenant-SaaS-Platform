'use client';

import React, { useState } from 'react';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, KeyRound, QrCode, CheckCircle2, RefreshCw, Copy, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleGenerate2FA = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data } = await apiClient.post('/auth/2fa/generate');
      setQrCodeUrl(data.qrCodeUrl || data.otpauthUrl || null);
      setSecret(data.secret || null);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to generate 2FA secret.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode) return;

    setVerifying(true);
    setErrorMsg(null);
    try {
      await apiClient.post('/auth/2fa/enable', { code: verifyCode });
      setIs2FAEnabled(true);
      setQrCodeUrl(null);
      setSecret(null);
      setSuccessMsg('Two-Factor Authentication has been successfully enabled for your account!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-border/50 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          Security & Two-Factor Authentication
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Protect your account with an additional layer of security using TOTP (Google Authenticator, Authy, 1Password).
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-500/20">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2FA Status Card */}
      <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-card/40 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${is2FAEnabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                {is2FAEnabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Two-Factor Authentication (2FA)</CardTitle>
                <CardDescription>
                  {is2FAEnabled ? 'Your account is secured with 2FA.' : '2FA is currently not enabled for your account.'}
                </CardDescription>
              </div>
            </div>

            <Badge variant="outline" className={`rounded-lg px-3 py-1 font-semibold text-xs gap-1.5 uppercase ${is2FAEnabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'}`}>
              {is2FAEnabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {is2FAEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {!is2FAEnabled && !secret && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enabling Two-Factor Authentication requires an authenticator app like Google Authenticator or Authy to generate single-use verification codes.
              </p>
              <Button onClick={handleGenerate2FA} disabled={loading} className="rounded-xl font-semibold gap-2 shadow-lg shadow-primary/20">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                Setup Two-Factor Authentication
              </Button>
            </div>
          )}

          {/* Setup / Verification step */}
          {secret && (
            <div className="space-y-6 border-t border-border/40 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-extrabold">1</span>
                    Scan QR Code or Copy Secret Key
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Scan this code with your authenticator app, or manually enter the key below into your app.
                  </p>

                  {qrCodeUrl ? (
                    <div className="p-4 bg-white rounded-2xl w-48 h-48 flex items-center justify-center border border-border shadow-inner mx-auto md:mx-0">
                      <img src={qrCodeUrl} alt="2FA QR Code" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/60 rounded-2xl w-48 h-48 flex flex-col items-center justify-center border border-border text-center mx-auto md:mx-0">
                      <QrCode className="h-10 w-10 text-muted-foreground/50 mb-2" />
                      <span className="text-xs text-muted-foreground font-mono">Use Secret Key</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 max-w-sm">
                    <div className="p-2.5 rounded-xl bg-muted/50 border border-border/50 font-mono text-xs text-foreground flex-1 truncate">
                      {secret}
                    </div>
                    <Button variant="outline" size="sm" onClick={copySecret} className="rounded-xl text-xs gap-1.5 shrink-0">
                      <Copy className="h-3.5 w-3.5" />
                      {copiedSecret ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-extrabold">2</span>
                    Enter 6-Digit Verification Code
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code generated by your authenticator app to complete setup.
                  </p>

                  <form onSubmit={handleEnable2FA} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Verification Code</Label>
                      <Input
                        id="code"
                        placeholder="123456"
                        maxLength={6}
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        className="rounded-xl font-mono text-center tracking-widest text-lg max-w-xs"
                      />
                    </div>
                    <Button type="submit" disabled={verifying || verifyCode.length < 6} className="rounded-xl font-semibold gap-2 shadow-lg shadow-primary/20">
                      {verifying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Verify & Activate 2FA
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
