import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID as uuidv4 } from 'node:crypto';

export interface RequestIdRequest extends Request {
  id: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestIdRequest, res: Response, next: NextFunction) {
    const requestId = (req.get('X-Request-ID') as string) || uuidv4();

    // Set in response header for traceability
    res.setHeader('X-Request-ID', requestId);

    // Store in request for later use in logging
    req.id = requestId;

    next();
  }
}
