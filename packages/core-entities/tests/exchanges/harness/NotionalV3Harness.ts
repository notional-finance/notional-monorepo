import { NotionalV3, NotionalV3ABI } from '@notional-finance/contracts';
import {
  getNowSeconds,
  Network,
  NotionalAddress,
} from '@notional-finance/util';
import { Signer, Contract, ethers } from 'ethers';
import { fCashMarket } from '../../../src/exchanges/NotionalV3/fCash-market';
import { TokenBalance } from '../../../src/token-balance';
import { PoolTestHarness, UnimplementedPoolMethod } from './PoolTestHarness';

export class NotionalV3Harness extends PoolTestHarness<fCashMarket> {
  // public static async override buildPoolHarness<fCashMarket extends BaseLiquidityPool<unknown>>(
  //   network: Network,
  //   poolAddress: string,
  //   provider: ethers.providers.JsonRpcProvider
  // ): Promise<PoolTestHarness<fCashMarket>> {
  //   return new NotionalV3Harness(network, poolAddress, provider);
  // }

  public notional: NotionalV3;

  constructor(
    network: Network,
    poolAddress: string,
    provider: ethers.providers.JsonRpcProvider
  ) {
    super(network, poolAddress, provider);
    this.notional = new Contract(
      NotionalAddress[network],
      NotionalV3ABI,
      provider
    ) as NotionalV3;
  }

  async singleSideEntry(
    _signer: Signer,
    entryTokenIndex: number,
    entryTokenAmount: TokenBalance
  ): Promise<{ lpTokens: TokenBalance; feesPaid: TokenBalance[] }> {
    if (entryTokenIndex !== 0) throw new UnimplementedPoolMethod();

    // TODO: entry token amount is specified in prime cash but here it should
    // be specified in underlying
    const minted = await this.notional.calculateNTokensToMint(
      this.poolInstance.poolParams.currencyId,
      entryTokenAmount.toUnderlying().n
    );

    const lpTokens = this.poolInstance.totalSupply.copy(minted);
    const feesPaid = this.poolInstance.zeroTokenArray();

    return { lpTokens, feesPaid };
  }

  async trade(
    _signer: Signer,
    tokensIn: TokenBalance,
    tokenInIndex: number,
    tokenOutIndex: number
  ): Promise<{ tokensOut: TokenBalance; feesPaid: TokenBalance[] }> {
    if (tokenInIndex === 0) {
      // Depositing cash, getting fCash out. tokenIndexIn refers to prime cash, tokenIndexOut refers
      // to fCash
      const fCashAmount = await this.notional.getfCashAmountGivenCashAmount(
        this.poolInstance.poolParams.currencyId,
        // Convert prime cash to underlying and scale to 8 decimals for this input
        tokensIn.toUnderlying().scaleTo(8),
        tokenOutIndex,
        getNowSeconds()
      );
      const tokensOut = this.poolInstance.balances[tokenOutIndex]
        .copy(fCashAmount)
        .neg();

      // NOTE: fees paid is not returned here
      const feesPaid = this.poolInstance.zeroTokenArray();
      return { tokensOut, feesPaid };
    } else if (tokenOutIndex == 0) {
      // Depositing fCash, getting cash out. tokenIndexIn refers to fcash, tokenIndexOut must be zero and refer
      // to prime cash here
      const { borrowAmountAsset } =
        await this.notional.getPrincipalFromfCashBorrow(
          this.poolInstance.poolParams.currencyId,
          tokensIn.n,
          tokensIn.token.maturity || 0, // This must be defined
          0,
          getNowSeconds()
        );
      const tokensOut =
        this.poolInstance.balances[tokenOutIndex].copy(borrowAmountAsset);

      // NOTE: fees paid is not returned here
      const feesPaid = this.poolInstance.zeroTokenArray();
      return { tokensOut, feesPaid };
    } else {
      throw new UnimplementedPoolMethod();
    }
  }

  singleSideExit(
    _signer: Signer,
    exitTokenIndex: number,
    _lpTokenAmount: TokenBalance
  ): Promise<{ tokensOut: TokenBalance; feesPaid: TokenBalance[] }> {
    if (exitTokenIndex !== 0) throw new UnimplementedPoolMethod();

    // TODO: need to have some redeem ntoken validation method
    throw new UnimplementedPoolMethod();
  }

  multiTokenExit(
    _signer: Signer,
    _lpTokenAmount: TokenBalance,
    _minTokensOut?: TokenBalance[] | undefined
  ): Promise<{ tokensOut: TokenBalance[]; feesPaid: TokenBalance[] }> {
    // TODO: need to have some redeem ntoken validation method, but this one
    // requires that residuals exist
    throw new UnimplementedPoolMethod();
  }
  multiTokenEntry(
    _signer: Signer,
    _tokensIn: TokenBalance[]
  ): Promise<{ lpTokens: TokenBalance; feesPaid: TokenBalance[] }> {
    // NOTE: this method is not possible for nTokens
    throw new UnimplementedPoolMethod();
  }
}
