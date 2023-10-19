import { BigNumber, Signer, ethers, Contract } from 'ethers';
import {
  BalancerPool,
  BalancerStablePoolABI,
  BalancerVault,
  BalancerVaultABI,
  ERC20,
  ERC20ABI,
} from '@notional-finance/contracts';
import { getNowSeconds, Network } from '@notional-finance/util';
import { PoolTestHarness } from './PoolTestHarness';
import { MetaStablePool, ComposableStablePool } from '../../../src/exchanges';
import { TokenBalance } from '../../../src/token-balance';
import { ComposableStablePoolParams } from 'packages/core-entities/src/exchanges/BalancerV2/composable-stable-pool';

export class BalancerV2Harness extends PoolTestHarness<
  MetaStablePool | ComposableStablePool
> {
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

  public balancerVault: BalancerVault;
  public balancerPool: BalancerPool;

  constructor(
    network: Network,
    poolAddress: string,
    provider: ethers.providers.JsonRpcProvider
  ) {
    super(network, poolAddress, provider);

    this.balancerPool = new Contract(
      poolAddress,
      BalancerStablePoolABI,
      provider
    ) as BalancerPool;
    this.balancerVault = new Contract(
      '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      BalancerVaultABI,
      provider
    ) as BalancerVault;
  }

  public tokens() {
    return this.poolInstance.balances.map((t) => {
      return new Contract(t.token.address, ERC20ABI, signer) as ERC20;
    });
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

    const balanceBefore = await this.balanceOf(signer);
    await this.balancerVault
      .connect(signer)
      .exitPool(this.poolInstance.poolParams.poolId, address, address, {
        assets: this.poolInstance.balances.map((_) => _.token.address),
        minAmountsOut: Array(this.poolInstance.balances.length).fill(0),
        userData,
        toInternalBalance: false,
      });
    const balanceAfter = await this.balanceOf(signer);

    const feesPaid = this.poolInstance.zeroTokenArray();

    return {
      tokensOut: balanceAfter.sub(balanceBefore),
      feesPaid,
    };
  }

  public async multiTokenEntry(signer: Signer, tokensIn: TokenBalance[]) {
    const address = await signer.getAddress();

    const userData = ethers.utils.defaultAbiCoder.encode(
      this.JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT.encoding,
      [
        this.JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT.kind,
        tokensIn.filter(
          (_, i) =>
            i !==
            (this.poolInstance.poolParams as ComposableStablePoolParams)
              .bptIndex
        ),
        0,
      ]
    );

    for (const t of this.poolInstance.balances) {
      const erc20 = new Contract(t.token.address, ERC20ABI, signer) as ERC20;
      await erc20.approve(
        this.balancerVault.address,
        ethers.constants.MaxUint256
      );
    }

    const balanceBefore = await this.balanceOf(signer);
    await this.balancerVault
      .connect(signer)
      .joinPool(this.poolInstance.poolParams.poolId, address, address, {
        assets: this.tokens().map((t) => t.address),
        maxAmountsIn: tokensIn.map((t) => t.n),
        userData,
        fromInternalBalance: false,
      });
    const balanceAfter = await this.balanceOf(signer);

    return {
      lpTokens: balanceAfter.sub(balanceBefore),
      feesPaid: this.poolInstance.zeroTokenArray(),
    };
  }

  public async multiTokenExit(
    signer: Signer,
    lpTokenAmount: TokenBalance,
    minTokensOut?: TokenBalance[]
  ) {
    const address = await signer.getAddress();
    const userData = ethers.utils.defaultAbiCoder.encode(
      this.ExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT.encoding,
      [this.ExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT.kind, lpTokenAmount]
    );

    const balancesBefore = await Promise.all(
      this.tokens().map((t) => t.balanceOf(address))
    );
    await this.balancerVault
      .connect(signer)
      .exitPool(this.poolInstance.poolParams.poolId, address, address, {
        assets: this.tokens().map((t) => t.address),
        minAmountsOut: minTokensOut || Array(this.tokens.length).fill(0),
        userData,
        toInternalBalance: false,
      });
    const balancesAfter = await Promise.all(
      this.tokens().map((t) => t.balanceOf(address))
    );

    const feesPaid = this.poolInstance.zeroTokenArray();

    return {
      tokensOut: balancesAfter
        .map((b, i) => b.sub(balancesBefore[i]))
        .map((b, i) => this.poolInstance.balances[i].copy(b)),
      feesPaid,
    };
  }

  public async trade(
    signer: Signer,
    tokensIn: TokenBalance,
    tokensInIndex: number,
    tokensOutIndex: number
  ) {
    const address = await signer.getAddress();
    await this.tokens()
      [tokensInIndex].connect(signer)
      .approve(this.balancerVault.address, ethers.constants.MaxUint256);

    const balanceBefore = await this.tokens()[tokensOutIndex].balanceOf(
      address
    );
    await this.balancerVault.connect(signer).swap(
      {
        poolId: this.poolInstance.poolParams.poolId,
        kind: this.SwapKind.GivenIn,
        assetIn: this.tokens()[tokensInIndex].address,
        assetOut: this.tokens()[tokensOutIndex].address,
        amount: tokensIn.n,
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
    );
    const balanceAfter = await this.tokens()[tokensOutIndex].balanceOf(address);

    // TODO: grab these from events
    const feesPaid = this.poolInstance.zeroTokenArray();

    return {
      tokensOut: this.poolInstance.balances[tokensOutIndex].copy(
        balanceAfter.sub(balanceBefore)
      ),
      feesPaid,
    };
  }
}
