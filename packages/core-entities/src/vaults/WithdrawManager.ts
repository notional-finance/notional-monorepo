import { BytesLike } from 'ethers';
import { TokenBalance } from '../token-balance';
import { TokenDefinition } from '..';
import {
  getDateString,
  SECONDS_IN_DAY,
  SECONDS_IN_WEEK,
} from '@notional-finance/util';

interface WithdrawContext {
  stakingToken: TokenDefinition;
  withdrawToken: TokenDefinition;
  yieldToken: TokenDefinition;
}

interface WithdrawStrategy {
  getWithdrawParameters(
    account: string,
    vaultSharesToRedeem: TokenBalance,
    context: WithdrawContext
  ): Promise<BytesLike>;

  estimatedWithdrawTimeFn(withdrawRequests?: {
    lastUpdateTimestamp: number;
    requestId: string;
  }): string | undefined;
  earnsYieldDuringWithdraw: boolean;
}

class DefaultWithdrawStrategy implements WithdrawStrategy {
  constructor(
    public estimatedWithdrawTimeFn: (withdrawRequests?: {
      lastUpdateTimestamp: number;
      requestId: string;
    }) => string | undefined,
    public earnsYieldDuringWithdraw = false
  ) {}

  async getWithdrawParameters(
    _account: string,
    _vaultSharesToRedeem: TokenBalance,
    _context: WithdrawContext
  ): Promise<BytesLike> {
    return '0x';
  }
}

export class WithdrawManager {
  private strategy: WithdrawStrategy;

  constructor(
    public address: string,
    public strategyType: string,
    public stakingToken: TokenDefinition,
    public withdrawToken: TokenDefinition,
    public yieldToken: TokenDefinition
  ) {
    this.strategy = this.createStrategy();
  }

  estimatedWithdrawTime(withdrawRequests?: {
    lastUpdateTimestamp: number;
    requestId: string;
  }): string | undefined {
    return this.strategy.estimatedWithdrawTimeFn(withdrawRequests);
  }

  get earnsYieldDuringWithdraw(): boolean {
    return this.strategy.earnsYieldDuringWithdraw;
  }

  private createStrategy(): WithdrawStrategy {
    if (this.yieldToken.symbol === 'sUSDe') {
      return new DefaultWithdrawStrategy(() => '7 days');
    } else if (this.strategyType === 'MidasStaking') {
      return new DefaultWithdrawStrategy(() => 'within 3 business days', true);
    } else if (this.yieldToken.symbol === 'liUSD-4w') {
      return new DefaultWithdrawStrategy((w) => {
        if (w) {
          const EPOCH_OFFSET = 3 * SECONDS_IN_DAY;
          const nextEpoch =
            Math.floor(
              (w.lastUpdateTimestamp - EPOCH_OFFSET) / SECONDS_IN_WEEK
            ) + 1;
          const endEpoch = nextEpoch + 4;
          return getDateString(endEpoch * SECONDS_IN_WEEK + EPOCH_OFFSET);
        }
        return '4 weeks';
      }, true);
    }
    // Can switch on yield token here to return different strategies
    return new DefaultWithdrawStrategy(() => undefined);
  }

  getWithdrawParameters(
    account: string,
    vaultSharesToRedeem: TokenBalance
  ): Promise<BytesLike> {
    return this.strategy.getWithdrawParameters(account, vaultSharesToRedeem, {
      stakingToken: this.stakingToken,
      withdrawToken: this.withdrawToken,
      yieldToken: this.yieldToken,
    });
  }
}
