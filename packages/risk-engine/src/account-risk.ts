class AccountRisk {
  getCollateralFactors() {
    return {
      totalCollateral,
      totalCollateralHaircut,
      totalDebt,
      totalDebtBuffered
      perCurrencyDebt: {
        debt,
        debtBuffered
      }[]
      perCurrencyCollateral: {
        collateral,
        collateralHaircut
      }[],
      perCurrencyNet: {
        netAssets,
        netAssetsRiskAdjusted
      }
    }
  }

  /***** RISK RATIOS *******/
  getFreeCollateral(currencyId?: number) {
  }

  getLoanToValue(currencyId?: number) {
    return totalDebt / totalCollateral
  }

  getCollateralRatio(currencyId?: number) {
    // sum(perCurrencyNet.netAssets) / sum(perCurrencyNet.netDebt)
  }

  getLeverageRatio(currencyId?: number) {
  }

  getBufferedRatio(currencyId?: number) {
    // sum(perCurrencyNet.netAssetsRiskAdjusted) / sum(perCurrencyNet.netDebtRiskAdjusted)
  }

  // Use approximations here...
  // use if depositing collateral or repaying debt
  getBorrowCapacity(borrowCurrencyId: number) {

  }

  /***** SIMULATED REQUIREMENTS *******/

  // use if borrowing collateral
  getCollateralRequiredToMaintainRiskFactors(collateralId: number, riskFactor) {

  }

  // use if withdrawing collateral, risk factor will increase...
  getWithdrawAmountToMaintainRiskFactors(collateralId: number, minimumRiskFactor) {

  }

  /***** RISK THRESHOLDS *******/

  getLiquidationPrice() {}
  getLiquidationPenalty() {}

  getRiskFactor(riskFactor, factorParam){}

}