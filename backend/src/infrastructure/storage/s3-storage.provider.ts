import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider } from './storage.provider';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey:
          this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
      // Optional: Add endpoint if using LocalStack or Minio
      endpoint: this.configService.get<string>('AWS_S3_ENDPOINT'),
      forcePathStyle: this.configService.get<boolean>(
        'AWS_S3_FORCE_PATH_STYLE',
        false,
      ),
    });
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = 'general',
  ): Promise<string> {
    const key = `${folder}/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
      // Metadata if needed (e.g., source file name)
    });

    await this.client.send(command);
    return key;
  }

  async getSignedUrl(key: string, expires: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expires });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  getFileUrl(key: string): string {
    // Note: Returns the public URL (if bucket is public or behind CloudFront)
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
