import { BigNumber, Signer, ethers, Contract } from 'ethers';
import { ZERO_ADDRESS, Network, ALT_ETH } from '@notional-finance/util';
import {
  CurvePoolV2,
  CurvePoolV2ABI,
  ERC20,
  ERC20ABI,
} from '@notional-finance/contracts';
import { PoolTestHarness } from './PoolTestHarness';
import { Curve2TokenPoolV2 } from '../../../src/exchanges/index';
import { TokenBalance } from '../../../src/token-balance';

export class CurveV2Harness extends PoolTestHarness<Curve2TokenPoolV2> {
  public curvePool: CurvePoolV2;

  constructor(
    network: Network,
    poolAddress: string,
    provider: ethers.providers.JsonRpcProvider
  ) {
    super(network, poolAddress, provider);

    this.curvePool = new Contract(
      poolAddress,
      CurvePoolV2ABI,
      provider
    ) as CurvePoolV2;
  }

  public tokens() {
    return this.poolInstance.balances.map((t) => {
      return new Contract(t.token.address, ERC20ABI, signer) as ERC20;
    });
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
    const balanceBefore = await this.balanceOfToken(exitTokenIndex, signer);
    await this.curvePool
      .connect(signer)
      ['remove_liquidity_one_coin(uint256,uint256,uint256)'](
        lpTokenAmount.n,
        exitTokenIndex,
        0,
        {
          gasLimit: 2_500_000,
        }
      );
    const balanceAfter = await this.balanceOfToken(exitTokenIndex, signer);

    const feesPaid = this.poolInstance.zeroTokenArray();
    return {
      tokensOut: balanceAfter.sub(balanceBefore),
      feesPaid,
    };
  }

  public async multiTokenEntry(signer: Signer, tokensIn: TokenBalance[]) {
    for (const t of this.poolInstance.balances) {
      if (t.token.address !== ZERO_ADDRESS) {
        const erc20 = new Contract(t.token.address, ERC20ABI, signer) as ERC20;
        await erc20.approve(
          this.curvePool.address,
          ethers.constants.MaxUint256
        );
      }
    }

    const balanceBefore = await this.balanceOf(signer);
    let msgValue = BigNumber.from(0);
    if (tokensIn[0].token.address === ZERO_ADDRESS) {
      msgValue = tokensIn[0].n;
    } else if (tokensIn[1].token.address === ZERO_ADDRESS) {
      msgValue = tokensIn[1].n;
    }

    await this.curvePool
      .connect(signer)
      ['add_liquidity(uint256[2],uint256,bool)'](
        [tokensIn[0].n, tokensIn[1].n],
        0,
        msgValue.gt(0), // useETH
        {
          gasLimit: 2_500_000,
          value: msgValue,
        }
      );
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
    let useEth = false;
    if (this.poolInstance.balances[0].token.address === ZERO_ADDRESS) {
      useEth = true;
    } else if (this.poolInstance.balances[1].token.address === ZERO_ADDRESS) {
      useEth = true;
    }

    const balancesBefore = await Promise.all(
      this.tokens().map((_, i) => this.balanceOfToken(i, signer))
    );
    await this.curvePool
      .connect(signer)
      ['remove_liquidity(uint256,uint256[2],bool)'](
        lpTokenAmount.n,
        [
          minTokensOut ? minTokensOut[0].n : 0,
          minTokensOut ? minTokensOut[1].n : 0,
        ],
        useEth,
        { gasLimit: 2_500_000 }
      );

    const balancesAfter = await Promise.all(
      this.tokens().map((_, i) => this.balanceOfToken(i, signer))
    );

    const feesPaid = this.poolInstance.zeroTokenArray();

    return {
      tokensOut: balancesAfter.map((b, i) => b.sub(balancesBefore[i])),
      feesPaid,
    };
  }

  public async trade(
    signer: Signer,
    tokensIn: TokenBalance,
    tokensInIndex: number,
    tokensOutIndex: number
  ) {
    let msgValue = BigNumber.from(0);
    if (tokensIn.token.address === ZERO_ADDRESS) {
      msgValue = tokensIn.n;
    } else {
      await this.tokens()
        [tokensInIndex].connect(signer)
        .approve(this.curvePool.address, ethers.constants.MaxUint256);
    }

    const balanceBefore = await this.balanceOfToken(tokensOutIndex, signer);
    await this.curvePool
      .connect(signer)
      ['exchange(uint256,uint256,uint256,uint256,bool)'](
        tokensInIndex,
        tokensOutIndex,
        tokensIn.n,
        0,
        msgValue.gt(0), // useETH
        {
          gasLimit: 2_500_000,
          value: msgValue,
        }
      );
    const balanceAfter = await this.balanceOfToken(tokensOutIndex, signer);

    // TODO: grab these from events
    const feesPaid = this.poolInstance.zeroTokenArray();

    return {
      tokensOut: balanceAfter.sub(balanceBefore),
      feesPaid,
    };
  }
}
