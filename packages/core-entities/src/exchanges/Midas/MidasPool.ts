import { BigNumber, Contract, ethers } from 'ethers';
import BaseLiquidityPool from '../base-liquidity-pool';
import { TokenBalance } from '../../token-balance';
import { Network, SCALAR_PRECISION } from '@notional-finance/util';
import { AggregateCall } from '@notional-finance/multicall';

interface MidasPoolParams {
  depositVault: string;
  redeemVault: string;
  instantRedeemFee: BigNumber;
  instantDepositFee: BigNumber;
}

const MidasVaultABI = new ethers.utils.Interface([
  'function instantFee() view external returns (uint256)',
]);
const MidasWithdrawManagerABI = new ethers.utils.Interface([
  'function depositVault() view external returns (address)',
  'function redeemVault() view external returns (address)',
  'function YIELD_TOKEN() view external returns (address)',
  'function STAKING_TOKEN() view external returns (address)',
]);

export class MidasPool extends BaseLiquidityPool<MidasPoolParams> {
  public static override getInitData(
    network: Network,
    poolAddress: string
  ): AggregateCall[] {
    const pool = new Contract(poolAddress, MidasWithdrawManagerABI);
    return [
      {
        stage: 0,
        target: pool,
        method: 'depositVault',
        key: 'depositVault',
        args: [],
      },
      {
        stage: 0,
        target: pool,
        method: 'redeemVault',
        key: 'redeemVault',
        args: [],
      },
      {
        stage: 0,
        target: pool,
        method: 'YIELD_TOKEN',
        key: 'yieldToken',
        args: [],
      },
      {
        stage: 0,
        target: pool,
        method: 'STAKING_TOKEN',
        key: 'stakingToken',
        args: [],
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(
            r[`${poolAddress}.redeemVault`] as string,
            MidasVaultABI
          ),
        method: 'instantFee',
        key: 'instantRedeemFee',
        args: [],
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(
            r[`${poolAddress}.depositVault`] as string,
            MidasVaultABI
          ),
        method: 'instantFee',
        key: 'instantDepositFee',
        args: [],
      },
      {
        stage: 1,
        target: 'NO_OP',
        method: 'NO_OP',
        key: 'balances',
        args: [],
        transform: (_, prevResults) => {
          return [
            TokenBalance.toJSON(
              BigNumber.from(0),
              prevResults[`${poolAddress}.stakingToken`] as string,
              network
            ),
            TokenBalance.toJSON(
              BigNumber.from(0),
              prevResults[`${poolAddress}.yieldToken`] as string,
              network
            ),
          ];
        },
      },
      {
        stage: 1,
        target: 'NO_OP',
        method: 'NO_OP',
        key: 'totalSupply',
        args: [],
        transform: (_, prevResults) => {
          return TokenBalance.toJSON(
            BigNumber.from(0),
            prevResults[`${poolAddress}.yieldToken`] as string,
            network
          );
        },
      },
    ];
  }

  public override calculateTokenTrade(
    tokensIn: TokenBalance,
    tokenIndexOut: number,
    _balanceOverrides?: TokenBalance[]
  ): { tokensOut: TokenBalance; feesPaid: TokenBalance[] } {
    if (tokenIndexOut === 0) {
      // This is the staking token, apply the instant redeem fee
      const tokensOutPreFee = tokensIn.toToken(this.balances[0].token);
      const feesPaid = tokensOutPreFee.scale(
        this.poolParams.instantRedeemFee,
        10000
      );
      return {
        tokensOut: tokensOutPreFee.sub(feesPaid),
        feesPaid: [feesPaid],
      };
    } else if (tokenIndexOut === 1) {
      // This is the yield token, apply the deposit fee
      const feesPaid = tokensIn.scale(this.poolParams.instantDepositFee, 10000);
      const tokensOut = tokensIn.sub(feesPaid).toToken(this.balances[1].token);
      return {
        tokensOut: tokensOut,
        feesPaid: [feesPaid],
      };
    } else {
      throw new Error('Invalid token index');
    }
  }
  public override getLPTokensGivenTokens(_tokensIn: TokenBalance[]): {
    lpTokens: TokenBalance;
    feesPaid: TokenBalance[];
    lpClaims: TokenBalance[];
  } {
    throw new Error('Method not implemented.');
  }
  public override getTokensOutGivenLPTokens(
    _lpTokens: TokenBalance,
    _singleSidedExitTokenIndex?: number
  ): { tokensOut: TokenBalance[]; feesPaid: TokenBalance[] } {
    throw new Error('Method not implemented.');
  }
}
