import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';

@Injectable()
export class ProductionSecretsService implements OnModuleInit {
  private readonly logger = new Logger(ProductionSecretsService.name);
  private readonly secretsStore: Map<string, string> = new Map();

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    await this.loadProductionSecrets();
  }

  private async loadProductionSecrets(): Promise<void> {
    const provider = this.config.get<string>('SECRETS_PROVIDER', 'env');
    this.logger.log(
      `Initializing Production Secrets Provider: [${provider.toUpperCase()}]`,
    );

    if (provider === 'aws-kms') {
      const region = this.config.get<string>('AWS_REGION', 'us-east-1');
      const kmsClient = new KMSClient({ region });

      const encryptedJwtSecret = this.config.get<string>(
        'ENCRYPTED_JWT_SECRET',
      );
      if (encryptedJwtSecret) {
        try {
          const res = await kmsClient.send(
            new DecryptCommand({
              CiphertextBlob: Buffer.from(encryptedJwtSecret, 'base64'),
            }),
          );
          if (res.Plaintext) {
            this.secretsStore.set(
              'JWT_SECRET',
              Buffer.from(res.Plaintext).toString('utf-8'),
            );
            this.logger.log('Successfully decrypted JWT_SECRET via AWS KMS');
          }
        } catch (err) {
          this.logger.error(
            `Failed to decrypt JWT_SECRET via KMS: ${(err as Error).message}`,
          );
        }
      }
    }
  }

  getSecret(key: string, defaultValue?: string): string {
    if (this.secretsStore.has(key)) {
      return this.secretsStore.get(key)!;
    }
    return this.config.get<string>(key, defaultValue || '');
  }
}
