import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Box, Shield, Zap, LayoutDashboard, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar */}
      <header className="px-8 h-16 flex items-center justify-between border-b border-border/60 bg-card/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-lg tracking-tight">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-extrabold shadow-md shadow-primary/20">
            M
          </div>
          <span className="text-foreground">MultiTenant</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/register">
            <Button size="sm" className="rounded-xl font-semibold text-xs shadow-md shadow-primary/10">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="py-28 px-6 text-center space-y-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> 2026 Modern Enterprise SaaS Architecture
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl leading-[1.1] text-foreground">
              Scale your SaaS with <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground">Enterprise Infrastructure</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Multi-tenant isolation, role-based access control, production-ready Next.js starter kit. Build enterprise applications in days, not months.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-sm font-semibold rounded-xl gap-2 shadow-xl shadow-primary/10 transition-all hover:scale-[1.02]">
                Get Started Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-semibold rounded-xl gap-2 border-border/80">
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> View Demo Dashboard
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 border-y border-border/60 bg-card/30 backdrop-blur-sm">
           <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl glass-card space-y-4">
                 <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Shield className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-bold text-foreground">RBAC & ABAC Security</h3>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Fine-grained permission evaluation powered by CASL and dynamic context-aware authorization rules.
                 </p>
              </div>

              <div className="p-8 rounded-2xl glass-card space-y-4">
                 <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Box className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-bold text-foreground">Multi-Tenant Isolation</h3>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Strict organization-level data separation designed directly into NestJS service guards and Prisma context.
                 </p>
              </div>

              <div className="p-8 rounded-2xl glass-card space-y-4">
                 <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Zap className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-bold text-foreground">Next.js 16 + Tailwind v4</h3>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Built with standard web design principles, high-contrast dark tokens, and micro-animations.
                 </p>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-border/60 px-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} MultiTenant SaaS. All rights reserved.
      </footer>
    </div>
  );
}

