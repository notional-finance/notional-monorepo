import DDClient, { DDEvent } from "./dd_client";
import { LiquidationTransaction, ManualLiquidation } from "./types";

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

  public notifyFailedTransactions(transactions: LiquidationTransaction[]) {
    const now = Date.now();
    this.events.push(
      ...transactions.map((tx) => {
        const tags: string[] = [];
        tags.push(`account:${tx.accountLiquidation.getId()}`);
        tags.push(`network:${this.network}`);
        tags.push(`event:transaction_failed`);
        if (tx.txHash) {
          tags.push(`txnHash:${tx.txHash}`);
        }

        return {
          key: tx.accountLiquidation.getId(),
          type: "error",
          text: `Transaction failed for account ${tx.accountLiquidation.getId()}`,
          title: "Transaction failed",
          tags: tags,
          timestamp: now / 1000,
        };
      })
    );
  }

  public notifyManualLiquidations(liquidations: ManualLiquidation[]) {
    const now = Date.now();
    this.events.push(
      ...liquidations.map((liq) => {
        const tags: string[] = [];
        tags.push(`account:${liq.id}`);
        tags.push(`network:${this.network}`);
        tags.push(`event:manual_liquidation`);
        return {
          key: liq.id,
          type: "info",
          text: `Account ${
            liq.id
          } needs to be liquidated manually. Possible liquidations = ${liq.possibleLiqs.map(
            (pl) => pl.toString()
          )}`,
          title: "Manual liquidation",
          tags: tags,
          timestamp: now / 1000,
        };
      })
    );
  }

  public async flush(): Promise<void> {
    if (this.network !== "local" && this.network !== "fork") {
      await Promise.all(this.events.map((e) => this.submitEvent(e)));
    }
  }
}
