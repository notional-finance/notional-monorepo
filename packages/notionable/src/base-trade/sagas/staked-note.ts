import {
  AccountDefinition,
  NOTERegistryClient,
  Registry,
  SNOTEWeightedPool,
} from '@notional-finance/core-entities';
import { Network, filterEmpty } from '@notional-finance/util';
import {
  Observable,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
} from 'rxjs';
import { BaseTradeState, NOTETradeType } from '../base-trade-store';
import { comparePortfolio } from './account-risk';

export function stakedNOTEPool(network$: Observable<Network>) {
  return network$.pipe(
    switchMap((n) => Registry.getOracleRegistry().subscribeNetworkKeys(n)),
    filter((s) => s?.key === NOTERegistryClient.sNOTEOracle),
    map(() => Registry.getExchangeRegistry().getSNOTEPool())
  );
}

export function initState(
  state$: Observable<BaseTradeState>,
  account$: Observable<AccountDefinition | null>,
  pool$: Observable<SNOTEWeightedPool | undefined>
) {
  return combineLatest([state$, account$, pool$]).pipe(
    filter(([{ isReady }]) => isReady === false),
    map(([state, account, pool]) => {
      if (pool === undefined) return undefined;
      const sNOTE = Registry.getTokenRegistry().getTokenBySymbol(
        Network.mainnet,
        'sNOTE'
      );

      if (account?.stakeNOTEStatus?.inCoolDown) {
        return {
          isReady: true,
          tradeType: 'StakeNOTECoolDown' as NOTETradeType,
          selectedNetwork: Network.mainnet,
        };
      } else if (account?.stakeNOTEStatus?.inRedeemWindow) {
        return {
          isReady: true,
          tradeType: 'StakeNOTERedeem' as NOTETradeType,
          selectedNetwork: Network.mainnet,
          debt: sNOTE,
        };
      } else {
        const ETH = Registry.getTokenRegistry().getTokenBySymbol(
          Network.mainnet,
          'ETH'
        );
        const WETH = Registry.getTokenRegistry().getTokenBySymbol(
          Network.mainnet,
          'WETH'
        );

        return {
          isReady: true,
          tradeType: 'StakeNOTE' as NOTETradeType,
          selectedDepositToken: state.selectedDepositToken,
          availableDepositTokens: [ETH, WETH],
          // sNOTE is always the collateral
          availableCollateralTokens: [sNOTE],
          collateral: sNOTE,
          selectedNetwork: Network.mainnet,
          useOptimalETH: true,
        };
      }
    }),
    filterEmpty()
  );
}

export function setDepositToken(state$: Observable<BaseTradeState>) {
  return state$.pipe(
    filter((s) => s.isReady && s.tradeType === 'StakeNOTE'),
    distinctUntilChanged(
      (p, c) => p.selectedDepositToken === c.selectedDepositToken
    ),
    map((s) =>
      s.selectedDepositToken
        ? {
            deposit: Registry.getTokenRegistry().getTokenBySymbol(
              Network.mainnet,
              s.selectedDepositToken
            ),
          }
        : undefined
    ),
    filterEmpty()
  );
}

export function compareNOTEPortfolio(
  state$: Observable<BaseTradeState>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([state$, account$]).pipe(
    distinctUntilChanged(
      ([p], [c]) =>
        p.calculationSuccess === c.calculationSuccess &&
        p.collateralBalance?.hashKey === c.collateralBalance?.hashKey &&
        p.debtBalance?.hashKey === c.debtBalance?.hashKey &&
        p.inputErrors === c.inputErrors
    ),
    map(([state, account]) => {
      const prior = account?.balances.filter(
        (t) =>
          t.symbol === state.deposit?.symbol ||
          t.symbol === state.secondaryDepositBalance?.symbol ||
          t.symbol === 'sNOTE'
      );
      return prior && state.postTradeBalances
        ? {
            comparePortfolio: comparePortfolio(prior, state.postTradeBalances),
            canSubmit: state.calculationSuccess && state.inputErrors === false,
          }
        : undefined;
    }),
    filterEmpty()
  );
}
