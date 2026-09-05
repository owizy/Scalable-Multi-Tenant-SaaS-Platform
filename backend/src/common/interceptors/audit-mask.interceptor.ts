import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditMaskInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string } }>();
    const user = request.user;
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    return next.handle().pipe(
      map((data: unknown) => {
        if (!data || isAdmin) return data;

        // If not admin, mask sensitive details in audit logs
        const maskData = (
          obj:
            Record<string, Exclude<Prisma.JsonValue, null>> | Prisma.JsonValue,
        ): typeof obj => {
          if (Array.isArray(obj)) {
            return obj.map(maskData);
          } else if (obj !== null && typeof obj === 'object') {
            const masked = { ...obj } as Record<
              string,
              Exclude<Prisma.JsonValue, null>
            >;
            if ('details' in masked) {
              masked.details = '[REDACTED FOR PRIVACY]';
            }
            return masked;
          }
          return obj;
        };

        return maskData(data);
      }),
    );
  }
}
