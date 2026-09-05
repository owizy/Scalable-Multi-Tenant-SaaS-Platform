import { Injectable, Logger } from '@nestjs/common';
import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly kms: KMSClient | null = null;

  constructor(private readonly config: ConfigService) {
    const region = this.config.get<string>('AWS_REGION');
    if (region) {
      this.kms = new KMSClient({ region });
    }
  }

  async encrypt(data: string, kmsKeyArn?: string): Promise<string> {
    if (!this.kms || !kmsKeyArn) return data; // Fallback to plain text if no BYOK configured

    const command = new EncryptCommand({
      KeyId: kmsKeyArn,
      Plaintext: Buffer.from(data),
    });

    try {
      const { CiphertextBlob } = await this.kms.send(command);

      if (!CiphertextBlob) {
        throw new Error('KMS returned empty CiphertextBlob');
      }

      return Buffer.from(CiphertextBlob).toString('base64');
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(`KMS Encryption failed: ${e.message}`);
      }
      throw e;
    }
  }

  async decrypt(ciphertext: string, kmsKeyArn?: string): Promise<string> {
    if (!this.kms || !kmsKeyArn) return ciphertext;

    const command = new DecryptCommand({
      KeyId: kmsKeyArn,
      CiphertextBlob: Buffer.from(ciphertext, 'base64'),
    });

    try {
      const { Plaintext } = await this.kms.send(command);

      if (!Plaintext) {
        throw new Error('KMS returned empty Plaintext');
      }

      return Buffer.from(Plaintext).toString('utf-8');
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(`KMS Decryption failed: ${e.message}`);
      }
      throw e;
    }
  }
}
