import { BytesLike } from 'ethers';
import { TokenBalance } from '../token-balance';
import { TokenDefinition } from '..';

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
  earnsYieldDuringWithdraw: boolean;
}

class DefaultWithdrawStrategy implements WithdrawStrategy {
  constructor(
    public estimatedWithdrawTime?: string,
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

  get estimatedWithdrawTime(): string | undefined {
    return this.strategy.estimatedWithdrawTime;
  }

  get earnsYieldDuringWithdraw(): boolean {
    return this.strategy.earnsYieldDuringWithdraw;
  }

  private createStrategy(): WithdrawStrategy {
    if (this.yieldToken.symbol === 'sUSDe') {
      return new DefaultWithdrawStrategy('7 days');
    } else if (this.strategyType === 'MidasStaking') {
      return new DefaultWithdrawStrategy('within 3 business days', true);
    } else if (this.yieldToken.symbol === 'liUSD-4w') {
      // TODO: this does not count down from the withdraw init time.
      return new DefaultWithdrawStrategy('4 weeks', true);
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
