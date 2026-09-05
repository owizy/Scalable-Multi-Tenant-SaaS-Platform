'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, ShieldAlert, Globe, ShieldCheck, Clock, Save, AlertTriangle, CheckCircle2, RefreshCw, KeyRound, Server } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

export default function OrganizationSettingsPage() {
  const { user } = useAuth();
  const orgId = user?.organizationId || 'default-org';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Organization settings state
  const [orgName, setOrgName] = useState('Acme Corporation');
  const [isLocked, setIsLocked] = useState(false);
  const [allowedIps, setAllowedIps] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [acmeToken, setAcmeToken] = useState('acme-token-xyz-123');

  const fetchOrgSettings = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/organizations/${orgId}`);
      if (data) {
        setOrgName(data.name || 'Acme Corporation');
        if (data.settings) {
          setIsLocked(!!data.settings.isLocked);
          if (Array.isArray(data.settings.allowedIps)) {
            setAllowedIps(data.settings.allowedIps.join(', '));
          }
          if (data.settings.customDomain) {
            setCustomDomain(data.settings.customDomain);
          }
        }
      }
    } catch (err) {
      console.log('Using default organization state');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgSettings();
  }, [orgId]);

  const handleToggleLockdown = async (checked: boolean) => {
    setIsLocked(checked);
    try {
      await apiClient.patch(`/organizations/${orgId}/lockdown`, {
        isLocked: checked,
      });
      setSuccessMsg(`Emergency Lockdown ${checked ? 'ACTIVATED' : 'deactivated'} successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update lockdown mode');
      setIsLocked(!checked);
    }
  };

  const handleSaveIpGuard = async () => {
    setSaving(true);
    try {
      const ips = allowedIps
        .split(',')
        .map((ip) => ip.trim())
        .filter(Boolean);

      await apiClient.patch(`/organizations/${orgId}/ip-guard`, {
        allowedIps: ips,
      });
      setSuccessMsg('IP Guard rules updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save IP Guard rules');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-border/50 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          Organization & Security Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure tenant settings, security controls, emergency lockdown, and custom domain SSL bindings.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-500/20 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="rounded-xl p-1 bg-muted/60">
          <TabsTrigger value="general" className="rounded-lg gap-2 text-xs font-semibold">
            <Building2 className="h-4 w-4" />
            General Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg gap-2 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Security & IP Guard
          </TabsTrigger>
          <TabsTrigger value="domains" className="rounded-lg gap-2 text-xs font-semibold">
            <Globe className="h-4 w-4" />
            Custom Domain SSL
          </TabsTrigger>
        </TabsList>

        {/* General Profile Tab */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card className="rounded-2xl border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Workspace Profile</CardTitle>
              <CardDescription>General settings for your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="rounded-xl max-w-md"
                />
              </div>

              <div className="space-y-2">
                <Label>Organization ID</Label>
                <Input
                  value={orgId}
                  disabled
                  className="rounded-xl max-w-md bg-muted/50 font-mono text-xs text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security & IP Guard Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          {/* Emergency Panic Button */}
          <Card className="rounded-2xl border border-destructive/40 bg-destructive/5 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    Emergency Tenant Lockdown ("Panic Button")
                  </CardTitle>
                  <CardDescription className="text-destructive/80 mt-1">
                    Instantly freeze all API access and active sessions for this organization.
                  </CardDescription>
                </div>
                <Switch
                  checked={isLocked}
                  onCheckedChange={handleToggleLockdown}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLocked && (
                <div className="flex items-center gap-2 text-xs font-bold text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  WORKSPACE IS CURRENTLY LOCKED DOWN. ALL ACCESS IS RESTRICTED.
                </div>
              )}
            </CardContent>
          </Card>

          {/* IP Guard Rules */}
          <Card className="rounded-2xl border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                IP-Based Access Control (IP Guard)
              </CardTitle>
              <CardDescription>
                Restrict access to your workspace by specifying allowed IP addresses or CIDR blocks (comma-separated).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allowedIps">Allowed IP Addresses</Label>
                <Input
                  id="allowedIps"
                  placeholder="e.g. 192.168.1.1, 10.0.0.0/24"
                  value={allowedIps}
                  onChange={(e) => setAllowedIps(e.target.value)}
                  className="rounded-xl max-w-lg font-mono text-xs"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveIpGuard} disabled={saving} className="rounded-xl font-bold gap-2">
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save IP Guard Rules
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Custom Domain SSL Tab */}
        <TabsContent value="domains" className="mt-6 space-y-6">
          <Card className="rounded-2xl border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Custom Domain & ACME SSL Setup
              </CardTitle>
              <CardDescription>
                Connect your custom domain (e.g. app.yourdomain.com) with automatic Let's Encrypt SSL.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <Input
                  id="customDomain"
                  placeholder="app.yourdomain.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="rounded-xl max-w-md font-medium"
                />
              </div>

              <div className="rounded-xl p-4 bg-card/60 border border-border/60 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Server className="h-4 w-4 text-primary" />
                  DNS CNAME Verification Instructions
                </div>
                <p className="text-xs text-muted-foreground">
                  Add the following CNAME record in your DNS provider (Cloudflare, Route53, GoDaddy):
                </p>
                <div className="p-3 rounded-lg bg-muted/60 font-mono text-xs space-y-1">
                  <div><span className="text-muted-foreground">Type:</span> CNAME</div>
                  <div><span className="text-muted-foreground">Host:</span> {customDomain || 'app.yourdomain.com'}</div>
                  <div><span className="text-muted-foreground">Target:</span> cname.multitenant.app</div>
                </div>
              </div>

              <div className="rounded-xl p-4 bg-card/60 border border-border/60 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <KeyRound className="h-4 w-4 text-primary" />
                  ACME HTTP-01 Challenge Endpoint
                </div>
                <p className="text-xs text-muted-foreground">
                  Automatic ACME SSL solver endpoint handled by backend:
                </p>
                <div className="p-3 rounded-lg bg-muted/60 font-mono text-xs">
                  GET /.well-known/acme-challenge/{acmeToken}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
