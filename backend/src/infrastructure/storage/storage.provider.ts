export interface StorageProvider {
  uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folder?: string,
    region?: string,
  ): Promise<string>;
  getSignedUrl(key: string, expires?: number, region?: string): Promise<string>;
  deleteFile(key: string, region?: string): Promise<void>;
  getFileUrl(key: string, region?: string): string;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
