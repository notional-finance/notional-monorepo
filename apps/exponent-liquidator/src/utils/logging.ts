import { Logger, DDSeries, MetricType, getNowSeconds } from '@notional-finance/util';
import { RiskyPosition, Env, MetricNames } from '../types';

export class LiquidatorLogger {
  private logger: Logger;

  constructor(env: Env) {
    this.logger = new Logger({
      apiKey: env.DD_API_KEY,
      version: '1',
      env: env.NETWORK,
      service: 'exponent-liquidator',
    });
  }

  async logMetrics(totalPositions: number, riskyPositionCount: number, network: string): Promise<void> {
    const ddSeries: DDSeries = {
      series: [
        {
          metric: MetricNames.NUM_RISKY_ACCOUNTS,
          points: [
            {
              value: riskyPositionCount,
              timestamp: getNowSeconds(),
            },
          ],
          type: MetricType.Gauge,
          tags: [`network:${network}`],
        },
        {
          metric: MetricNames.TOTAL_ACCOUNTS_PROCESSED,
          points: [
            {
              value: totalPositions,
              timestamp: getNowSeconds(),
            },
          ],
          type: MetricType.Gauge,
          tags: [`network:${network}`],
        },
      ],
    };

    await this.logger.submitMetrics(ddSeries);
  }

  async logRiskyPositionEvents(positions: RiskyPosition[], network: string): Promise<void> {
    for (const position of positions) {
      await this.logger.submitEvent({
        aggregation_key: 'RiskyPosition',
        alert_type: 'info',
        host: 'cloudflare',
        network: network,
        title: `Risky Position Detected: ${position.account} in Vault: ${position.vault}`,
        tags: [`event:risky_position_detected`, `account:${position.account}`],
        text: `
account: ${position.account}
vault: ${position.vault}
healthFactor: ${position.healthFactor}
borrowed: ${position.borrowed.toString()}
collateralShares: ${position.collateralShares.toString()}
maxBorrow: ${position.maxBorrow.toString()}
        `,
      });
    }
  }
}