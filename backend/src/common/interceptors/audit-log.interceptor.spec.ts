/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-misused-promises, @typescript-eslint/require-await */
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AuditLogInterceptor } from './audit-log.interceptor';
import { AuditLogService } from '../../modules/organizations/audit-log.service';

describe('AuditLogInterceptor', () => {
  let interceptor: AuditLogInterceptor<any>;
  let auditLogService: jest.Mocked<AuditLogService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogInterceptor,
        {
          provide: AuditLogService,
          useValue: {
            log: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    interceptor = module.get<AuditLogInterceptor<any>>(AuditLogInterceptor);
    auditLogService = module.get(AuditLogService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should skip logging for GET requests', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/api/users',
          user: { id: 'user-1', organizationId: 'org-1' },
          body: {},
        }),
      }),
    } as unknown as ExecutionContext;

    const next = {
      handle: () => of('response-data'),
    } as unknown as CallHandler;

    const result = interceptor.intercept(context, next);

    await new Promise<void>((resolve) => {
      result.subscribe({
        next: (val) => {
          expect(val).toBe('response-data');
        },
        complete: () => {
          expect(auditLogService.log).not.toHaveBeenCalled();
          resolve();
        },
      });
    });
  });

  it('should log mutations (POST)', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          url: '/api/users',
          user: { id: 'user-1', organizationId: 'org-1' },
          body: { name: 'John Doe' },
        }),
      }),
    } as unknown as ExecutionContext;

    const next = {
      handle: () => of({ id: 'user-2', name: 'John Doe' }),
    } as unknown as CallHandler;

    const result = interceptor.intercept(context, next);

    await new Promise<void>((resolve) => {
      result.subscribe({
        next: (val) => {
          expect(val).toEqual({ id: 'user-2', name: 'John Doe' });
        },
        complete: async () => {
          expect(auditLogService.log).toHaveBeenCalledWith({
            action: 'POST',
            resource: 'users',
            resourceId: 'user-2',
            userId: 'user-1',
            organizationId: 'org-1',
            details: {
              body: { name: 'John Doe' },
              response: { id: 'user-2', name: 'John Doe' },
            },
          });
          resolve();
        },
      });
    });
  });
});
