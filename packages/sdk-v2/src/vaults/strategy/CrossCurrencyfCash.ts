import { BigNumber, Contract, utils } from 'ethers';
import TypedBigNumber, { BigNumberType } from '../../libs/TypedBigNumber';
import BaseVault, { LiquidationThreshold, LiquidationThresholdType } from '../BaseVault';
import VaultAccount from '../VaultAccount';
import { CashGroup, Market, System } from '../../system';
import { getNowSeconds } from '../../libs/utils';
import TradeHandler, { DexId } from '../../trading/TradeHandler';
import { INTERNAL_TOKEN_PRECISION, RATE_PRECISION } from '../../config/constants';

interface DepositParams {
  minPurchaseAmount: BigNumber;
  minLendRate: number;
  dexId: number;
  exchangeData: string;
}

interface RedeemParams {
  minPurchaseAmount: BigNumber;
  maxBorrowRate: number;
  dexId: number;
  exchangeData: string;
}

const crossCurrencyInterface = new utils.Interface(['function LEND_CURRENCY_ID() view returns (uint16)']);

export default class CrossCurrencyfCash extends BaseVault<DepositParams, RedeemParams> {
  protected _lendCurrencyId: number;

  readonly depositTuple: string =
    'tuple(uint256 minPurchaseAmount, uint32 minLendRate, uint16 dexId, bytes exchangeData) d';

  readonly redeemTuple: string =
    'tuple(uint256 minPurchaseAmount, uint32 maxBorrowRate, uint16 dexId, bytes exchangeData) r';

  constructor(vaultAddress: string) {
    super(vaultAddress);
    this._lendCurrencyId = 0;
  }

  public async initializeVault(): Promise<void> {
    const provider = System.getSystem().batchProvider;
    const contract = new Contract(this.vaultAddress, crossCurrencyInterface, provider);
    this._lendCurrencyId = await contract.LEND_CURRENCY_ID();
  }

  public get lendCurrencyId() {
    return this._lendCurrencyId;
  }

  public getLendMarket(maturity: number) {
    const marketIndex = CashGroup.getMarketIndexForMaturity(maturity);
    return System.getSystem().getCashGroup(this.lendCurrencyId).getMarket(marketIndex);
  }

  private strategyTokensTofCash(strategyTokens: TypedBigNumber) {
    const symbol = System.getSystem().getUnderlyingSymbol(this.lendCurrencyId);
    return TypedBigNumber.fromBalance(strategyTokens.n, symbol, true);
  }

  private fCashToStrategyTokens(fCash: TypedBigNumber, maturity: number) {
    if (!fCash.isInternalPrecision()) throw Error('Must be internal precision');
    if (fCash.isNegative()) throw Error('Must be positive');
    return TypedBigNumber.from(fCash.n, BigNumberType.StrategyToken, this.getVaultSymbol(maturity));
  }

  public getStrategyTokenValue(vaultAccount: VaultAccount, blockTime = getNowSeconds()) {
    const vault = this.getVault();
    const { strategyTokens } = vaultAccount.getPoolShare();
    const strategyTokensAsfCash = this.strategyTokensTofCash(strategyTokens);
    const fCashPV = System.getSystem()
      .getCashGroup(this.lendCurrencyId)
      .getfCashPresentValueUnderlyingInternal(vaultAccount.maturity, strategyTokensAsfCash, true, blockTime);

    return fCashPV.toETH(false).fromETH(vault.primaryBorrowCurrency, false);
  }

  public getStrategyTokensFromValue(maturity: number, valuation: TypedBigNumber, blockTime = getNowSeconds()) {
    const vault = this.getVault();
    valuation.check(
      BigNumberType.InternalUnderlying,
      System.getSystem().getUnderlyingSymbol(vault.primaryBorrowCurrency)
    );
    const lendCurrencyPV = valuation.toETH(false).fromETH(this.lendCurrencyId, false);
    const riskAdjustedOracleRate = System.getSystem()
      .getCashGroup(this.lendCurrencyId)
      .getRiskAdjustedOracleRate(maturity, false, blockTime);

    const lendCurrencyfCash = Market.fCashFromExchangeRate(
      Market.interestToExchangeRate(riskAdjustedOracleRate, blockTime, maturity),
      lendCurrencyPV.toInternalPrecision()
    );

    return this.fCashToStrategyTokens(lendCurrencyfCash, maturity);
  }

