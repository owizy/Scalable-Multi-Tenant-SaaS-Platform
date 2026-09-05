import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import Stripe from 'stripe';
import { SubscriptionStatus } from '@prisma/client';

type OrganizationWithStripe = {
  id: string;
  name: string;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus;
  users?: { email: string }[];
};

@Injectable()
export class BillingService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY')!,
      {
        apiVersion: '2026-03-25.dahlia',
      },
    );
  }

  async createCheckoutSession(organizationId: string, priceId: string) {
    const orgRaw = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { users: { where: { role: 'ADMIN' }, take: 1 } },
    });

    if (!orgRaw) throw new Error('Organization not found');
    const org = orgRaw as OrganizationWithStripe;

    let customerId = org.stripeCustomerId;

    if (!customerId) {
      const adminEmail = org.users?.[0]?.email;
      const customer = await this.stripe.customers.create({
        email: adminEmail,
        name: org.name,
        metadata: { organizationId },
      });
      customerId = customer.id;
      await this.prisma.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${this.configService.get<string>('FRONTEND_URL')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/billing/cancel`,
      subscription_data: {
        metadata: { organizationId },
      },
    });

    return { url: session.url };
  }

  async createPortalSession(organizationId: string) {
    const orgRaw = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    const org = orgRaw as OrganizationWithStripe;

    if (!org?.stripeCustomerId) {
      throw new Error('Organization does not have a Stripe Customer ID');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${this.configService.get<string>('FRONTEND_URL')}/billing`,
    });

    return { url: session.url };
  }

  async handleWebhook(sig: string, rawBody: Buffer) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        sig,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET')!,
      );
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Webhook Error: ${error.message}`);
      throw new Error(`Webhook Error: ${error.message}`, { cause: err });
    }

    const session = event.data.object as Stripe.Checkout.Session & {
      subscription: string;
    };

    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subId = session.subscription || session.id;
        await this.syncSubscription(subId);
        break;
      }
      default:
        this.logger.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private async syncSubscription(subscriptionId: string) {
    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);
    const orgId = subscription.metadata['organizationId'];

    if (!orgId) return;

    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        subscriptionId: subscription.id,
        subscriptionStatus:
          subscription.status.toUpperCase() as SubscriptionStatus,
      },
    });
  }
}
