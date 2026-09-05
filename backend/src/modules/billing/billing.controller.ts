import type { Request } from 'express';
import type { RawBodyRequest } from '@nestjs/common';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { BillingService } from './billing.service';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe Checkout Session' })
  async createCheckout(
    @Body('priceId') priceId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.billingService.createCheckoutSession(
      req.user.organizationId,
      priceId,
    );
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe Customer Portal Session' })
  async createPortal(@Req() req: RequestWithUser) {
    return this.billingService.createPortalSession(req.user.organizationId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe Webhook Handler' })
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.billingService.handleWebhook(sig, req.rawBody!);
  }
}
