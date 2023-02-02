import TypedBigNumber, { BigNumberType } from '../../../libs/TypedBigNumber';
import {
  LiquidationThreshold,
  LiquidationThresholdType,
} from '../../../libs/types';
import { BigNumber, Contract, ethers, utils } from 'ethers';
import BaseVault from '../../BaseVault';
import VaultAccount from '../../VaultAccount';
import { SecondaryBorrowArray } from '../../../data';

interface InitParams {
  exchangeRate: BigNumber;
}

const simpleStrategyVaultInterface = new utils.Interface([
  'function tokenExchangeRate() view returns (uint256)',
]);

export default class SimpleStrategyVault extends BaseVault<
  Record<string, never>,
  Record<string, never>,
  InitParams
> {
  readonly depositTuple: string = '';

  readonly redeemTuple: string = '';

  public initVaultParams() {
    const contract = new Contract(
      this.vaultAddress,
      simpleStrategyVaultInterface
    );
    return [
      {
        target: contract,
        method: 'tokenExchangeRate',
        args: [],
        key: 'exchangeRate',
      },
    ];
  }

  public getLiquidationThresholds(
    vaultAccount: VaultAccount,
    _blockTime: number
  ): Array<LiquidationThreshold> {
    const { perStrategyTokenValue } =
      this.getLiquidationVaultShareValue(vaultAccount);
    if (!perStrategyTokenValue) return [];

    const currentPrice = TypedBigNumber.fromBalance(
      this.initParams.exchangeRate,
      this.getPrimaryBorrowSymbol(),
      true
    ).toETH(false);
    const ethExchangeRate = perStrategyTokenValue?.toETH(false);

    return [
      {
        name: 'Liquidation Price',
        debtCurrencySymbol: this.getPrimaryBorrowSymbol(),
        collateralCurrencySymbol: 'stETH',
        source: 'Chainlink Oracle',
        currentPrice,
        type: LiquidationThresholdType.exchangeRate,
        ethExchangeRate,
      },
    ];
  }

  private _getStrategyTokenValue(strategyTokens: TypedBigNumber) {
    const value = strategyTokens.scale(
      this.initParams.exchangeRate,
      ethers.constants.WeiPerEther
    );

    return TypedBigNumber.fromBalance(
      value.n,
      this.getPrimaryBorrowSymbol(),
      true
    );
  }

  public getStrategyTokenValue(vaultAccount: VaultAccount) {
    const { strategyTokens } = vaultAccount.getPoolShare();
    return this._getStrategyTokenValue(strategyTokens);
  }

  public getStrategyTokensFromValue(
    maturity: number,
    valuation: TypedBigNumber,
    _blockTime?: number
  ): TypedBigNumber {
    const tokens = valuation.scale(
      ethers.constants.WeiPerEther,
      this.initParams.exchangeRate
    );

    return TypedBigNumber.from(
      tokens.n,
      BigNumberType.StrategyToken,
      this.getVaultSymbol(maturity)
    );
  }

  public async getDepositParametersExact(
    _maturity: number,
    _depositAmount: TypedBigNumber,
    _slippageBuffer: number,
    _blockTime?: number
  ) {
    return {};
  }

  public async getRedeemParametersExact(
    _maturity: number,
    _strategyTokens: TypedBigNumber,
    _slippageBuffer: number,
    _blockTime?: number
  ) {
    return {};
  }

  public getDepositGivenStrategyTokens(
    _maturity: number,
    strategyTokens: TypedBigNumber,
    _blockTime?: number,
    _vaultAccount?: VaultAccount
  ): {
    requiredDeposit: TypedBigNumber;
    secondaryfCashBorrowed: SecondaryBorrowArray;
  } {
    return {
      requiredDeposit: this._getStrategyTokenValue(strategyTokens),
      secondaryfCashBorrowed: undefined,
    };
  }

  public getStrategyTokensGivenDeposit(
    maturity: number,
    depositAmount: TypedBigNumber,
    _blockTime?: number,
    _vaultAccount?: VaultAccount
  ): {
    strategyTokens: TypedBigNumber;
    secondaryfCashBorrowed: SecondaryBorrowArray;
  } {
    return {
      strategyTokens: this.getStrategyTokensFromValue(maturity, depositAmount),
      secondaryfCashBorrowed: undefined,
    };
  }

  public getRedeemGivenStrategyTokens(
    _maturity: number,
    strategyTokens: TypedBigNumber,
    _blockTime?: number,
    _vaultAccount?: VaultAccount
  ): {
    amountRedeemed: TypedBigNumber;
    secondaryfCashRepaid: SecondaryBorrowArray;
  } {
    return {
      amountRedeemed: this._getStrategyTokenValue(strategyTokens),
      secondaryfCashRepaid: undefined,
    };
  }

  public getStrategyTokensGivenRedeem(
    maturity: number,
    redeemAmount: TypedBigNumber,
    _blockTime?: number,
    _vaultAccount?: VaultAccount
  ): {
    strategyTokens: TypedBigNumber;
    secondaryfCashRepaid: SecondaryBorrowArray;
  } {
    return {
      strategyTokens: this.getStrategyTokensFromValue(maturity, redeemAmount),
      secondaryfCashRepaid: undefined,
    };
  }
}
