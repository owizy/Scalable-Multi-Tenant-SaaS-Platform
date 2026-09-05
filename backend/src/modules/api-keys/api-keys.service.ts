import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { randomUUID as uuidv4 } from 'node:crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, userId: string, dto: CreateApiKeyDto) {
    const rawKey = `sk_live_${uuidv4().replaceAll('-', '')}`;
    const keyHash = await bcrypt.hash(rawKey, 10);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        name: dto.name,
        description: dto.description,
        keyHash,
        organizationId,
        userId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    // Return the raw key ONLY once
    return {
      ...apiKey,
      key: rawKey,
    };
  }

  async findAll(organizationId: string) {
    return this.prisma.apiKey.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        lastUsed: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id, organizationId },
    });

    if (!apiKey) {
      throw new NotFoundException('API Key not found');
    }

    return apiKey;
  }

  async revoke(id: string, organizationId: string) {
    const apiKey = await this.findOne(id, organizationId);

    return this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { isActive: false },
    });
  }

  async delete(id: string, organizationId: string) {
    const apiKey = await this.findOne(id, organizationId);

    return this.prisma.apiKey.delete({
      where: { id: apiKey.id },
    });
  }

  async validateKey(rawKey: string) {
    // Note: This is an expensive operation if we have many keys.
    // In a production app, you might use a prefix + hint strategy to find the key faster.
    // For now, let's keep it simple.

    // We could extract a hint from the key if we stored it (e.g., first 8 chars)
    // But for this demo, let's just find active keys.
    const activeKeys = await this.prisma.apiKey.findMany({
      where: { isActive: true },
    });

    for (const apiKey of activeKeys) {
      const isMatch = await bcrypt.compare(rawKey, apiKey.keyHash);
      if (isMatch) {
        // Update lastUsed asynchronously
        await this.prisma.apiKey.update({
          where: { id: apiKey.id },
          data: { lastUsed: new Date() },
        });

        return apiKey;
      }
    }

    return null;
  }
}
