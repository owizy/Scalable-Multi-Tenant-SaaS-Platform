/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { AuditMaskInterceptor } from './audit-mask.interceptor';

describe('AuditMaskInterceptor', () => {
  let interceptor: AuditMaskInterceptor<any>;

  beforeEach(() => {
    interceptor = new AuditMaskInterceptor();
  });

  it('should not mask data if user is an ADMIN', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'ADMIN' },
        }),
      }),
    } as unknown as ExecutionContext;

    const data = {
      id: 'log-1',
      action: 'POST',
      details: { secret: 'sensitive info' },
    };
    const next = {
      handle: () => of(data),
    } as unknown as CallHandler;

    interceptor.intercept(context, next).subscribe({
      next: (val) => {
        expect(val).toEqual(data);
      },
      complete: () => done(),
    });
  });

  it('should not mask data if user is a SUPER_ADMIN', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'SUPER_ADMIN' },
        }),
      }),
    } as unknown as ExecutionContext;

    const data = {
      id: 'log-1',
      action: 'POST',
      details: { secret: 'sensitive info' },
    };
    const next = {
      handle: () => of(data),
    } as unknown as CallHandler;

    interceptor.intercept(context, next).subscribe({
      next: (val) => {
        expect(val).toEqual(data);
      },
      complete: () => done(),
    });
  });

  it('should mask details if user is not ADMIN or SUPER_ADMIN', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'MEMBER' },
        }),
      }),
    } as unknown as ExecutionContext;

    const data = {
      id: 'log-1',
      action: 'POST',
      details: { secret: 'sensitive info' },
    };
    const next = {
      handle: () => of(data),
    } as unknown as CallHandler;

    interceptor.intercept(context, next).subscribe({
      next: (val) => {
        expect(val).toEqual({
          id: 'log-1',
          action: 'POST',
          details: '[REDACTED FOR PRIVACY]',
        });
      },
      complete: () => done(),
    });
  });

  it('should recursively mask an array of data', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'VIEWER' },
        }),
      }),
    } as unknown as ExecutionContext;

    const data = [
      { id: 'log-1', details: { secret: 'sensitive info 1' } },
      { id: 'log-2', details: { secret: 'sensitive info 2' } },
    ];
    const next = {
      handle: () => of(data),
    } as unknown as CallHandler;

    interceptor.intercept(context, next).subscribe({
      next: (val) => {
        expect(val).toEqual([
          { id: 'log-1', details: '[REDACTED FOR PRIVACY]' },
          { id: 'log-2', details: '[REDACTED FOR PRIVACY]' },
        ]);
      },
      complete: () => done(),
    });
  });

  it('should handle null data gracefully', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'VIEWER' },
        }),
      }),
    } as unknown as ExecutionContext;

    const next = {
      handle: () => of(null),
    } as unknown as CallHandler;

    interceptor.intercept(context, next).subscribe({
      next: (val) => {
        expect(val).toBeNull();
      },
      complete: () => done(),
    });
  });
});