  public getLiquidationThresholds(
    vaultAccount: VaultAccount,
    blockTime = getNowSeconds()
  ): Array<LiquidationThreshold> {
    const thresholds = new Array<LiquidationThreshold>();
    const { perShareValue } = this.getLiquidationVaultShareValue(vaultAccount);
    const lendCurrencySymbol = System.getSystem().getUnderlyingSymbol(this.lendCurrencyId);
    const riskAdjustedExchangeRate = Market.interestToExchangeRate(
      System.getSystem()
        .getCashGroup(this.lendCurrencyId)
        .getRiskAdjustedOracleRate(vaultAccount.maturity, false, blockTime),
      blockTime,
      vaultAccount.maturity
    );

    thresholds.push({
      name: 'Exchange Rate',
      type: LiquidationThresholdType.exchangeRate,
      rate: 0,
      ethExchangeRate: perShareValue.scale(riskAdjustedExchangeRate, RATE_PRECISION).toETH(false),
      debtCurrencyId: this.getVault().primaryBorrowCurrency,
      collateralCurrencyId: this.lendCurrencyId,
    });

    const perShareValueInLendCurrency = perShareValue.toETH(false).fromETH(this.lendCurrencyId, false);
    const liquidationExchangeRate = Market.exchangeRate(
      TypedBigNumber.from(INTERNAL_TOKEN_PRECISION, BigNumberType.InternalUnderlying, lendCurrencySymbol),
      perShareValueInLendCurrency
    );

    const liquidationInterestRate = Market.exchangeToInterestRate(
      liquidationExchangeRate,
      blockTime,
      vaultAccount.maturity
    );

    const maxInterestRate = this.getVaultMarket(vaultAccount.maturity).maxInterestRate();
    if (liquidationInterestRate <= maxInterestRate) {
      // Only show the liquidation rate if it is less than the market
      thresholds.push({
        name: 'Interest Rate',
        type: LiquidationThresholdType.fCashInterestRate,
        rate: liquidationInterestRate,
        collateralCurrencyId: this.lendCurrencyId,
      });
    }

    return thresholds;
  }

  public async getDepositParametersExact(
    maturity: number,
    depositAmount: TypedBigNumber,
    slippageBuffer: number,
    blockTime = getNowSeconds()
  ) {
    const { buyAmount, minPurchaseAmount, data } = await TradeHandler.getExactTrade(
      System.getSystem().getUnderlyingSymbol(this.lendCurrencyId),
      depositAmount.symbol,
      depositAmount.toUnderlying(false)
    );
    // get lendRate based on optimalPurchaseAmount, apply slippage buffer
    const lendfCash = this.getLendMarket(maturity).getfCashAmountGivenCashAmount(
      buyAmount.toInternalPrecision().neg(),
      blockTime
    );

    const { annualizedRate: minLendRate } = Market.getSlippageRate(
      lendfCash,
      buyAmount.toInternalPrecision(),
      maturity,
      -slippageBuffer * RATE_PRECISION,
      blockTime
    );

    return {
      minPurchaseAmount,
      minLendRate,
      dexId: DexId.ZERO_EX,
      exchangeData: data,
    };
  }

  public async getRedeemParametersExact(
    maturity: number,
    strategyTokens: TypedBigNumber,
    slippageBuffer: number,
    blockTime = getNowSeconds()
  ) {
    if (maturity < blockTime) {
      if (!strategyTokens.isZero()) throw Error('Vault not settled');

      // No strategy tokens left past maturity for this vault
      return {
        minPurchaseAmount: BigNumber.from(0),
        maxBorrowRate: 0,
        dexId: 0,
        exchangeData: '0x',
      };
    }

    const market = this.getLendMarket(maturity);
    const lendfCash = this.strategyTokensTofCash(strategyTokens);
    const { netCashToAccount } = market.getCashAmountGivenfCashAmount(lendfCash.neg(), blockTime);
    const primaryBorrowSymbol = System.getSystem().getUnderlyingSymbol(this.getVault().primaryBorrowCurrency);
    const { minPurchaseAmount, data } = await TradeHandler.getExactTrade(
      primaryBorrowSymbol,
      netCashToAccount.symbol,
      netCashToAccount.toUnderlying(false)
    );

    const { annualizedRate: maxBorrowRate } = Market.getSlippageRate(
      lendfCash,
      netCashToAccount,
      market.maturity,
      slippageBuffer * RATE_PRECISION,
      blockTime
    );

    return {
      minPurchaseAmount,
      maxBorrowRate,
      dexId: DexId.ZERO_EX,
      exchangeData: data,
    };
  }

