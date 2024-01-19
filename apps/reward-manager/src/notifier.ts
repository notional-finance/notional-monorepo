import DDClient, { DDEvent } from "./dd_client";

export type NotifierMessage = {
  key: string | null;
  type: string;
  text: string;
  title: string;
  tags: string[];
};

export default class Notifier {
  private network: string;
  private ddClient: DDClient;
  private events: DDEvent[];

  constructor(network: string, ddClient: DDClient) {
    this.network = network;
    this.ddClient = ddClient;
    this.events = [];
  }

  private async submitEvent(event: DDEvent): Promise<any> {
    try {
      return await this.ddClient.submitEvent(event);
    } catch (e: any) {
      console.error(`Failed to submit event (${event.title}): ${e.toString()}`);
      return null;
    }
  }

  public notifyMessage(msg: NotifierMessage) {
    const now = Date.now();
    this.events.push({
      key: msg.key,
      type: msg.type,
      text: msg.text,
      title: msg.title,
      tags: msg.tags,
      timestamp: now / 1000,
    });
  }

  public async flush(): Promise<void> {
    if (this.network !== "local" && this.network !== "fork") {
      await Promise.all(this.events.map((e) => this.submitEvent(e)));
    }
  }
}
