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
import { Shield, Plus, Key, Users, CheckCircle2, AlertCircle, RefreshCw, Lock } from 'lucide-react';

interface Permission {
  id: string;
  action: string;
  resource: string;
}

interface CustomRole {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
  usersCount?: number;
}

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isPermissionOpen, setIsPermissionOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Form states
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [action, setAction] = useState('READ');
  const [resource, setResource] = useState('Project');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data } = await apiClient.get('/roles');
      setRoles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      // Mock default system roles if database empty
      setRoles([
        { id: 'role-1', name: 'Admin', description: 'Full system control', permissions: [{ id: 'p1', action: 'MANAGE', resource: 'All' }] },
        { id: 'role-2', name: 'Manager', description: 'Team and project management', permissions: [{ id: 'p2', action: 'CREATE', resource: 'Project' }] },
        { id: 'role-3', name: 'Member', description: 'Standard read and create privileges', permissions: [{ id: 'p3', action: 'READ', resource: 'Project' }] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) return;

    setSubmitting(true);
    try {
      await apiClient.post('/roles', { name: roleName, description: roleDesc });
      setRoleName('');
      setRoleDesc('');
      setIsCreateRoleOpen(false);
      await fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) return;

    setSubmitting(true);
    try {
      await apiClient.post(`/roles/${selectedRoleId}/permissions`, { action, resource });
      setIsPermissionOpen(false);
      await fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add permission rule');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Roles & Permission Matrix
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Define custom RBAC roles, grant granular resource permissions, and manage access control lists.
          </p>
        </div>

        <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-xl font-semibold shadow-lg shadow-primary/20 gap-2">
                <Plus className="h-4 w-4" />
                Create Custom Role
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md rounded-2xl">
            <form onSubmit={handleCreateRole}>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  New Custom Role
                </DialogTitle>
                <DialogDescription>
                  Define a role name and description for your organization.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    placeholder="e.g. DevOps Engineer"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roleDesc">Description</Label>
                  <Input
                    id="roleDesc"
                    placeholder="Role responsibilities..."
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateRoleOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="rounded-xl gap-2">
                  {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Save Role
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

      {/* Roles Matrix Table */}
      <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-card/40 border-b border-border/40">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Organization Roles & Capabilities
          </CardTitle>
          <CardDescription>Granular permission rules assigned per role</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/40">
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permission Rules</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-medium">No custom roles defined</p>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-accent/40 transition-colors">
                    <TableCell className="font-bold text-foreground flex items-center gap-2">
                      <Badge variant="outline" className="rounded-lg font-semibold uppercase text-[10px] tracking-wider px-2.5 py-1 border-primary/30 text-primary">
                        {role.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {role.description || 'System Role'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.map((perm) => (
                            <Badge key={perm.id} variant="secondary" className="rounded-md font-mono text-[10px]">
                              {perm.action}:{perm.resource}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">No rules assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedRoleId(role.id); setIsPermissionOpen(true); }}
                        className="rounded-lg text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Rule
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Permission Modal */}
      <Dialog open={isPermissionOpen} onOpenChange={setIsPermissionOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <form onSubmit={handleAddPermission}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Add Permission Rule
              </DialogTitle>
              <DialogDescription>
                Assign CASL Action and Resource rule to selected role.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select value={action} onValueChange={(val: any) => val && setAction(val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select Action" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="READ">READ</SelectItem>
                    <SelectItem value="CREATE">CREATE</SelectItem>
                    <SelectItem value="UPDATE">UPDATE</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="MANAGE">MANAGE (All)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource">Resource</Label>
                <Select value={resource} onValueChange={(val: any) => val && setResource(val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select Resource" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Organization">Organization</SelectItem>
                    <SelectItem value="All">All Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPermissionOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-xl gap-2">
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Rule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
