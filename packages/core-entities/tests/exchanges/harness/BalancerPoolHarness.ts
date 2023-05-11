/*
import { BigNumber, Signer, ethers, Contract } from 'ethers';
import {
  BalancerPool,
  BalancerStablePoolABI,
  BalancerVault,
  BalancerVaultABI,
} from '@notional-finance/contracts';
import { getNowSeconds, Network } from '@notional-finance/util';

import { PoolTestHarness } from './PoolTestHarness';
import { BaseLiquidityPool } from '../../../src/exchanges';
import { TokenBalance } from '../../../src/token-balance';

export class BalancerPoolHarness<
  T extends BaseLiquidityPool<unknown>
> extends PoolTestHarness<T> {
  public JoinKind = {
    EXACT_TOKENS_IN_FOR_BPT_OUT: {
      kind: 1,
      // [EXACT_TOKENS_IN_FOR_BPT_OUT, amountsIn, minimumBPT]
      encoding: ['uint256', 'uint256[]', 'uint256'],
    },
    TOKEN_IN_FOR_EXACT_BPT_OUT: {
      kind: 2,
      // [TOKEN_IN_FOR_EXACT_BPT_OUT, bptAmountOut, enterTokenIndex]
      encoding: ['uint256', 'uint256', 'uint256'],
    },
    ALL_TOKENS_IN_FOR_EXACT_BPT_OUT: {
      kind: 3,
      // [ALL_TOKENS_IN_FOR_EXACT_BPT_OUT, bptAmountOut]
      encoding: ['uint256', 'uint256'],
    },
  };

  // NOTE: Composable Stable Pool V2 has different ExitKind enums
  public ExitKind = {
    EXACT_BPT_IN_FOR_ONE_TOKEN_OUT: {
      kind: 0,
      // [EXACT_BPT_IN_FOR_ONE_TOKEN_OUT, bptAmountIn, exitTokenIndex]
      encoding: ['uint256', 'uint256', 'uint256'],
    },
    EXACT_BPT_IN_FOR_TOKENS_OUT: {
      kind: 1,
      // [EXACT_BPT_IN_FOR_TOKENS_OUT, bptAmountIn]
      encoding: ['uint256', 'uint256'],
    },
    BPT_IN_FOR_EXACT_TOKENS_OUT: {
      kind: 2,
      // [BPT_IN_FOR_EXACT_TOKENS_OUT, amountsOut, maxBPTAmountIn]
      encoding: ['uint256', 'uint256[]', 'uint256'],
    },
  };

  public SwapKind = {
    GivenIn: 0,
    GivenOut: 1,
  };

  public vault: BalancerVault;
  public pool: BalancerPool;

  constructor(
    network: Network,
    poolAddress: string,
    provider: ethers.providers.JsonRpcProvider
  ) {
    super(network, poolAddress, provider);

    this.pool = new Contract(
      poolAddress,
      BalancerStablePoolABI,
      provider
    ) as BalancerPool;
    this.vault = new Contract(
      this.poolInstance.poolParams['vault'] as string,
      BalancerVaultABI,
      provider
    ) as BalancerVault;
  }

  protected parseFeeFromEvents(events?: ethers.Event[]) {
    const args = events?.find((e) => e.event === 'PoolBalanceChanged')?.args;
    if (args) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (args as any).protocolFeeAmounts as BigNumber[];
    }

    return undefined;
  }

  public async singleSideEntry(
    signer: Signer,
    entryTokenIndex: number,
    entryTokenAmount: TokenBalance
  ) {
    const tokensIn = this.poolInstance.zeroTokenArray();
    tokensIn[entryTokenIndex] = entryTokenAmount;

    return this.multiTokenEntry(signer, tokensIn);
  }

  public async singleSideExit(
    signer: Signer,
    exitTokenIndex: number,
    lpTokenAmount: TokenBalance
  ) {
    const address = await signer.getAddress();
    const userData = ethers.utils.defaultAbiCoder.encode(
      this.ExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT.encoding,
      [
        this.ExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT.kind,
        lpTokenAmount,
        exitTokenIndex,
      ]
    );

    const rcpt = await (
      await this.balancerVault
        .connect(signer)
        .exitPool(this.poolId, address, address, {
          assets: this.tokens.map((_) => _.address),
          minAmountsOut: Array(this.tokens.length).fill(0),
          userData,
          toInternalBalance: false,
        })
    ).wait();

    const feesPaid: BigNumber[] =
      this.parseFeeFromEvents(rcpt.events) ||
      Array(this.tokens.length).fill(BigNumber.from(0));

    return { tokensOut: balanceAfter.sub(balanceBefore), feesPaid };
  }

  public async multiTokenEntry(signer: Signer, tokensIn: BigNumber[]) {
    const address = await signer.getAddress();

    const userData = ethers.utils.defaultAbiCoder.encode(
      this.JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT.encoding,
      [this.JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT.kind, tokensIn, 0]
    );

    for (const t of this.tokens) {
      await t
        .connect(signer)
        .approve(this.balancerVault.address, ethers.constants.MaxUint256);
    }

    const balanceBefore = await this.balancerPool.balanceOf(address);
    const rcpt = await (
      await this.balancerVault
        .connect(signer)
        .joinPool(this.poolId, address, address, {
          assets: this.tokens.map((_) => _.address),
          maxAmountsIn: tokensIn,
          userData,
          fromInternalBalance: false,
        })
    ).wait();
    const balanceAfter = await this.balancerPool.balanceOf(address);

    const feesPaid: BigNumber[] =
      this.parseFeeFromEvents(rcpt.events) ||
      Array(this.tokens.length).fill(BigNumber.from(0));

    return { lpTokens: balanceAfter.sub(balanceBefore), feesPaid };
  }

  public async multiTokenExit(
    signer: Signer,
    lpTokenAmount: BigNumber,
    minTokensOut?: BigNumber[]
  ) {
    const address = await signer.getAddress();
    const userData = ethers.utils.defaultAbiCoder.encode(
      this.ExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT.encoding,
      [this.ExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT.kind, lpTokenAmount]
    );

    const balancesBefore = await Promise.all(
      this.tokens.map((t) => t.balanceOf(address))
    );
    const rcpt = await (
      await this.balancerVault
        .connect(signer)
        .exitPool(this.poolId, address, address, {
          assets: this.tokens.map((_) => _.address),
          minAmountsOut: minTokensOut || Array(this.tokens.length).fill(0),
          userData,
          toInternalBalance: false,
        })
    ).wait();
    const balancesAfter = await Promise.all(
      this.tokens.map((t) => t.balanceOf(address))
    );

    const feesPaid: BigNumber[] =
      this.parseFeeFromEvents(rcpt.events) ||
      Array(this.tokens.length).fill(BigNumber.from(0));

    return {
      tokensOut: balancesAfter.map((b, i) => b.sub(balancesBefore[i])),
      feesPaid,
    };
  }

  public async trade(
    signer: Signer,
    tokensIn: BigNumber,
    tokensInIndex: number,
    tokensOutIndex: number
  ) {
    const address = await signer.getAddress();
    await this.tokens[tokensInIndex]
      .connect(signer)
      .approve(this.balancerVault.address, ethers.constants.MaxUint256);

    const balanceBefore = await this.tokens[tokensOutIndex].balanceOf(address);
    const _rcpt = await (
      await this.balancerVault.connect(signer).swap(
        {
          poolId: this.poolId,
          kind: this.SwapKind.GivenIn,
          assetIn: this.tokens[tokensInIndex].address,
          assetOut: this.tokens[tokensOutIndex].address,
          amount: tokensIn,
          userData: '0x',
        },
        {
          sender: address,
          fromInternalBalance: false,
          recipient: address,
          toInternalBalance: false,
        },
        0,
        getNowSeconds() + 1000
      )
    ).wait();
    const balanceAfter = await this.tokens[tokensOutIndex].balanceOf(address);

    // TODO: grab these from events
    const feesPaid = Array(this.tokens.length).fill(BigNumber.from(0));

    return {
      tokensOut: balanceAfter.sub(balanceBefore),
      feesPaid,
    };
  }
}
*/
