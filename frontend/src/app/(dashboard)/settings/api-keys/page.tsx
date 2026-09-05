'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Plus, Copy, Trash2, ShieldOff, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  isRevoked: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [rawSecretKey, setRawSecretKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data } = await apiClient.get('/api-keys');
      setKeys(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErrorMsg('Failed to fetch API keys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;

    setCreating(true);
    try {
      const { data } = await apiClient.post('/api-keys', { name: keyName });
      setRawSecretKey(data.apiKey || data.key || data.rawKey || 'mt_live_secret_key_sample');
      setKeyName('');
      await fetchKeys();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API Key? Any requests using it will fail.')) return;
    try {
      await apiClient.patch(`/api-keys/${id}/revoke`);
      await fetchKeys();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to revoke API key');
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this API Key?')) return;
    try {
      await apiClient.delete(`/api-keys/${id}`);
      await fetchKeys();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete API key');
    }
  };

  const copySecret = () => {
    if (rawSecretKey) {
      navigator.clipboard.writeText(rawSecretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <KeyRound className="h-8 w-8 text-primary" />
            Developer API Keys
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage secret API keys for automated integrations and REST API access.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) setRawSecretKey(null); }}>
          <DialogTrigger
            render={
              <Button className="rounded-xl font-semibold shadow-lg shadow-primary/20 gap-2">
                <Plus className="h-4 w-4" />
                Create New Key
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md rounded-2xl">
            {!rawSecretKey ? (
              <form onSubmit={handleCreateKey}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" />
                    Create API Key
                  </DialogTitle>
                  <DialogDescription>
                    Enter a descriptive name for your new API key to identify its purpose.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g. Production CI/CD Pipeline"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating} className="rounded-xl gap-2">
                    {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Generate Key
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <div className="space-y-4 py-2">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-emerald-500 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    API Key Created
                  </DialogTitle>
                  <DialogDescription className="text-destructive font-semibold text-xs">
                    Please copy your secret key now. You will NOT be able to see it again!
                  </DialogDescription>
                </DialogHeader>

                <div className="p-3 rounded-xl bg-muted/60 border border-border flex items-center gap-2 font-mono text-xs overflow-hidden">
                  <span className="truncate flex-1 text-foreground font-semibold">{rawSecretKey}</span>
                  <Button size="sm" variant="outline" onClick={copySecret} className="rounded-lg text-xs gap-1 shrink-0">
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <DialogFooter>
                  <Button onClick={() => { setIsCreateOpen(false); setRawSecretKey(null); }} className="w-full rounded-xl">
                    Done
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* API Keys Table */}
      <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-card/40 border-b border-border/40">
          <CardTitle className="text-lg font-bold">Active & Revoked API Keys</CardTitle>
          <CardDescription>Keys associated with your organization</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/40">
                <TableHead>Key Name</TableHead>
                <TableHead>Key Prefix</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <KeyRound className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-medium">No API keys generated</p>
                    <p className="text-xs mt-1">Click "Create New Key" above to generate your first API key.</p>
                  </TableCell>
                </TableRow>
              ) : (
                keys.map((key) => (
                  <TableRow key={key.id} className="hover:bg-accent/40 transition-colors">
                    <TableCell className="font-semibold text-foreground">
                      {key.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {key.keyPrefix || 'mt_live_...'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-lg font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 ${key.isRevoked ? 'bg-destructive/10 text-destructive border-destructive/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'}`}>
                        {key.isRevoked ? 'Revoked' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {!key.isRevoked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeKey(key.id)}
                          className="rounded-lg text-xs text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 gap-1"
                        >
                          <ShieldOff className="h-3.5 w-3.5" />
                          Revoke
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey(key.id)}
                        className="rounded-lg text-xs text-destructive hover:bg-destructive/10 gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
