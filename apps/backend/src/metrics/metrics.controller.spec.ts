import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  it('returns Prometheus scrape text from the metrics service', () => {
    const metrics = new MetricsService();
    const controller = new MetricsController(metrics);

    metrics.recordHttpRequest({
      method: 'GET',
      route: '/health',
      statusCode: 200,
      durationSeconds: 0.03,
    });

    expect(controller.getMetrics()).toContain(
      'stellar_bounty_http_requests_total{method="GET",route="/health",status_code="200"} 1',
    );
  });
});
