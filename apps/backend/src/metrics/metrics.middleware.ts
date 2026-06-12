import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metrics: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
      const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
      this.metrics.recordHttpRequest({
        method: req.method,
        route: this.routeLabel(req),
        statusCode: res.statusCode,
        durationSeconds,
      });
    });

    next();
  }

  private routeLabel(req: Request): string {
    const routePath = req.route?.path;
    if (typeof routePath === 'string') {
      return routePath;
    }
    return req.path;
  }
}