  private _getDepositParameters(
    maturity: number,
    depositAmount: TypedBigNumber,
    slippageBuffer: number,
    blockTime = getNowSeconds()
  ) {
    const { buyEstimate, minPurchaseAmount } = TradeHandler.getBuyEstimate(
      System.getSystem().getUnderlyingSymbol(this.lendCurrencyId),
      depositAmount.toUnderlying(false),
      slippageBuffer
    );
    // get lendRate based on optimalPurchaseAmount, apply slippage buffer
    const lendfCash = this.getLendMarket(maturity).getfCashAmountGivenCashAmount(
      buyEstimate.toInternalPrecision().neg(),
      blockTime
    );

    const { annualizedRate: minLendRate } = Market.getSlippageRate(
      lendfCash,
      buyEstimate.toInternalPrecision(),
      maturity,
      -slippageBuffer * RATE_PRECISION,
      blockTime
    );
    // TODO: is this simpler if we just calculate min strategy tokens?

    return {
      depositParams: {
        minPurchaseAmount: minPurchaseAmount.n,
        minLendRate,
        dexId: 0,
        exchangeData: '0x',
      },
      buyEstimate,
    };
  }

  public getDepositParameters(
    maturity: number,
    depositAmount: TypedBigNumber,
    slippageBuffer: number,
    blockTime = getNowSeconds()
  ) {
    const { depositParams } = this._getDepositParameters(maturity, depositAmount, slippageBuffer, blockTime);
    return depositParams;
  }

  private _getRedeemParameters(
    maturity: number,
    strategyTokens: TypedBigNumber,
    slippageBuffer: number,
    blockTime = getNowSeconds()
  ) {
    if (maturity < blockTime) {
      if (!strategyTokens.isZero()) throw Error('Vault not settled');

      // No strategy tokens left past maturity for this vault
      return {
        redeemParams: {
          minPurchaseAmount: BigNumber.from(0),
          maxBorrowRate: 0,
          dexId: 0,
          exchangeData: '0x',
        },
        buyEstimate: TypedBigNumber.fromBalance(0, 'DAI', true),
      };
    }

    const market = this.getLendMarket(maturity);
    const lendfCash = this.strategyTokensTofCash(strategyTokens);
    const { netCashToAccount } = market.getCashAmountGivenfCashAmount(lendfCash.neg(), blockTime);
    const primaryBorrowSymbol = System.getSystem().getUnderlyingSymbol(this.getVault().primaryBorrowCurrency);
    const { buyEstimate, minPurchaseAmount } = TradeHandler.getBuyEstimate(
      primaryBorrowSymbol,
      netCashToAccount.toUnderlying(false),
      slippageBuffer
    );

    const { annualizedRate: maxBorrowRate } = Market.getSlippageRate(
      lendfCash,
      netCashToAccount,
      market.maturity,
      slippageBuffer * RATE_PRECISION,
      blockTime
    );

    return {
      redeemParams: {
        minPurchaseAmount: minPurchaseAmount.n,
        maxBorrowRate,
        dexId: 0,
        exchangeData: '0x',
      },
      buyEstimate,
    };
  }

  public getRedeemParameters(
    maturity: number,
    strategyTokens: TypedBigNumber,
    slippageBuffer: number,
    blockTime = getNowSeconds()
  ) {
    const { redeemParams } = this._getRedeemParameters(maturity, strategyTokens, slippageBuffer, blockTime);
    return redeemParams;
  }

  public getSlippageForDeposit(
    maturity: number,
    depositAmount: TypedBigNumber,
    strategyTokens: TypedBigNumber,
    params: DepositParams,
    blockTime = getNowSeconds()
  ) {
    const market = this.getLendMarket(maturity);

    // No Slippage Value:
    //   getCashFutureValue(fx(cashFromBorrow => lendCurrency) @ oracleRate)
    const idealTrade = TradeHandler.getIdealOutGivenIn(this.lendCurrencyId, depositAmount.toExternalPrecision());
    const idealfCash = Market.fCashFromExchangeRate(
      market.marketExchangeRate(blockTime),
      idealTrade.toInternalPrecision()
    );

    // Likely Slippage Value:
    const likelyfCash = this.strategyTokensTofCash(strategyTokens);

    // Worse Case Value:
    //   getCashFutureValue(minPurchaseAmount @ minLendRate)
    const worstCasefCash = Market.fCashFromExchangeRate(
      Market.interestToExchangeRate(params.minLendRate, blockTime, maturity),
      idealTrade.copy(params.minPurchaseAmount).toInternalPrecision()
    );

    // End to End Slippage = (noSlippage - worstCase) / noSlippage
    return {
      likelySlippage: idealfCash.sub(likelyfCash).scale(RATE_PRECISION, idealfCash).toNumber(),
      worstCaseSlippage: idealfCash.sub(worstCasefCash).scale(RATE_PRECISION, idealfCash).toNumber(),
    };
  }

