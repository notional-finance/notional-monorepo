import { BaseTradeState, isLeveragedTrade } from '@notional-finance/notionable';
import { useAllMarkets } from '../use-market';
import { TokenDefinition } from '@notional-finance/core-entities';
import { leveragedYield } from '@notional-finance/util';

export function useTotalAPY(
  state: BaseTradeState,
  priorVaultFactors?: {
    vaultShare?: TokenDefinition;
    vaultBorrowRate?: number;
    leverageRatio?: number;
  }
) {
  const {
    tradeType,
    debt,
    collateralOptions,
    debtOptions,
    riskFactorLimit,
    selectedNetwork,
  } = state;
  const { nonLeveragedYields } = useAllMarkets(selectedNetwork);
  const isLeveraged =
    isLeveragedTrade(tradeType) || priorVaultFactors !== undefined;
  const collateral = state.collateral || priorVaultFactors?.vaultShare;

  const nonLeveragedYield = nonLeveragedYields.find(
    (y) => y.token.id === collateral?.id
  );
  const assetAPY =
    collateralOptions?.find((c) => c.token.id === collateral?.id)
      ?.interestRate || nonLeveragedYield?.totalAPY;

  const debtAPY =
    debtOptions?.find((d) => d.token.id === debt?.id)?.interestRate ||
    nonLeveragedYields.find((y) => y.token.id === debt?.id)?.totalAPY ||
    priorVaultFactors?.vaultBorrowRate;

  const leverageRatio =
    riskFactorLimit?.riskFactor === 'leverageRatio'
      ? (riskFactorLimit.limit as number)
      : priorVaultFactors?.leverageRatio;

  const apySpread =
    assetAPY !== undefined && debtAPY !== undefined
      ? assetAPY - debtAPY
      : undefined;

  let totalAPY: number | undefined;
  if (isLeveraged) {
    totalAPY = leveragedYield(assetAPY, debtAPY, leverageRatio);
  } else {
    totalAPY = assetAPY !== undefined ? assetAPY : debtAPY;
  }

  return { totalAPY, apySpread, leverageRatio, assetAPY, debtAPY };
}
