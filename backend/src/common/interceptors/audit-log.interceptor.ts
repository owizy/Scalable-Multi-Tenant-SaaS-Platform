import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../../modules/organizations/audit-log.service';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

import { Prisma } from '@prisma/client';

@Injectable()
export class AuditLogInterceptor<T> implements NestInterceptor<T, unknown> {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const method = request.method;
    const url = request.url;
    const user = request.user;
    const body = request.body as Record<string, Prisma.JsonValue> | undefined;

    // Only log mutations (POST, PUT, DELETE, PATCH)
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((response: unknown) => {
        if (user?.organizationId) {
          // Identify resource from URL or Body
          const resource = url.split('/')[2] || 'undefined';

          const resId =
            (response as { id?: string })?.id ||
            (body as { id?: string } | undefined)?.id;

          this.auditLogService
            .log({
              action: method,
              resource,
              resourceId: resId,
              userId: user.id,
              organizationId: user.organizationId,
              details: {
                body,
                response:
                  method === 'DELETE'
                    ? null
                    : (response as Prisma.InputJsonValue),
              },
            })
            .catch((err: Error) => {
              console.error(`Failed to log audit: ${err.message}`);
            });
        }
      }),
    );
  }
}
