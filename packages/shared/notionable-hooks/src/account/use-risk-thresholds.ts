import {
  AccountData,
  BaseVault,
  INTERNAL_TOKEN_PRECISION,
  LiquidationThreshold,
  TypedBigNumber,
  VaultFactory,
} from '@notional-finance/sdk';
import { hasMatured } from '@notional-finance/sdk/libs/utils';
import {
  FreeCollateral,
  InterestRateRisk,
} from '@notional-finance/sdk/src/system';
import { logError } from '@notional-finance/util';
import { useNotional } from '../use-notional';
import { useAccount } from './use-account';

function hasNTokenCollateral(currencyId: number, accountData: AccountData) {
  return accountData.nTokenBalance(currencyId)?.isPositive() || false;
}

function hasfCashCollateral(currencyId: number, accountData: AccountData) {
  return !!accountData.portfolio.find(
    (a) =>
      a.currencyId === currencyId && a.notional.isPositive() && !hasMatured(a)
  );
}

function calculateLiquidationPairs(accountData: AccountData) {
  const { netUnderlyingAvailable } =
    FreeCollateral.getFreeCollateral(accountData);
  if (netUnderlyingAvailable.size === 0) return [];
  const netUnderlying = Array.from(netUnderlyingAvailable.values());

  // Sorted from most negative to least negative
  const netDebts = netUnderlying
    .filter((v) => v.isNegative())
    .sort((a, b) => (a.toETH(false).abs().lte(b.toETH(false).abs()) ? -1 : 1));
  // Sorted from most positive to least positive
  const netCollateral = netUnderlying
    .filter((v) => v.isPositive())
    .sort((a, b) => (a.toETH(false).lte(b.toETH(false)) ? -1 : 1));

  // Returns pairs starting from the largest debt & the largest collateral currency down
  // through all collateral currencies and then continues with the second largest debt
  // and down from there.
  return netDebts.flatMap((d) => {
    return netCollateral.map((c) => {
      return {
        debtCurrencyId: d.currencyId,
        collateralCurrencyId: c.currencyId,
        hasNTokenCollateral: hasNTokenCollateral(c.currencyId, accountData),
        hasfCashCollateral: hasfCashCollateral(c.currencyId, accountData),
      };
    });
  });
}

export function useRiskThresholds(
  _accountDataCopy?: AccountData,
  numLiquidationPairs = 2
) {
  const { accountDataCopy: a } = useAccount();
  const { system } = useNotional();
  const accountDataCopy = _accountDataCopy?.copy() || a;
  const interestRateRisk =
    InterestRateRisk.calculateInterestRateRisk(accountDataCopy);
  const hasInterestRateRisk = interestRateRisk.size > 0;
  const liquidationPrices = calculateLiquidationPairs(accountDataCopy)
    .slice(0, numLiquidationPairs)
    .map(
      ({
        debtCurrencyId,
        collateralCurrencyId,
        hasNTokenCollateral,
        hasfCashCollateral,
      }) => {
        const liquidationPrice = accountDataCopy.getLiquidationPrice(
          collateralCurrencyId,
          debtCurrencyId
        );
        const debtSymbol = system?.getUnderlyingSymbol(debtCurrencyId);
        const collateralSymbol =
          system?.getUnderlyingSymbol(collateralCurrencyId);
        // Only calculate these if there is a liquidation price
        const { totalPenaltyRate, totalPenaltyETHValueAtLiquidationPrice } =
          liquidationPrice
            ? accountDataCopy.getLiquidationPenalty(
                collateralCurrencyId,
                liquidationPrice
              )
            : {
                totalPenaltyRate: undefined,
                totalPenaltyETHValueAtLiquidationPrice: undefined,
              };

        const currentPrice = collateralSymbol
          ? TypedBigNumber.fromBalance(
              INTERNAL_TOKEN_PRECISION,
              collateralSymbol,
              true
            )
              .toETH(false)
              .fromETH(debtCurrencyId, false)
          : undefined;

        return {
          id: `${debtCurrencyId}:${collateralCurrencyId}`,
          debtCurrencyId,
          collateralCurrencyId,
          // Liquidation Price is returned in Debt Currency
          liquidationPrice,
          totalPenaltyRate,
          totalPenaltyValue: totalPenaltyETHValueAtLiquidationPrice?.fromETH(
            collateralCurrencyId,
            false
          ),
          debtSymbol,
          collateralSymbol,
          currentPrice,
          hasNTokenCollateral,
          hasfCashCollateral,
        };
      }
    )
    .filter(({ liquidationPrice }) => !!liquidationPrice);

  const maxMarketRates = new Map<number, number>(
    Array.from(interestRateRisk.keys()).map((currencyId) => {
      return [currencyId, InterestRateRisk.getMaxInterestRate(currencyId)];
    })
  );

  const interestRateRiskArray = Array.from(interestRateRisk.keys()).map((k) => {
    const symbol = system?.getUnderlyingSymbol(k);
    return {
      id: k,
      symbol,
      hasNTokenCollateral: hasNTokenCollateral(k, accountDataCopy),
      hasfCashCollateral: hasfCashCollateral(k, accountDataCopy),
      ...interestRateRisk.get(k)!,
    };
  });

  const vaultRiskThresholds = accountDataCopy.vaultAccounts.flatMap((a) => {
    let thresholds: LiquidationThreshold[] = [];
    if (a.isInactive === false) {
      try {
        thresholds = a.getLiquidationThresholds();
      } catch (e) {
        console.error(e);
      }
    }

    const vaultConfig = a.getVault();
    const primaryBorrowSymbol = system?.getUnderlyingSymbol(
      vaultConfig.primaryBorrowCurrency
    );
    let leverageRatio: number | undefined;
    let leveragePercentage: number | undefined;
    const maxLeverageRatio = BaseVault.collateralToLeverageRatio(
      vaultConfig.minCollateralRatioBasisPoints
    );
    try {
      const baseVault = VaultFactory.buildVaultFromCache(
        vaultConfig.strategy,
        vaultConfig.vaultAddress
      );
      leverageRatio = baseVault.getLeverageRatio(a);
      leveragePercentage = (leverageRatio / maxLeverageRatio) * 100;
    } catch (e) {
      if ((e as Error).message.match('Vault at 0x.* not found') === null) {
        logError(e as Error, 'notionable/account', 'use-risk-thresholds');
      }
    }

    return thresholds.map((t) => {
      return {
        primaryBorrowSymbol,
        primaryBorrowCurrency: vaultConfig.primaryBorrowCurrency,
        vaultName: vaultConfig.name,
        leverageRatio,
        leveragePercentage,
        maxLeverageRatio,
        ...t,
      };
    });
  });

  return {
    interestRateRisk,
    interestRateRiskArray,
    hasInterestRateRisk,
    liquidationPrices,
    maxMarketRates,
    vaultRiskThresholds,
  };
}
