'use client';

import React, { useState } from 'react';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check, Zap, Shield, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';

const PLANS = [
  {
    id: 'price_starter',
    name: 'Starter',
    price: '$0',
    description: 'Perfect for small teams & indie projects',
    features: ['Up to 5 Projects', 'Standard Multi-Tenancy', 'Community Support', 'Basic Audit Logs'],
    popular: false,
    buttonText: 'Current Plan',
    variant: 'outline' as const,
  },
  {
    id: 'price_pro',
    name: 'Pro Enterprise',
    price: '$49',
    description: 'For growing teams requiring scale & 2FA security',
    features: ['Unlimited Projects', '2FA & Advanced Security', 'Custom Domains & ACME SSL', 'Dedicated Support', 'API Keys & Webhooks'],
    popular: true,
    buttonText: 'Upgrade to Pro',
    variant: 'default' as const,
  },
  {
    id: 'price_enterprise',
    name: 'Enterprise Scale',
    price: '$199',
    description: 'Mission-critical compliance & SCIM provisioning',
    features: ['SCIM 2.0 User Sync', 'IP Guard Whitelisting', 'Emergency Lockdown Panic Button', 'Custom SLA & 24/7 Phone Support', 'GDPR PII Data Export'],
    popular: false,
    buttonText: 'Contact Sales',
    variant: 'outline' as const,
  },
];

export default function BillingPage() {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleCheckout = async (priceId: string) => {
    if (priceId === 'price_starter') return;

    setLoadingPriceId(priceId);
    try {
      const { data } = await apiClient.post('/billing/checkout', { priceId });
      if (data.url) {
        window.location.assign(data.url);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate Stripe Checkout session');
    } finally {
      setLoadingPriceId(null);
    }
  };

  const handleOpenPortal = async () => {
    setLoadingPortal(true);
    try {
      const { data } = await apiClient.post('/billing/portal');
      if (data.url) {
        window.location.assign(data.url);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to open Stripe Customer Portal');
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            Billing & Subscription Plans
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your subscription plan, billing portal, payment methods, and invoices.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleOpenPortal}
          disabled={loadingPortal}
          className="rounded-xl font-semibold gap-2 self-start sm:self-auto"
        >
          {loadingPortal ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
          Manage Stripe Billing Portal
        </Button>
      </div>

      {/* Current Plan Card */}
      <Card className="rounded-2xl border border-primary/30 bg-primary/5 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Active Subscription: Starter Plan
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Your workspace is operating under the default Starter tier.
              </CardDescription>
            </div>
            <Badge className="rounded-lg px-3 py-1 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider">
              Active Tier
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`rounded-2xl flex flex-col justify-between transition-all duration-200 hover:shadow-xl ${
              plan.popular ? 'border-2 border-primary shadow-lg relative bg-card/80 backdrop-blur-xl' : 'border border-border/60 shadow-sm'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-widest shadow-md">
                Most Popular
              </div>
            )}

            <CardHeader className="pt-6">
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                <span className="text-xs text-muted-foreground font-medium">/month</span>
              </div>
              <CardDescription className="text-xs min-h-[32px]">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 flex-1">
              <div className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Features Included</div>
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </CardContent>

            <CardFooter className="pt-4">
              <Button
                variant={plan.variant}
                disabled={loadingPriceId === plan.id || plan.id === 'price_starter'}
                onClick={() => handleCheckout(plan.id)}
                className="w-full rounded-xl font-bold py-5 gap-2 shadow-sm"
              >
                {loadingPriceId === plan.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
