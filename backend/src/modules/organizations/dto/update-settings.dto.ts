import { IsOptional, IsString, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrganizationSettingsDto {
  @ApiPropertyOptional({ description: 'The custom primary color for the UI' })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'The URL for the organization logo' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'The default timezone for the organization',
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'The default locale or language for the organization',
  })
  @IsString()
  @IsOptional()
  locale?: string;

  @ApiPropertyOptional({ description: 'Generic catch-all for other settings' })
  @IsObject()
  @IsOptional()
  customSettings?: Record<string, any>;
}
