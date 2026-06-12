import { MetricsService } from './metrics.service';
import { TypeOrmMetricsLogger } from './typeorm-metrics.logger';

describe('TypeOrmMetricsLogger', () => {
  it('records query counts, errors, and slow query durations without logging SQL text', () => {
    const metrics = new MetricsService();
    const logger = new TypeOrmMetricsLogger(metrics);

    logger.logQuery('select * from bounties');
    logger.logQueryError(new Error('failed'), 'insert into bounties values ($1)');
    logger.logQuerySlow(425, 'update bounties set status = $1');

    const output = metrics.renderPrometheus();

    expect(output).toContain('stellar_bounty_database_queries_total{operation="SELECT"} 1');
    expect(output).toContain('stellar_bounty_database_queries_total{operation="INSERT"} 1');
    expect(output).toContain('stellar_bounty_database_query_errors_total{operation="INSERT"} 1');
    expect(output).toContain('stellar_bounty_database_query_duration_seconds_count 1');
    expect(output).toContain('stellar_bounty_database_slow_queries_total 1');
    expect(output).not.toContain('bounties values');
  });
});
