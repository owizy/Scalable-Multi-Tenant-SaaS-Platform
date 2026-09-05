import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('Observability')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({
    summary: 'Get application metrics in Prometheus exposition format',
  })
  @ApiResponse({
    status: 200,
    description: 'Prometheus metrics retrieved successfully',
  })
  getMetrics(): string {
    return this.metricsService.getPrometheusMetrics();
  }
}
