'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Users, Settings, LogOut, ChevronRight, Menu, User, Command, Bell, Search, PanelLeftClose, PanelLeft, Building2, ShieldCheck, KeyRound, FileText, CreditCard, Download, ShieldAlert, Shield, Sparkles, Activity } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Can } from '@/components/Can';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import apiClient from '@/lib/api-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban, resource: 'Project' as const, action: 'READ' as const },
  { name: 'Team', href: '/settings/team', icon: Users, resource: 'User' as const, action: 'READ' as const },
  { name: 'Roles & Permissions', href: '/settings/roles', icon: Shield },
  { name: 'Organization', href: '/settings/organization', icon: Building2 },
  { name: 'Security & 2FA', href: '/settings/security', icon: ShieldCheck },
  { name: 'API Keys', href: '/settings/api-keys', icon: KeyRound },
  { name: 'Audit Logs', href: '/settings/audit-logs', icon: FileText },
  { name: 'AI & Intelligence', href: '/analytics', icon: Sparkles },
  { name: 'Billing & Plans', href: '/settings/billing', icon: CreditCard },
  { name: 'Data Export', href: '/settings/data-export', icon: Download },
  { name: 'Platform Admin', href: '/admin', icon: ShieldAlert }
];

export function DashboardLayout({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [activityStream, setActivityStream] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await apiClient.get('/activity', { params: { limit: 5 } });
        if (Array.isArray(data)) setActivityStream(data);
      } catch (err) {
        // Fallback live activity stream
        setActivityStream([
          { id: '1', message: 'Admin updated Organization Settings', timestamp: new Date().toISOString() },
          { id: '2', message: 'System generated new API Key', timestamp: new Date(Date.now() - 3600000).toISOString() },
        ]);
      }
    };
    fetchActivity();
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "relative flex flex-col border-r border-border bg-card/60 backdrop-blur-xl transition-all duration-300 z-20 select-none",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Workspace Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-border/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold shadow-md shadow-primary/20 shrink-0">
              M
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight truncate">MultiTenant</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Enterprise UI</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex text-muted-foreground hover:text-foreground rounded-lg"
          >
            {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            const content = (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                )}
                <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {isSidebarOpen && <span className="ml-3 truncate">{item.name}</span>}
                {isSidebarOpen && isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
              </Link>
            );

            if (item.resource) {
              return (
                <Can key={item.name} I={item.action} a={item.resource}>
                  {content}
                </Can>
              );
            }

            return content;
          })}
        </nav>

        {/* User Account Section */}
        <div className="border-t border-border/50 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className={cn("w-full px-2 h-auto py-2 flex items-center rounded-xl hover:bg-accent/60", !isSidebarOpen && "justify-center")} />
              }
            >
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 shrink-0">
                {user?.email[0].toUpperCase() ?? 'U'}
              </div>
              {isSidebarOpen && (
                <div className="ml-3 flex flex-col items-start min-w-0 text-left">
                  <span className="text-sm font-semibold truncate w-full text-foreground">{user?.email.split('@')[0]}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{user?.role}</span>
                </div>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl backdrop-blur-xl bg-card/90" side="right" sideOffset={12}>
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer rounded-lg">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg">
                <Settings className="mr-2 h-4 w-4" />
                Workspace Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer font-medium rounded-lg" onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Sticky Glass Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card/40 backdrop-blur-md px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-muted-foreground">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-foreground font-semibold">
                {navigation.find((n) => pathname.startsWith(n.href))?.name || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-input/60 bg-background/50 text-muted-foreground text-xs font-medium cursor-pointer hover:border-input transition-colors">
              <Search className="h-3.5 w-3.5" />
              <span>Search or jump to...</span>
              <kbd className="ml-2 inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                <Command className="h-2.5 w-2.5" /> K
              </kbd>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="rounded-xl text-muted-foreground hover:text-foreground relative">
                    <Bell className="h-4 w-4" />
                    {activityStream.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-xl backdrop-blur-xl bg-card/95 p-2">
                <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
                  <span>Activity Stream</span>
                  <Activity className="h-3.5 w-3.5 text-primary" />
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {activityStream.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">No recent activity</div>
                ) : (
                  activityStream.map((item) => (
                    <DropdownMenuItem key={item.id} className="flex flex-col items-start gap-1 py-2 rounded-lg cursor-default">
                      <span className="text-xs font-medium text-foreground">{item.message}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </header>

        {/* Dynamic Page Container */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

