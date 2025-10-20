import { RiskyPosition, Env, Position, EnrichedPosition } from '../types';

// Error context types for flexible input data handling
type ErrorContext =
  | { type: 'positions'; data: Position[] }
  | { type: 'riskyPositions'; data: RiskyPosition[] }
  | { type: 'enrichedPositions'; data: EnrichedPosition[] }
  | {
      type: 'transaction';
      data: { to?: string; data?: string; gasLimit?: number };
    }
  | {
      type: 'liquidationParams';
      data: { vaultAddress: string; accounts: string[]; totalBorrowed: string };
    }
  | {
      type: 'vaultRegistry';
      data: { vaultAddresses: string[]; network: string };
    }
  | { type: 'tokenPrices'; data: { tokenCount: number; network: string } }
  | { type: 'generic'; data: Record<string, unknown> };

export class LiquidatorLogger {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async logError(
    executionStep: string,
    errorMessage: string,
    context?: ErrorContext
  ): Promise<void> {
    const errorTitle = `Liquidator Error: ${executionStep}`;

    let contextText = '';

    if (context) {
      switch (context.type) {
        case 'positions':
          contextText = `Positions count: ${
            context.data.length
          }\nSample positions: ${JSON.stringify(context.data.slice(0, 3))}`;
          break;

        case 'riskyPositions':
          contextText = `Risky positions count: ${
            context.data.length
          }\nHealth factors: ${context.data
            .map((p) => p.healthFactor)
            .slice(0, 5)}`;
          break;

        case 'enrichedPositions': {
          const withdrawPending = context.data.filter(
            (p) => p.isWithdrawRequestPending
          ).length;
          contextText = `Enriched positions: ${context.data.length}\nWithdraw requests pending: ${withdrawPending}`;
          break;
        }

        case 'transaction':
          contextText = `Transaction details:\nTo: ${
            context.data.to
          }\nGas limit: ${context.data.gasLimit}\nData length: ${
            context.data.data?.length || 0
          }`;
          break;

        case 'liquidationParams':
          contextText = `Liquidation params:\nVault: ${context.data.vaultAddress}\nAccounts: ${context.data.accounts.length}\nTotal borrowed: ${context.data.totalBorrowed}`;
          break;

        case 'vaultRegistry':
          contextText = `Vault registry:\nVault addresses: ${context.data.vaultAddresses.length}\nNetwork: ${context.data.network}`;
          break;

        case 'tokenPrices':
          contextText = `Token prices:\nToken count: ${context.data.tokenCount}\nNetwork: ${context.data.network}`;
          break;

        case 'generic':
          contextText = `Generic context: ${JSON.stringify(
            context.data,
            null,
            2
          )}`;
          break;
      }
    }

    const logData = {
      timestamp: new Date().toISOString(),
      service: 'exponent-liquidator',
      status: 'error',
      message: errorTitle,
      error: errorMessage,
      context: contextText,
    };

    const datadogUrl = `https://http-intake.logs.datadoghq.com/v1/input/${this.env.DD_API_KEY}`;

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await fetch(datadogUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        console.error(
          `Failed to send log to DataDog: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error('Error sending log to DataDog:', error);
    }
  }
}
