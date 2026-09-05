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
export class PiiRedactInterceptor<T, R> implements NestInterceptor<T, R> {
  private readonly piiPatterns = [
    { name: 'EMAIL', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
    { name: 'PHONE', regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g },
    { name: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
    { name: 'CREDIT_CARD', regex: /\b(?:\d[ -]*?){13,16}\b/g },
  ];

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<R> {
    return next
      .handle()
      .pipe(
        map((data) => this.redact(data as unknown as Prisma.JsonValue) as R),
      );
  }

  private redact(data: Prisma.JsonValue): Prisma.JsonValue {
    if (typeof data === 'string') {
      let redacted = data;
      this.piiPatterns.forEach((p) => {
        redacted = redacted.replace(p.regex, `[REDACTED_${p.name}]`);
      });
      return redacted;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.redact(item));
    }

    if (typeof data === 'object' && data !== null) {
      const redactedObj: Record<string, Prisma.JsonValue> = {};
      for (const key in data as Record<string, Prisma.JsonValue>) {
        redactedObj[key] = this.redact(
          (data as Record<string, Prisma.JsonValue>)[key],
        );
      }
      return redactedObj;
    }

    return data;
  }
}
