import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private requestCounts = new Map<string, number>();
  private requestDurations = new Map<
    string,
    { count: number; totalMs: number }
  >();
  private startTime = Date.now();

  recordRequest(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
  ): void {
    // Normalize path to prevent high-cardinality explosion
    const normalizedPath = this.normalizePath(path);
    const key = `http_requests_total{method="${method}",path="${normalizedPath}",status="${statusCode}"}`;
    this.requestCounts.set(key, (this.requestCounts.get(key) || 0) + 1);

    const durationKey = `http_request_duration_ms{method="${method}",path="${normalizedPath}"}`;
    const current = this.requestDurations.get(durationKey) || {
      count: 0,
      totalMs: 0,
    };
    this.requestDurations.set(durationKey, {
      count: current.count + 1,
      totalMs: current.totalMs + durationMs,
    });
  }

  getPrometheusMetrics(): string {
    const memUsage = process.memoryUsage();
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;

    let output = `# HELP process_uptime_seconds Total uptime of the application process in seconds\n`;
    output += `# TYPE process_uptime_seconds counter\n`;
    output += `process_uptime_seconds ${uptimeSeconds.toFixed(2)}\n\n`;

    output += `# HELP process_resident_memory_bytes Resident memory size in bytes\n`;
    output += `# TYPE process_resident_memory_bytes gauge\n`;
    output += `process_resident_memory_bytes ${memUsage.rss}\n\n`;

    output += `# HELP process_heap_bytes Process heap memory usage in bytes\n`;
    output += `# TYPE process_heap_bytes gauge\n`;
    output += `process_heap_bytes{type="used"} ${memUsage.heapUsed}\n`;
    output += `process_heap_bytes{type="total"} ${memUsage.heapTotal}\n\n`;

    output += `# HELP http_requests_total Total number of HTTP requests processed\n`;
    output += `# TYPE http_requests_total counter\n`;
    for (const [key, count] of this.requestCounts.entries()) {
      output += `${key} ${count}\n`;
    }
    output += `\n`;

    output += `# HELP http_request_duration_ms_avg Average HTTP request duration in milliseconds\n`;
    output += `# TYPE http_request_duration_ms_avg gauge\n`;
    for (const [key, stats] of this.requestDurations.entries()) {
      const avg =
        stats.count > 0 ? (stats.totalMs / stats.count).toFixed(2) : '0';
      output += `${key} ${avg}\n`;
    }

    return output;
  }

  private normalizePath(path: string): string {
    // Replace UUIDs and numeric IDs in paths to avoid metric cardinality explosion
    return path
      .replace(
        /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g,
        ':id',
      )
      .replace(/\/\d+/g, '/:id');
  }
}