  public getSlippageForRedeem(
    maturity: number,
    redeemAmount: TypedBigNumber,
    strategyTokens: TypedBigNumber,
    params: RedeemParams,
    blockTime = getNowSeconds()
  ) {
    const vault = this.getVault();
    const market = this.getLendMarket(maturity);
    const lendfCash = this.strategyTokensTofCash(strategyTokens);

    // No Slippage Value:
    //   fx(getPV(strategyTokens @ oracleRate) => primaryBorrow)
    const idealCash = Market.cashFromExchangeRate(market.marketExchangeRate(blockTime), lendfCash);
    const idealTrade = TradeHandler.getIdealOutGivenIn(vault.primaryBorrowCurrency, idealCash.toExternalPrecision());

    // Worse Case Value:
    //   minPurchaseAmount

    // End to End Slippage = (noSlippage - worstCase) / noSlippage
    const minPurchaseAmount = idealTrade.copy(params.minPurchaseAmount);
    return {
      likelySlippage: idealTrade.sub(redeemAmount.toExternalPrecision()).scale(RATE_PRECISION, idealTrade).toNumber(),
      worstCaseSlippage: idealTrade.sub(minPurchaseAmount).scale(RATE_PRECISION, idealTrade).toNumber(),
    };
  }

  public getStrategyTokensGivenDeposit(
    maturity: number,
    depositAmount: TypedBigNumber,
    slippageBuffer: number,
    blockTime?: number
  ) {
    const { buyEstimate, depositParams } = this._getDepositParameters(
      maturity,
      depositAmount,
      slippageBuffer,
      blockTime
    );
    const lendfCash = this.getLendMarket(maturity).getfCashAmountGivenCashAmount(
      buyEstimate.toInternalPrecision().neg(),
      blockTime
    );

    return {
      strategyTokens: this.fCashToStrategyTokens(lendfCash, maturity),
      secondaryfCashBorrowed: undefined,
      depositParams,
    };
  }

  public getRedeemGivenStrategyTokens(
    maturity: number,
    strategyTokens: TypedBigNumber,
    slippageBuffer: number,
    blockTime?: number
  ) {
    const { buyEstimate, redeemParams } = this._getRedeemParameters(
      maturity,
      strategyTokens,
      slippageBuffer,
      blockTime
    );
    if (!buyEstimate) throw Error('Unable to estimate trade');

    return {
      amountRedeemed: buyEstimate,
      secondaryfCashRepaid: undefined,
      redeemParams,
    };
  }

  public getDepositGivenStrategyTokens(
    maturity: number,
    strategyTokens: TypedBigNumber,
    slippageBuffer: number,
    blockTime = getNowSeconds()
  ) {
    const market = this.getLendMarket(maturity);
    const fCash = this.strategyTokensTofCash(strategyTokens);
    const { netCashToAccount } = market.getCashAmountGivenfCashAmount(fCash, blockTime);

    const { annualizedRate: minLendRate } = Market.getSlippageRate(
      fCash,
      netCashToAccount.neg(),
      market.maturity,
      -slippageBuffer * RATE_PRECISION,
      blockTime
    );
    const primaryBorrowSymbol = System.getSystem().getUnderlyingSymbol(this.getVault().primaryBorrowCurrency);

    const { sellEstimate: requiredDeposit } = TradeHandler.getSellEstimate(
      primaryBorrowSymbol,
      netCashToAccount.toExternalPrecision().neg()
    );
    const minPurchaseAmount = TradeHandler.applySlippage(
      netCashToAccount.toExternalPrecision().neg(),
      -slippageBuffer
    ).n;

    return {
      requiredDeposit: requiredDeposit.toInternalPrecision(),
      secondaryfCashBorrowed: undefined,
      depositParams: {
        minLendRate,
        minPurchaseAmount,
        dexId: 0,
        exchangeData: '0x',
      },
    };
  }

  public getStrategyTokensGivenRedeem(
    maturity: number,
    redeemAmount: TypedBigNumber,
    slippageBuffer: number,
    blockTime?: number
  ) {
    const market = this.getLendMarket(maturity);
    const { sellEstimate } = TradeHandler.getSellEstimate(
      System.getSystem().getUnderlyingSymbol(this.lendCurrencyId),
      redeemAmount.toExternalPrecision()
    );
    const lendfCash = market.getfCashAmountGivenCashAmount(sellEstimate.toInternalPrecision(), blockTime);
    const { annualizedRate: maxBorrowRate } = Market.getSlippageRate(
      lendfCash,
      sellEstimate.toInternalPrecision(),
      maturity,
      slippageBuffer * RATE_PRECISION,
      blockTime
    );

    const minPurchaseAmount = TradeHandler.applySlippage(redeemAmount.toExternalPrecision(), -slippageBuffer).n;
    return {
      strategyTokens: this.fCashToStrategyTokens(lendfCash.neg(), maturity),
      secondaryfCashRepaid: undefined,
      redeemParams: {
        minPurchaseAmount,
        maxBorrowRate,
        dexId: 0,
        exchangeData: '0x',
      },
    };
  }
}
