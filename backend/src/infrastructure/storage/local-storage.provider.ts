import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { StorageProvider } from './storage.provider';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly baseDir: string;

  constructor(private readonly configService: ConfigService) {
    this.baseDir = this.configService.get<string>('STORAGE_PATH', './storage');
  }

  private async ensureDirExists(dir: string) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch {
      // Ignored if it already exists
    }
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = 'general',
  ): Promise<string> {
    const key = `${folder}/${Date.now()}-${fileName}`;
    const filePath = path.join(this.baseDir, key);
    const dirPath = path.dirname(filePath);

    await this.ensureDirExists(dirPath);
    await fs.writeFile(filePath, file);

    return key;
  }

  getSignedUrl(key: string): Promise<string> {
    // For local dev, return the static path (assuming it's served by NestJS statically)
    return Promise.resolve(`http://localhost:4000/api/static/${key}`);
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignored if file not found
    }
  }

  getFileUrl(key: string): string {
    return `http://localhost:4000/api/static/${key}`;
  }
}
