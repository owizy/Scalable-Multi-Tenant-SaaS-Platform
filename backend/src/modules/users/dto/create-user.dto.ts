import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'newuser@example.com' })
  @IsEmail()
  email: string = '';

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string = '';

  @ApiProperty({ example: 'First' })
  @IsString()
  @IsNotEmpty()
  firstName: string = '';

  @ApiProperty({ example: 'Last' })
  @IsString()
  @IsNotEmpty()
  lastName: string = '';

  @ApiProperty({ enum: UserRole, example: UserRole.MEMBER })
  @IsEnum(UserRole)
  role: UserRole = UserRole.MEMBER;
}
