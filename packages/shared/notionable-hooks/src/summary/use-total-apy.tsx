import {
  BaseTradeState,
  isLeveragedTrade,
  useCurrentNetworkStore,
} from '@notional-finance/notionable';
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
  const { tradeType, debt, collateralOptions, debtOptions, riskFactorLimit } =
    state;
  const currentNetworkStore = useCurrentNetworkStore();
  const nonLeveragedYields = currentNetworkStore.getAllNonLeveragedYields();
  const isLeveraged =
    isLeveragedTrade(tradeType) || priorVaultFactors !== undefined;
  const collateral = state.collateral || priorVaultFactors?.vaultShare;

  const nonLeveragedYield = nonLeveragedYields.find(
    (y) => y.token.id === collateral?.id
  );
  const assetAPY =
    collateralOptions?.find((c) => c.token.id === collateral?.id)
      ?.interestRate || nonLeveragedYield?.apy.totalAPY;

  const debtAPY =
    debtOptions?.find((d) => d.token.id === debt?.id)?.interestRate ||
    nonLeveragedYields.find((y) => y.token.id === debt?.id)?.apy.totalAPY ||
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
  let organicAPY: number | undefined;
  let incentiveAPY: number | undefined;
  if (isLeveraged) {
    totalAPY = leveragedYield(assetAPY, debtAPY, leverageRatio);
    organicAPY = leveragedYield(
      nonLeveragedYield?.apy.organicAPY,
      debtAPY,
      leverageRatio
    );
    incentiveAPY = leveragedYield(
      nonLeveragedYield?.apy.incentiveAPY,
      0,
      leverageRatio
    );
  } else {
    totalAPY = assetAPY !== undefined ? assetAPY : debtAPY;
  }

  return {
    totalAPY,
    apySpread,
    leverageRatio,
    assetAPY,
    debtAPY,
    organicAPY,
    incentiveAPY,
  };
}
