import { BigNumber, Signer, ethers, Contract } from 'ethers';
import {
  BalancerPool,
  BalancerStablePoolABI,
  BalancerVault,
  BalancerVaultABI,
  ERC20,
  ERC20ABI,
} from '@notional-finance/contracts';
import { getNowSeconds } from '@notional-finance/util';
import { Network, TokenBalance } from '../../../src';
import { aggregate } from '@notional-finance/multicall';

import { PoolTestHarness } from './PoolTestHarness';
import { MetaStable2Token } from '../../../src/exchanges';

export class BalancerPoolHarness extends PoolTestHarness {
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

  public static override async makePoolHarness(
    network: Network,
    poolAddress: string
  ) {
    const callData = MetaStable2Token.getInitData(network, poolAddress);
    const { results } = await aggregate(callData, provider);
    return new BalancerPoolHarness(
      results['poolId'] as string,
      new Contract(
        poolAddress,
        BalancerStablePoolABI,
        provider
      ) as BalancerPool,
      new Contract(
        results['vaultAddress'] as string,
        BalancerVaultABI,
        provider
      ) as BalancerVault,
      (results['balances'] as TokenBalance[]).map(
        (b) => new Contract(b.token.address, ERC20ABI, provider) as ERC20
      )
    );
  }

  constructor(
    public poolId: string,
    public balancerPool: BalancerPool,
    public balancerVault: BalancerVault,
    public tokens: ERC20[]
  ) {
    super();
  }

  public async singleSideEntry(
    signer: Signer,
    entryTokenIndex: number,
    entryTokenAmount: BigNumber
  ) {
    const tokensIn = Array(this.tokens.length).fill(BigNumber.from(0));
    tokensIn[entryTokenIndex] = entryTokenAmount;

    return this.multiTokenEntry(signer, tokensIn);
  }

  public async singleSideExit(
    signer: Signer,
    exitTokenIndex: number,
    lpTokenAmount: BigNumber
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

    const balanceBefore = await this.tokens[exitTokenIndex].balanceOf(address);
    const _rcpt = (
      await this.balancerVault
        .connect(signer)
        .exitPool(this.poolId, address, address, {
          assets: this.tokens.map((_) => _.address),
          minAmountsOut: Array(this.tokens.length).fill(0),
          userData,
          toInternalBalance: false,
        })
    ).wait();
    const balanceAfter = await this.tokens[exitTokenIndex].balanceOf(address);

    // TODO: grab these from events
    const feesPaid = Array(this.tokens.length).fill(BigNumber.from(0));

    return { tokensOut: balanceAfter.sub(balanceBefore), feesPaid };
  }

  public async multiTokenEntry(signer: Signer, tokensIn: BigNumber[]) {
    const address = await signer.getAddress();

    const userData = ethers.utils.defaultAbiCoder.encode(
      this.JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT.encoding,
      [this.JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT, tokensIn, 0]
    );

    const balanceBefore = await this.balancerPool.balanceOf(address);
    const _rcpt = (
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

    // TODO: grab these from events
    const feesPaid = Array(this.tokens.length).fill(BigNumber.from(0));

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
    const _rcpt = (
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

    // TODO: grab these from events
    const feesPaid = Array(this.tokens.length).fill(BigNumber.from(0));

    return {
      tokensOut: balancesAfter.map((b, i) => b.sub(balancesBefore[i])),
      feesPaid,
    };
  }

  public async trade(
    signer: Signer,
    tokensInIndex: number,
    tokensOutIndex: number,
    tokensIn: BigNumber
  ) {
    const address = await signer.getAddress();

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
