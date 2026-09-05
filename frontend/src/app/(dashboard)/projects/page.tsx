'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, FolderKanban, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Can } from '@/components/Can';
import apiClient from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProjects = async () => {
    try {
      const { data } = await apiClient.get('/projects');
      setProjects(data);
    } catch (_error) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await apiClient.delete(`/projects/${id}`);
      toast.success('Project deleted');
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Page Title & Action Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" />
            Projects
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your organization's projects and isolated workspace resources.
          </p>
        </div>
        <Can I="CREATE" a="Project">
          <Button className="rounded-xl font-semibold gap-2 shadow-lg shadow-primary/10 transition-all hover:scale-[1.01]">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Can>
      </header>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects by name..."
            className="w-full h-10 rounded-xl border border-input/80 bg-background/60 pl-10 pr-4 text-xs font-medium text-foreground transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" className="rounded-xl text-xs gap-1.5 font-medium border-border/80">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <Card className="glass-card rounded-2xl overflow-hidden border-border/80 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/40">
              <TableRow className="hover:bg-transparent border-b border-border/60">
                <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3.5">Project</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner ID</TableHead>
                <TableHead className="text-right pr-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="border-b border-border/40">
                    <TableCell className="pl-6 py-4"><Skeleton className="h-5 w-40 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28 rounded-md" /></TableCell>
                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-16 rounded-lg ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                      <div className="p-3 rounded-2xl bg-secondary/50 mb-1">
                        <Sparkles className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">No projects found</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Try adjusting your search criteria or create a new project to get started.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-medium pl-6 py-4">
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-sm font-bold text-foreground">{project.name}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{project.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className="px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider"
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground">{formatDate(project.createdAt)}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{project.ownerId}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Can I="UPDATE" a="Project" data={project}>
                          <Button variant="ghost" size="icon-sm" className="rounded-lg text-muted-foreground hover:text-foreground">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Can>
                        <Can I="DELETE" a="Project" data={project}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:bg-destructive/10 rounded-lg"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Can>
                      </div>
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

