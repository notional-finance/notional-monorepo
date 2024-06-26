import { Network } from '@notional-finance/util';

type LoggerOptions = {
  service: string;
  version: string;
  apiKey: string;
  env: string;
};

type LogMessage = {
  message: string;
  level?: string;
  service?: string;
  tags?: string;
  chain?: string;
  [key: string]: unknown;
};

export enum MetricType {
  Unspecified = 0,
  Count = 1,
  Rate = 2,
  Gauge = 3,
}

export type DDMetric = {
  metric: string;
  points: {
    value: number;
    timestamp: number;
  }[];
  type: MetricType;
  tags: string[];
};

export type DDSeries = {
  series: DDMetric[];
};

type DDEventKey =
  | 'GeoIPLog'
  | 'NewsletterSubmitFailure'
  | 'AccountRiskFailure'
  | 'AccountLiquidated'
  | 'RiskyAccount'
  | 'AccountListMismatch'
  | 'VaultAccountListMismatch'
  | 'SettlementReserveMismatch'
  | 'TotalSupplyMismatch'
  | 'TotalSupplyMissing'
  | 'TotalBorrowCapacityMismatch'
  | 'PrimeCashInvariant'
  | 'MonitoringCheckFailed'
  | 'MonitoringCheckLagging';

type DDEventAlertType = 'error' | 'warning' | 'info';

type DDEvent = {
  aggregation_key: DDEventKey;
  alert_type: DDEventAlertType;
  host: string;
  network: Network;
  title: string;
  tags: string[];
  text: string;
};

const MessageDefaults = {
  level: 'info',
  ddsource: 'nodejs',
  message: '',
};

const Endpoints = {
  logs: `https://http-intake.logs.datadoghq.com/api/v2/logs`,
  metrics: `https://api.datadoghq.com/api/v2/series`,
  events: `https://api.datadoghq.com/api/v1/events`,
};

export class Logger {
  baseMessage: LogMessage;

  constructor(public loggerConfig: LoggerOptions) {
    this.baseMessage = {
      ...MessageDefaults,
      service: loggerConfig.service,
      version: loggerConfig.version,
      env: loggerConfig.env,
    };
  }

  async log(msg: LogMessage) {
    const timestamp = new Date();
    const body = JSON.stringify({
      ...this.baseMessage,
      ...msg,
      timestamp,
    });

    try {
      const opts = {
        method: 'POST',
        body,
        headers: {
          'Content-Encoding': 'gzip',
          'Content-Type': 'application/json',
          'dd-api-key': this.loggerConfig.apiKey,
        },
      };

      await fetch(Endpoints.logs, opts);
    } catch (e) {
      console.log(body);
    }
  }

  async submitMetrics(series: DDSeries) {
    try {
      const body = JSON.stringify(series);
      const opts = {
        method: 'POST',
        body,
        headers: {
          'content-type': 'application/json',
          'dd-api-key': this.loggerConfig.apiKey,
        },
      };

      await fetch(Endpoints.metrics, opts);
    } catch (e) {
      console.error(e);
    }
  }

  async submitEvent(event: DDEvent) {
    try {
      event.tags.push(`network:${event.network}`);
      const body = JSON.stringify({ ...event, source_type_name: 'cloudflare' });
      const opts = {
        method: 'POST',
        body,
        headers: {
          'content-type': 'application/json',
          'dd-api-key': this.loggerConfig.apiKey,
        },
      };

      await fetch(Endpoints.events, opts);
    } catch (e) {
      console.error(e);
    }
  }
}
