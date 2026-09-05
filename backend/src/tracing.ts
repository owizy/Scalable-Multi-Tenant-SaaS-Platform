import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { Logger } from '@nestjs/common';

const logger = new Logger('OpenTelemetry');

const collectorUrl =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]:
      process.env.OTEL_SERVICE_NAME || 'multi-tenant-backend',
    [ATTR_SERVICE_VERSION]: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  }),
  traceExporter: new OTLPTraceExporter({
    url: collectorUrl,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-http': { enabled: true },
    }),
  ],
});

if (
  process.env.ENABLE_OTEL === 'true' ||
  process.env.NODE_ENV === 'production'
) {
  try {
    sdk.start();
    logger.log(`OpenTelemetry Tracing initialized pointing to ${collectorUrl}`);
  } catch (error) {
    logger.error('Error starting OpenTelemetry SDK', error);
  }

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => logger.log('Tracing terminated'))
      .catch((error) => logger.error('Error shutting down tracing', error))
      .finally(() => process.exit(0));
  });
}

export default sdk;
