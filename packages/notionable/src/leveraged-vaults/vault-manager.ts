import { BaseVault, VaultFactory, VaultState } from '@notional-finance/sdk';
import {
  RATE_PRECISION,
  SECONDS_IN_DAY,
} from '@notional-finance/sdk/src/config/constants';
import { getNowSeconds } from '@notional-finance/util';
import { combineLatest, filter, forkJoin, from, map, mergeMap } from 'rxjs';
import { system$ } from '../notional/notional-store';
import {
  activeVaultMarkets$,
  ListedVault,
  listedVaults$,
  updateVaultState,
  VaultPerformance,
} from './vault-store';

const hiddenStrategies = ['CrossCurrencyfCash'];

system$.subscribe((system) => {
  if (system) {
    const listedVaults = system
      .getAllVaults(false)
      .map((v) => {
        return {
          vaultConfig: v,
          underlyingSymbol: system.getUnderlyingSymbol(v.primaryBorrowCurrency),
          strategyName: VaultFactory.resolveStrategyName(v.strategy),
        };
      })
      .filter(
        ({ strategyName }) =>
          strategyName !== undefined && !hiddenStrategies.includes(strategyName)
      ) as ListedVault[];

    // Only includes vault maturities that do not have asset cash
    const { vaultMaturityStates, activeVaultMarkets } = listedVaults.reduce(
      ({ vaultMaturityStates, activeVaultMarkets }, { vaultConfig }) => {
        const maxMarketIndex = vaultConfig.maxBorrowMarketIndex;
        const markets = system
          .getMarkets(vaultConfig.primaryBorrowCurrency)
          .filter((m) => m.marketIndex <= maxMarketIndex);
        const states = markets.map((m) =>
          system.getVaultState(vaultConfig.vaultAddress, m.maturity)
        );
        const activeMarketKeys = states
          .filter((v) => v.totalAssetCash.isZero())
          .map((v) => {
            return markets.find((m) => v.maturity === m.maturity)?.marketKey;
          })
          .filter((k) => k !== undefined) as string[];

        vaultMaturityStates.set(vaultConfig.vaultAddress, states);
        activeVaultMarkets.set(vaultConfig.vaultAddress, activeMarketKeys);

        return {
          vaultMaturityStates,
          activeVaultMarkets,
        };
      },
      {
        vaultMaturityStates: new Map<string, VaultState[]>(),
        activeVaultMarkets: new Map<string, string[]>(),
      }
    );

    updateVaultState({ listedVaults, vaultMaturityStates, activeVaultMarkets });
  } else {
    updateVaultState({
      listedVaults: [],
      activeVaultMarkets: new Map(),
      vaultMaturityStates: new Map(),
      baseVaultInitParams: new Map(),
    });
  }
});

export const vaultPerformance$ = combineLatest({
  listedVaults: listedVaults$,
}).pipe(
  mergeMap(({ listedVaults }) => {
    return forkJoin(
      listedVaults.map((v) => {
        return from(
          VaultFactory.fetchVaultReturns(v.vaultConfig.vaultAddress).then(
            (returns) => {
              return {
                vaultAddress: v.vaultConfig.vaultAddress,
                returns,
              };
            }
          )
        );
      })
    );
  }),
  map((values) => {
    return new Map<string, VaultPerformance>(
      values.map(({ vaultAddress, returns }) => {
        const currentTime = getNowSeconds();
        const {
          returnDrivers: sevenDayReturnDrivers,
          totalReturns: sevenDayTotalAverage,
        } = VaultFactory.calculateAverageReturns(
          returns,
          currentTime - 7 * SECONDS_IN_DAY
        );

        const {
          returnDrivers: thirtyDayReturnDrivers,
          totalReturns: thirtyDayTotalAverage,
        } = VaultFactory.calculateAverageReturns(
          returns,
          currentTime - 30 * SECONDS_IN_DAY
        );

        return [
          vaultAddress,
          {
            historicalReturns: returns,
            sevenDayReturnDrivers,
            thirtyDayReturnDrivers,
            sevenDayTotalAverage,
            thirtyDayTotalAverage,
          },
        ];
      })
    );
  })
);

export const headlineApy$ = combineLatest({
  listedVaults: listedVaults$,
  vaultPerformance$: vaultPerformance$,
  system: system$,
  activeVaultMarkets: activeVaultMarkets$,
}).pipe(
  filter(
    ({ vaultPerformance$, system }) =>
      system !== undefined && vaultPerformance$ !== undefined
  ),
  map(({ listedVaults, vaultPerformance$, system, activeVaultMarkets }) => {
    return listedVaults.map((v) => {
      const vaultAddress = v.vaultConfig.vaultAddress;
      const markets = system!.getMarkets(v.vaultConfig.primaryBorrowCurrency);
      const returns = vaultPerformance$.get(vaultAddress);
      // This is the minimum borrow rate
      const headlineBorrowRate = (activeVaultMarkets.get(vaultAddress) || [])
        .map((marketKey) => {
          const market = markets.find((m) => m.marketKey === marketKey);
          if (market) {
            // Min Borrow + Fee to get rate
            const fCashToBorrow = v.vaultConfig.minAccountBorrowSize.neg();
            const { cashToVault } = BaseVault.getDepositedCashFromBorrow(
              market,
              v.vaultConfig,
              fCashToBorrow
            );
            return market.interestRate(fCashToBorrow, cashToVault);
          }

          return undefined;
        })
        .filter((r) => r !== undefined)
        .sort()
        .reverse()
        .pop();

      const defaultLeverageRatio = BaseVault.collateralToLeverageRatio(
        v.vaultConfig.maxDeleverageCollateralRatioBasisPoints
      );

      return {
        vaultAddress,
        headlineApy: calculateHeadlineVaultReturns(
          returns?.sevenDayTotalAverage,
          headlineBorrowRate,
          defaultLeverageRatio
        ),
      };
    });
  }),
  map((values) => {
    return new Map(
      values.map(({ vaultAddress, headlineApy }) => [vaultAddress, headlineApy])
    );
  })
);

export function calculateHeadlineVaultReturns(
  averageReturn: number | undefined,
  currentBorrowRate: number | undefined,
  leverageRatio: number | undefined
) {
  if (averageReturn && currentBorrowRate && leverageRatio) {
    return (
      (averageReturn - currentBorrowRate) * (leverageRatio / RATE_PRECISION) +
      averageReturn
    );
  }
  return undefined;
}
