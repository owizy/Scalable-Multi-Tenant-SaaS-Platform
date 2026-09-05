'use client';

import React from 'react';
import { LayoutDashboard, Users, FolderKanban, TrendingUp, Bell, Calendar, ArrowUpRight, Plus, Sparkles, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { motion } from 'framer-motion';

const stats = [
  { name: 'Active Projects', value: '12', icon: FolderKanban, trend: '+2.5%', trendType: 'up', description: '2 added this week' },
  { name: 'Total Team Members', value: '24', icon: Users, trend: '+10%', trendType: 'up', description: 'across 4 roles' },
  { name: 'System Uptime', value: '99.9%', icon: TrendingUp, trend: 'Stable', trendType: 'neutral', description: 'operational' },
  { name: 'Pending Approvals', value: '5', icon: Bell, trend: '-12%', trendType: 'down', description: 'requires action' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] ?? 'User';

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {userName}
            </h2>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 font-medium">
              Pro Plan
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Here's an overview of your organization's activity and status today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl text-xs gap-1.5 font-medium">
            <Activity className="h-3.5 w-3.5" /> View Logs
          </Button>
          <Button className="rounded-xl text-xs gap-1.5 font-semibold shadow-md shadow-primary/10">
            <Plus className="h-3.5 w-3.5" /> Quick Action
          </Button>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.25 }}
          >
            <Card className="glass-card rounded-2xl relative overflow-hidden group border-border/80">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.name}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold tracking-tight text-foreground">{item.value}</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary/80 text-foreground transition-transform group-hover:scale-110">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40 text-xs">
                  <span className="text-muted-foreground">{item.description}</span>
                  <Badge 
                    variant={item.trendType === 'up' ? 'default' : item.trendType === 'down' ? 'destructive' : 'secondary'} 
                    className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md"
                  >
                    {item.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Grid Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Interactive Metrics Chart Placeholder */}
        <Card className="lg:col-span-2 glass-card rounded-2xl border-dashed border-2 flex flex-col min-h-[350px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>System Activity & Metrics</span>
              <span className="text-xs font-normal text-muted-foreground">Updated live</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="p-4 rounded-2xl bg-secondary/50 mb-3">
              <LayoutDashboard className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Project Metrics Visualization</h3>
            <p className="text-xs max-w-sm mt-1 text-muted-foreground">
              Analytics graphs and performance metrics will be rendered here dynamically.
            </p>
          </CardContent>
        </Card>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <Card className="glass-card rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Calendar className="h-4 w-4 text-primary" />
                Upcoming Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3.5 items-center p-2.5 rounded-xl hover:bg-secondary/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex flex-col items-center justify-center text-[10px] font-extrabold border border-border/60 shrink-0">
                    <span className="text-destructive uppercase">MAR</span>
                    <span className="text-foreground text-xs">{27 + i}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">Sprint Planning Q1 - {i}</p>
                    <p className="text-[11px] text-muted-foreground">10:00 AM - 11:30 AM</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Banner Promo Card */}
          <Card className="rounded-2xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground relative overflow-hidden shadow-xl border-none">
            <CardContent className="p-6 relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" /> Enterprise Features
              </div>
              <h3 className="font-extrabold text-lg tracking-tight">Upgrade Workspace</h3>
              <p className="text-primary-foreground/80 text-xs leading-relaxed">
                Unlock advanced team role management, audit logging, and custom domains.
              </p>
              <Button className="w-full bg-white text-black hover:bg-white/90 rounded-xl text-xs font-bold gap-1 mt-2">
                Upgrade Now <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

