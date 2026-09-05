import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';

export interface TracedRequest extends Request {
  traceId?: string;
}

@Injectable()
export class TracingMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: TracedRequest, res: Response, next: NextFunction) {
    // 1. Extract incoming W3C traceparent header or generated X-Request-ID
    const existingTraceParent = req.headers['traceparent'] as string;
    const existingRequestId = req.headers['x-request-id'] as string;

    const traceId =
      existingRequestId ||
      (existingTraceParent ? existingTraceParent.split('-')[1] : uuidv4());
    const spanId = uuidv4().substring(0, 16);

    // 2. Set request context in CLS (Continuation Local Storage)
    this.cls.set('traceId', traceId);
    this.cls.set('spanId', spanId);
    this.cls.set('orgId', req.headers['x-tenant-id'] || 'system');

    req.traceId = traceId;

    // 3. Inject trace headers into response
    res.setHeader('x-trace-id', traceId);
    res.setHeader('traceparent', `00-${traceId}-${spanId}-01`);

    next();
  }
}
