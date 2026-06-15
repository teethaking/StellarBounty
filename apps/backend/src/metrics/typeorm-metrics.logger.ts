import { Logger } from 'typeorm';
import { MetricsService } from './metrics.service';

export class TypeOrmMetricsLogger implements Logger {
  constructor(private readonly metrics: MetricsService) {}

  logQuery(query: string): void {
    this.metrics.recordDatabaseQuery({ operation: this.operationFromQuery(query) });
  }

  logQueryError(_error: string | Error, query: string): void {
    void _error;
    this.metrics.recordDatabaseQuery({
      operation: this.operationFromQuery(query),
      failed: true,
    });
  }

  logQuerySlow(time: number, query: string): void {
    this.metrics.recordDatabaseQuery({
      operation: this.operationFromQuery(query),
      durationSeconds: time / 1000,
    });
  }

  logSchemaBuild(): void {}

  logMigration(): void {}

  log(): void {}

  private operationFromQuery(query: string): string {
    const [operation] = query.trim().split(/\s+/, 1);
    return operation ? operation.toUpperCase() : 'UNKNOWN';
  }
}
