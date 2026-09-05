import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService, UserWithoutPassword } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({ status: 200, description: 'Return JWT access token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() body: LoginDto): Promise<any> {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user as User);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register Organization & Admin User' })
  @ApiResponse({
    status: 201,
    description: 'Return created user (without password)',
  })
  async register(@Body() body: RegisterDto): Promise<UserWithoutPassword> {
    return this.authService.register(body);
  }

  @Post('register-invite')
  @ApiOperation({ summary: 'Register User via Invite' })
  @ApiResponse({ status: 201, description: 'Return created user' })
  async registerWithInvite(
    @Body()
    body: {
      token: string;
      password: string;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<UserWithoutPassword> {
    const { token, ...data } = body;
    return this.authService.registerWithInvite(token, data);
  }
}
