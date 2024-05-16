import {
  BalancerPoolABI,
  BalancerVault,
  BalancerVaultABI,
  ERC20ABI,
  SNOTEABI,
  SNOTE,
} from '@notional-finance/contracts';
import { AggregateCall, NO_OP } from '@notional-finance/multicall';
import { Contract, BigNumber } from 'ethers';
import FixedPoint from './fixed-point';
import WeightedPool, { PoolParams } from './weighted-pool';
import {
  Network,
  SECONDS_IN_DAY,
  getNowSeconds,
  getProviderFromNetwork,
} from '@notional-finance/util';
import { TokenBalance } from '../../token-balance';
import { Registry } from '../../Registry';

interface SNOTEParams extends PoolParams {
  totalBPTHeld: TokenBalance;
  coolDownTimeInSeconds: number;
  totalSNOTESupply: TokenBalance;
}

export default class SNOTEWeightedPool extends WeightedPool<SNOTEParams> {
  public static sNOTE = '0x38de42f4ba8a35056b33a746a6b45be9b1c3b9d2';
  public static sNOTE_Pool = '0x5122e01d819e58bb2e22528c0d68d310f0aa6fd7';
  public static sNOTE_Gauge = '0x09afec27f5a6201617aad014ceea8deb572b0608';
  public static sNOTE_Pool_Id =
    '0x5122e01d819e58bb2e22528c0d68d310f0aa6fd7000200000000000000000163';
  public static sNOTE_Contract = new Contract(this.sNOTE, SNOTEABI) as SNOTE;
  public redeemWindowSeconds = 3 * SECONDS_IN_DAY;
  public NOTE_INDEX = 1;

  public static override getInitData(
    network: Network,
    poolAddress: string
  ): AggregateCall[] {
    const pool = new Contract(poolAddress, BalancerPoolABI);
    const sNOTE_Gauge_Contract = new Contract(this.sNOTE_Gauge, ERC20ABI);

    return [
      {
        stage: 0,
        target: pool,
        method: 'getSwapFeePercentage',
        key: 'swapFeePercentage',
        args: [],
        transform: (r: BigNumber) => FixedPoint.from(r),
      },
      {
        stage: 0,
        target: NO_OP,
        method: NO_OP,
        key: 'poolId',
        transform: () => this.sNOTE_Pool_Id,
      },
      {
        stage: 0,
        target: pool,
        method: 'getVault',
        key: 'vaultAddress',
      },
      {
        stage: 0,
        target: NO_OP,
        method: NO_OP,
        key: 'normalizedWeights',
        transform: () => [
          FixedPoint.from(BigNumber.from(10).pow(17).mul(2)),
          FixedPoint.from(BigNumber.from(10).pow(17).mul(8)),
        ],
      },
      {
        stage: 0,
        target: NO_OP,
        method: NO_OP,
        key: 'scalingFactors',
        transform: () => [
          FixedPoint.from(BigNumber.from(10).pow(18)),
          FixedPoint.from(BigNumber.from(10).pow(28)),
        ],
      },
      {
        stage: 0,
        target: NO_OP,
        method: NO_OP,
        key: 'lastPostJoinExitInvariant',
        transform: () => undefined,
      },
      {
        stage: 0,
        target: pool,
        method: 'totalSupply',
        key: 'totalSupply',
        args: [],
        transform: (r: BigNumber) => {
          return TokenBalance.toJSON(r, poolAddress, network);
        },
      },
      {
        stage: 0,
        target: new Contract(
          '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
          BalancerVaultABI
        ),
        method: 'getPoolTokens',
        args: [this.sNOTE_Pool_Id],
        key: 'balances',
        transform: (
          r: Awaited<ReturnType<BalancerVault['functions']['getPoolTokens']>>
        ) =>
          r.balances.map((b, i) =>
            TokenBalance.toJSON(b, r.tokens[i], network)
          ),
      },
      {
        stage: 0,
        target: this.sNOTE_Contract,
        method: 'totalSupply',
        key: 'totalSNOTESupply',
        transform: (r) => TokenBalance.toJSON(r, this.sNOTE, Network.mainnet),
      },
      {
        stage: 0,
        target: this.sNOTE_Contract,
        method: 'coolDownTimeInSeconds',
        key: 'coolDownTimeInSeconds',
      },
      {
        stage: 0,
        // All BPTs are held in the gauge
        target: sNOTE_Gauge_Contract,
        method: 'balanceOf',
        args: [this.sNOTE],
        key: 'totalBPTHeld',
        transform: (r) =>
          TokenBalance.toJSON(r, this.sNOTE_Pool, Network.mainnet),
      },
    ];
  }

  get sNOTE() {
    return Registry.getTokenRegistry().getTokenBySymbol(
      Network.mainnet,
      'sNOTE'
    );
  }

  get totalSNOTE() {
    return this.poolParams.totalSNOTESupply;
  }

  getCurrentSNOTEPrice() {
    const { ethClaim, noteClaim } = this.getCurrentSNOTEClaims(
      TokenBalance.unit(this.sNOTE)
    );
    return ethClaim.add(noteClaim.toToken(ethClaim.token));
  }

  getCurrentSNOTEClaims(snote: TokenBalance) {
    const bptClaim = this.poolParams.totalBPTHeld.scale(
      snote,
      this.poolParams.totalSNOTESupply
    );
    const [ethClaim, noteClaim] = this.getLPTokenClaims(bptClaim);
    return { ethClaim, noteClaim };
  }

  getSNOTEForBPT(lpTokens: TokenBalance) {
    return this.totalSNOTE.scale(lpTokens, this.poolParams.totalBPTHeld);
  }

  getBPTForSNOTE(snote: TokenBalance) {
    return this.poolParams.totalBPTHeld.scale(snote, this.totalSNOTE);
  }

  async getCoolDownStatus(account: string) {
    const redeemWindowBegin = (
      await SNOTEWeightedPool.sNOTE_Contract
        .connect(getProviderFromNetwork(Network.mainnet))
        .accountRedeemWindowBegin(account)
    ).toNumber();
    const redeemWindowEnd = redeemWindowBegin + this.redeemWindowSeconds;
    const inCoolDown = getNowSeconds() < redeemWindowBegin;
    const inRedeemWindow =
      redeemWindowBegin <= getNowSeconds() && getNowSeconds() < redeemWindowEnd;

    return {
      inCoolDown,
      inRedeemWindow,
      redeemWindowBegin,
      redeemWindowEnd,
    };
  }
}
