import DDClient from "./dd_client";

type Metric = {
  name: string;
  timestamp: number;
  value: number;
  tags: string[];
};

export class MetricNames {
  public static readonly NUM_RISKY_ACCOUNTS = "num_risky_accounts";
  public static readonly FREE_COLLATERAL = "free_collateral";
  public static readonly TOTAL_ACCOUNTS_PROCESSED = "total_accounts_processed";
  public static readonly VAULT_COLLATERAL_SHORTFALL = "vault_collateral_shortfall";
}

export default class MetricsSender {
  private network: string;
  private metrics: Metric[];
  private ddClient: DDClient;
  private namespace: string;

  constructor(network: string, namespace: string, ddClient: DDClient) {
    this.network = network;
    this.metrics = [];
    this.ddClient = ddClient;
    this.namespace = namespace;
  }

  public addMetric(name: string, tags: string[], value: number): void {
    this.metrics.push({
      name: name,
      timestamp: Date.now() / 1000,
      value: value,
      tags: tags.concat(`network:${this.network}`),
    });
  }

  private async submitMetric(metric: Metric): Promise<void> {
    try {
      await this.ddClient.submitMetric({
        name: `${this.namespace}.${metric.name}`,
        value: metric.value,
        timestamp: metric.timestamp,
        tags: metric.tags,
      });
    } catch (e: any) {
      console.error(
        `Failed to submit metric (${metric.name}): ${e.toString()}`
      );
    }
  }

  public async flush(): Promise<void> {
    if (this.network !== "local" && this.network !== "fork") {
      await Promise.all(this.metrics.map((m) => this.submitMetric(m)));
    }
  }
}
