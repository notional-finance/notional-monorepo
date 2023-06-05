
```
export function emitPoolData(
  category: Category,
  pool$: ReturnType<typeof selectedPool>
) {
  return pool$.pipe(
    filterEmpty(),
    map((_p): CashGroupData => {
      // TODO: fill this out
      return {} as CashGroupData;
    }),
    map((d) =>
      category === 'Collateral' ? { collateralData: d } : { debtData: d }
    )
  );
}

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
