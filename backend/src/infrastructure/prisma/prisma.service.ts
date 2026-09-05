import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { prismaTenancyExtension } from './prisma-tenancy.extension';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly cls: ClsService) {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to the database');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error('Failed to connect to the database', errorMessage);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  get extended() {
    return this.$extends(prismaTenancyExtension(this.cls));
  }
}
