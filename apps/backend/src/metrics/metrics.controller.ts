import { Controller, Get, Header } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @ApiOperation({ summary: 'Prometheus metrics scrape endpoint' })
  @ApiExcludeEndpoint()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @Get()
  getMetrics(): string {
    return this.metrics.renderPrometheus();
  }
}
