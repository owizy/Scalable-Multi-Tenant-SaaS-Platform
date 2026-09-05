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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Mail, Shield, CheckCircle2, Clock, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

interface Invite {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

interface UserMember {
  id: string;
  email: string;
  role: string;
  name?: string;
  createdAt?: string;
}

export default function TeamSettingsPage() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [members, setMembers] = useState<UserMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MANAGER' | 'MEMBER'>('MEMBER');
  const [submitting, setSubmitting] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [invitesRes, meRes] = await Promise.allSettled([
        apiClient.get('/invites'),
        apiClient.get('/users/me'),
      ]);

      if (invitesRes.status === 'fulfilled') {
        setInvites(invitesRes.value.data || []);
      }

      // Add current user to members list if available
      const currentMembers: UserMember[] = [];
      if (meRes.status === 'fulfilled' && meRes.value.data) {
        currentMembers.push(meRes.value.data);
      } else if (user) {
        currentMembers.push({ id: user.id, email: user.email, role: user.role });
      }

      setMembers(currentMembers);
    } catch (err: any) {
      console.error('Failed to load team data:', err);
      setErrorMsg('Failed to load team data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setSubmitting(true);
    try {
      await apiClient.post('/invites', {
        email: inviteEmail,
        role: inviteRole,
      });

      setInviteEmail('');
      setIsInviteOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invites/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Team & Members
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your organization members, invite new teammates, and assign roles.
          </p>
        </div>

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-xl font-semibold shadow-lg shadow-primary/20 gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md rounded-2xl">
            <form onSubmit={handleSendInvite}>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Invite Teammate
                </DialogTitle>
                <DialogDescription>
                  Send an email invitation to add a new user to your organization.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(val: any) => setInviteRole(val)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="MEMBER">Member (Standard Access)</SelectItem>
                      <SelectItem value="MANAGER">Manager (Team Management)</SelectItem>
                      <SelectItem value="ADMIN">Admin (Full Access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="rounded-xl gap-2">
                  {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Send Invite
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs View */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="rounded-xl p-1 bg-muted/60">
          <TabsTrigger value="members" className="rounded-lg gap-2 text-xs font-semibold">
            <Users className="h-4 w-4" />
            Active Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invites" className="rounded-lg gap-2 text-xs font-semibold">
            <Clock className="h-4 w-4" />
            Pending Invites ({invites.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Members Tab */}
        <TabsContent value="members" className="mt-6">
          <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-card/40 border-b border-border/40">
              <CardTitle className="text-lg font-bold">Organization Members</CardTitle>
              <CardDescription>People with active access to this workspace</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/40">
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No team members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id} className="hover:bg-accent/40 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20">
                              {member.email[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{member.email.split('@')[0]}</div>
                              <div className="text-xs text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-lg font-semibold uppercase text-[10px] tracking-wider px-2.5 py-1 border-primary/30 text-primary">
                            <Shield className="h-3 w-3 mr-1" />
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-lg font-medium text-xs gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Invites Tab */}
        <TabsContent value="invites" className="mt-6">
          <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-card/40 border-b border-border/40">
              <CardTitle className="text-lg font-bold">Pending Invitations</CardTitle>
              <CardDescription>Invites sent to teammates waiting to join</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/40">
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned Role</TableHead>
                    <TableHead>Invite Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                        <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="font-medium">No pending invitations</p>
                        <p className="text-xs mt-1">Click "Invite Member" above to invite teammates.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invites.map((invite) => (
                      <TableRow key={invite.id} className="hover:bg-accent/40 transition-colors">
                        <TableCell className="font-medium text-foreground">
                          {invite.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-lg font-semibold uppercase text-[10px] tracking-wider px-2.5 py-1">
                            {invite.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyInviteLink(invite.token)}
                            className="rounded-lg text-xs gap-1.5 hover:bg-primary/10 hover:text-primary"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedToken === invite.token ? 'Copied!' : 'Copy Link'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
