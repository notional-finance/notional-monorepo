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

  estimatedWithdrawTimeInSeconds?: number;
}

class DefaultWithdrawStrategy implements WithdrawStrategy {
  constructor(public estimatedWithdrawTimeInSeconds?: number) {}

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
    public stakingToken: TokenDefinition,
    public withdrawToken: TokenDefinition,
    public yieldToken: TokenDefinition
  ) {
    this.strategy = this.createStrategy();
  }

  get estimatedWithdrawTimeInSeconds(): number | undefined {
    return this.strategy.estimatedWithdrawTimeInSeconds;
  }

  private createStrategy(): WithdrawStrategy {
    if (this.yieldToken.symbol === 'sUSDe') {
      return new DefaultWithdrawStrategy(7 * SECONDS_IN_DAY);
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
