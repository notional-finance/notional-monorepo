import axios from "axios";

const DD_BASE_URL = "https://api.datadoghq.com";

export type DDEvent = {
  key: string | null;
  type: string;
  text: string;
  title: string;
  tags: string[];
  timestamp: number;
};

export type DDMetric = {
  name: string;
  value: number;
  tags: string[];
  timestamp: number;
};

export default class DDClient {
  private apiKey: string;
  private appKey: string;

  constructor(apiKey: string, appKey: string) {
    this.apiKey = apiKey;
    this.appKey = appKey;
  }

  public async submitEvent(event: DDEvent): Promise<any> {
    const resp = await axios.post(
      `${DD_BASE_URL}/api/v1/events`,
      {
        aggregation_key: event.key,
        alert_type: event.type,
        date_happened: event.timestamp,
        text: event.text,
        title: event.title,
        tags: event.tags,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "DD-API-KEY": this.apiKey,
          "DD-APPLICATION-KEY": this.appKey,
        },
      }
    );

    return resp.data;
  }

  public async submitMetric(metric: DDMetric): Promise<any> {
    const resp = await axios.post(
      `${DD_BASE_URL}/api/v1/series`,
      {
        series: [
          {
            metric: metric.name,
            points: [[metric.timestamp, metric.value]],
            tags: metric.tags,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "DD-API-KEY": this.apiKey,
          "DD-APPLICATION-KEY": this.appKey,
        },
      }
    );

    return resp.data;
  }
}
