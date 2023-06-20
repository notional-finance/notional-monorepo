import { NotionalV3, NotionalV3ABI } from '@notional-finance/contracts';
import {
  getNowSeconds,
  Network,
  NotionalAddress,
} from '@notional-finance/util';
import { Signer, Contract, ethers, BigNumber } from 'ethers';
import { fCashMarket } from '../../../src/exchanges/NotionalV3/fCash-market';
import { TokenBalance } from '../../../src/token-balance';
import { PoolTestHarness, UnimplementedPoolMethod } from './PoolTestHarness';

export class NotionalV3Harness extends PoolTestHarness<fCashMarket> {
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
      const maturity = this.poolInstance.balances[tokenOutIndex].maturity;
      const { fCashAmount } = await this.notional.getfCashLendFromDeposit(
        this.poolInstance.poolParams.currencyId,
        tokensIn.n,
        maturity,
        0,
        getNowSeconds(),
        false
      );
      const tokensOut =
        this.poolInstance.balances[tokenOutIndex].copy(fCashAmount);

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
          tokensIn.maturity, // This must be defined
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

  async singleSideExit(
    signer: Signer,
    exitTokenIndex: number,
    lpTokenAmount: TokenBalance
  ): Promise<{ tokensOut: TokenBalance; feesPaid: TokenBalance[] }> {
    if (exitTokenIndex !== 0) throw new UnimplementedPoolMethod();
    const account = await signer.getAddress();
    const { cashBalance: cashBefore } = await this.notional.getAccountBalance(
      this.poolInstance.poolParams.currencyId,
      account
    );
    await this.notional
      .connect(signer)
      .nTokenRedeem(
        account,
        this.poolInstance.poolParams.currencyId,
        lpTokenAmount.n,
        true,
        false,
        { gasLimit: 2_500_000 }
      );
    const { cashBalance: cashAfter } = await this.notional.getAccountBalance(
      this.poolInstance.poolParams.currencyId,
      account
    );

    return {
      tokensOut: this.poolInstance.balances[0].copy(cashAfter.sub(cashBefore)),
      feesPaid: this.poolInstance.zeroTokenArray(),
    };
  }

  async multiTokenExit(
    signer: Signer,
    lpTokenAmount: TokenBalance,
    _minTokensOut?: TokenBalance[] | undefined
  ): Promise<{ tokensOut: TokenBalance[]; feesPaid: TokenBalance[] }> {
    const account = await signer.getAddress();
    const { cashBalance: cashBefore } = await this.notional.getAccountBalance(
      this.poolInstance.poolParams.currencyId,
      account
    );
    await this.notional
      .connect(signer)
      .nTokenRedeem(
        account,
        this.poolInstance.poolParams.currencyId,
        lpTokenAmount.n,
        false,
        true,
        { gasLimit: 2_500_000 }
      );
    const { cashBalance: cashAfter } = await this.notional.getAccountBalance(
      this.poolInstance.poolParams.currencyId,
      account
    );

    const fCashBalances = (
      await Promise.all(
        this.poolInstance.poolParams.nTokenFCash.map((v) =>
          this.notional.balanceOf(account, BigNumber.from(v.tokenId))
        )
      )
    ).map((b, i) => {
      return this.poolInstance.poolParams.nTokenFCash[i].copy(b);
    });

    const tokensOut = [
      this.poolInstance.balances[0].copy(cashAfter.sub(cashBefore)),
      ...fCashBalances,
    ];

    return {
      tokensOut,
      feesPaid: this.poolInstance.zeroTokenArray(),
    };
  }
  multiTokenEntry(
    _signer: Signer,
    _tokensIn: TokenBalance[]
  ): Promise<{ lpTokens: TokenBalance; feesPaid: TokenBalance[] }> {
    // NOTE: this method is not possible for nTokens
    throw new UnimplementedPoolMethod();
  }
}
