export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface NotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  userId?: string;
  organizationId: string;
  metadata?: Record<string, string | number | boolean | null>;
}
