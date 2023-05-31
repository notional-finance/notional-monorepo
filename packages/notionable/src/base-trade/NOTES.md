
```
export interface CashGroupData {
  totalValueLocked: TokenBalance;
  nTokenFactors: {
    totalYield: number;
    blendedYield: number;
    incentiveYield: number;
    tradingFeeYield: number;
    totalSupply: TokenBalance;
    nTokenPrice: TokenBalance;
    nTokenHolders: number;
    returnDrivers: {
      token: TokenDefinition;
      value: TokenBalance;
      apy: number;
    }[];
  };
  fCashFactors: {
    marketIndex: number;
    maturity: number;
    spotRate: number;
    tradedRate: number;
    totalDebtOutstanding: TokenBalance;
    token: TokenDefinition;
    totalPrimeCash: TokenBalance;
    totalfCash: TokenBalance;
    utilization: number;
  }[];
  primeCashFactors: {
    totalLent: TokenBalance;
    oraclePrice: TokenBalance;
    supplyYield: number;
    debtRate: number;
    lendingPremium: number;
    utilization: number;
    // interestRateParameters: {};
    // primeCashHoldings: {};
  }[];
  historical: {
    fCashRates: [];
    nTokenYield: [];
    nTokenPrice: [];
    totalValueLocked: [];
    poolActivity: [];
  };
}
```

/// How much to deposit or withdraw
/// How much collateral i want [Buy Prime Cash, Buy nTokens, Buy fCash]
/// How much (if any) I want to debt [Sell Prime Cash, Sell fCash, Sell nTokens]
/// Specify your risk tolerance
///  - leverage ratio?
///  - liquidation price?
///  - max collateral ratio
///  - max ltv
/*
 *        - Calculate Deposit given Asset
 *        - Calculate Asset given Deposit
 *        - Calculate Borrow given Asset
 *        - Calculate Asset given Borrow
 *        - Calculate Neg Deposit given Borrow
 *        - Calculate Borrow given Neg Deposit
 *
 *        - Calculate Deposit given Asset + Borrow
 *        - Calculate Asset given Deposit + Borrow
 *        - Calculate Borrow given Deposit + Asset
 *
 *        - Calculate Deposit + Borrow given Asset + Risk Limit
 *        - Calculate Deposit + Asset given Borrow + Risk Limit
 *        - Calculate Borrow + Asset given Deposit + Risk Limit
 */

/**
 * [Local Currency]
 * - Lend Variable
 * - Lend Variable with Fixed Borrow (Fixed to Variable Swap)
 * - Lend Fixed
 *      [Deposit: Underlying, Asset: fCash | Prime Cash, Borrow: fCash | Undefined]
 *
 * - Borrow Variable with Lend Variable (Variable to Fixed Swap)
 * - Borrow Fixed with Lend Fixed (Roll Maturity if Same Maturity, Carry Trade if Not)
 *      [Deposit: Underlying | Undefined, Asset: fCash, Borrow: fCash | Prime Debt]
 *
 * - Borrow Fixed (Deleverage Variable to Fixed Swap)
 * - Borrow Variable (Withdraw)
 *      [Deposit: Neg Underlying | Undefined, Asset: Prime Cash, Borrow: Prime Debt | fCash]
 *
 * - Mint nToken
 * - Mint nToken with Borrow Variable (nToken Leverage)
 * - Mint nToken with Borrow Fixed (nToken Leverage)
 *      [Deposit[U]: Underlying | Undefined, Asset[U/T]: nToken, Borrow[U/T]: Prime Debt | fCash | Undefined]
 *
 * - Redeem nToken with Lend Variable (nToken Deleverage)
 * - Redeem nToken with Lend Fixed (nToken Deleverage)
 * - Redeem nToken with Lend Fixed (Deleverage Cross Currency nToken)
 *      [Deposit: Undefined, Asset[U/T]: Prime Cash | fCash, Borrow[U/T]: Neg nToken]
 *
 * - Borrow Fixed with Lend Variable
 * - Borrow Fixed with Lend Fixed
 * - Borrow Fixed with nToken Mint
 *      [Deposit[U]: Underlying | Undefined, Asset[U/T]: Prime Cash | fCash | nToken, Borrow[U/T]: fCash]
 */

/**
 * [loading state => onPageLoad]
 *   - isReady
 *   - availableTokens: all underlying tokens as a string
 *   - availableUnderlying: all underlying token definitions
 *   - availablefCash: all non-idiosyncratic fCash definitions
 *   - availableNTokens: all nToken token definitions
 *
 * [onAssetMarketChange]
 * - collateral market pool data
 *
 * [onBorrowMarketChange]
 * - debt market pool data
 *
 * User Inputs:
 * [via updateState]
 * - selectedAssetUnderlying
 * - collateral currency: will be fCash, nToken or Prime Cash
 *
 * [via updateState]
 * - selectedBorrowUnderlying
 * - debt currency: if same as collateral currency, then is local currency leverage
 *
 * [via updateState or onInputChange]
 * - underlying deposit amount: this is the amount to deposit during minting of the collateral, may be
 *   the total amount or partial
 * - collateral input amount: may be calculated or direct input, total amount of collateral currency to mint
 * - debt input amount: may be calculated or direct input, total amount of fCash or cash to debt
 *    - if this is debt variable, will be denominated in negative cash
 *
 * [prior account risk => onAccountChange]
 *   - prior risk exposure
 *   - prior risk factor values
 *
 * [transaction state => onCanSubmit which is passed in]
 *   - confirm
 *   - buildTransactionCall
 *   - account balances after
 *   - current risk exposure
 *   - current risk factor values
 */
