import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '@prisma/client';

@ApiTags('Auth 2FA')
@Controller('auth/2fa')
export class Auth2faController {
  constructor(private readonly authService: AuthService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  async generateTwoFactorSecret(@Req() req: { user: Pick<User, 'id'> }) {
    return this.authService.generateTwoFactorSecret(req.user as User);
  }

  @Post('enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable 2FA with a verification code' })
  async enableTwoFactor(
    @Req() req: { user: Pick<User, 'id'> },
    @Body('code') code: string,
  ) {
    return this.authService.enableTwoFactor(req.user.id, code);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify 2FA code during login' })
  verify(@Body('userId') userId: string, @Body('code') code: string) {
    return this.authService.verifyTwoFactorLogin(userId, code);
  }
}
