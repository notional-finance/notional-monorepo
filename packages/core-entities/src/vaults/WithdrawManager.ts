import { BytesLike } from 'ethers';
import { TokenBalance } from '../token-balance';
import { TokenDefinition } from '..';
import { SECONDS_IN_DAY } from '@notional-finance/util';

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

  estimatedWithdrawTime?: string;
}

class DefaultWithdrawStrategy implements WithdrawStrategy {
  constructor(public estimatedWithdrawTime?: string) {}

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

  get estimatedWithdrawTime(): string | undefined {
    return this.strategy.estimatedWithdrawTime;
  }

  private createStrategy(): WithdrawStrategy {
    if (this.yieldToken.symbol === 'sUSDe') {
      return new DefaultWithdrawStrategy('7 days');
    } else if (this.strategyType === 'MidasStaking') {
      return new DefaultWithdrawStrategy('within 3 business days');
    }
    // Can switch on yield token here to return different strategies
    return new DefaultWithdrawStrategy();
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
