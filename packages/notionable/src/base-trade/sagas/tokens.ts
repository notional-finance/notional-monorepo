import { TokenDefinition, Registry } from '@notional-finance/core-entities';
import {
  Observable,
  combineLatest,
  pairwise,
  map,
  filter,
  distinctUntilChanged,
} from 'rxjs';
import {
  BaseTradeState,
  TradeState,
  VaultTradeState,
} from '../base-trade-store';
import { selectedAccount, selectedNetwork } from '../../global';
import { getNowSeconds, filterEmpty } from '@notional-finance/util';
import { getTradeConfig } from '../trade-calculation';

/** Ensures that tokens are automatically selected or cleared when they change */
function getSelectedToken(
  availableTokens: TokenDefinition[],
  selectedToken: string | undefined
) {
  if (availableTokens.length === 1) return availableTokens[0];
  return availableTokens.find((t) => t.symbol === selectedToken);
}

export type Category = 'Collateral' | 'Debt' | 'Deposit';

export function selectedToken(
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return combineLatest([state$, selectedNetwork$]).pipe(
    // NOTE: distinct until changed does not work with this for some reason
    pairwise(),
    map(([[prevS, prevN], [curS, selectedNetwork]]) => {
      const selectedToken = curS.selectedDepositToken;
      const token = curS.deposit;
      return {
        hasChanged:
          prevS.selectedDepositToken !== selectedToken ||
          prevN !== selectedNetwork ||
          (!!selectedToken && token === undefined),
        selectedToken,
        selectedNetwork,
      };
    }),
    filter(({ hasChanged }) => hasChanged),
    map(({ selectedToken, selectedNetwork }) => {
      let deposit: TokenDefinition | undefined;
      if (selectedToken && selectedNetwork) {
        try {
          const tokens = Registry.getTokenRegistry();
          deposit = tokens.getTokenBySymbol(selectedNetwork, selectedToken);
        } catch {
          // NOTE: some tokens may not have nTokens listed, if so then this will
          // remain undefined
          console.error(
            `Token ${selectedToken} not found on network ${selectedNetwork}`
          );
        }
      }

      return { deposit };
    })
  );
}

export function availableTokens(
  state$: Observable<TradeState | VaultTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>,
  account$: ReturnType<typeof selectedAccount>
) {
  return combineLatest([state$, selectedNetwork$, account$]).pipe(
    filter(([{ isReady, tradeType }]) => isReady && !!tradeType),
    distinctUntilChanged(([p, , pa], [c, , ca]) => {
      return (
        pa?.address === ca?.address &&
        p.deposit?.id === c.deposit?.id &&
        p.collateral?.id === c.collateral?.id &&
        p.debt?.id === c.debt?.id &&
        p.tradeType === c.tradeType
      );
    }),
    map(([s, selectedNetwork, account]) => {
      const { collateralFilter, depositFilter, debtFilter } = getTradeConfig(
        s.tradeType
      );
      const listedTokens =
        Registry.getTokenRegistry().getAllTokens(selectedNetwork);

      // NOTE: selectedDepositToken is used via the URL string to set the deposit token, that is
      // first selected here and then we simulate the newState with this deposit token set before
      // we apply collateral and debt filters. This reduces race conditions and improves front end
      // performance.
      const availableDepositTokens = listedTokens
        .filter((t) => t.tokenType === 'Underlying')
        // By default we only allow tokens with a currency id specified (i.e. they are listed
        // on Notional)
        .filter((t) =>
          depositFilter ? depositFilter(t, account, s) : !!t.currencyId
        );
      const deposit = getSelectedToken(
        availableDepositTokens,
        s.selectedDepositToken || s.deposit?.symbol
      );
      const newState = Object.assign(s, { deposit });

      // Now apply collateral and debt filters against the `newState` object
      const availableCollateralTokens = listedTokens
        .filter(
          (t) =>
            t.tokenType === 'PrimeCash' ||
            t.tokenType === 'nToken' ||
            (t.tokenType === 'VaultShare' &&
              (t.maturity || 0) > getNowSeconds()) ||
            (t.tokenType === 'fCash' &&
              t.isFCashDebt === false &&
              (t.maturity || 0) > getNowSeconds())
        )
        .filter((t) =>
          collateralFilter ? collateralFilter(t, account, newState) : true
        );

      const availableDebtTokens = listedTokens
        .filter(
          (t) =>
            t.tokenType === 'nToken' ||
            t.tokenType === 'PrimeDebt' ||
            (t.tokenType === 'VaultDebt' &&
              (t.maturity || 0) > getNowSeconds()) ||
            (t.tokenType === 'fCash' &&
              t.isFCashDebt === false && // Always use positive fCash
              (t.maturity || 0) > getNowSeconds())
        )
        .filter((t) => (debtFilter ? debtFilter(t, account, newState) : true));

      const hasChanged =
        availableCollateralTokens.map((t) => t.id).join(':') !==
          s.availableCollateralTokens?.map((t) => t.id).join(':') ||
        availableDebtTokens.map((t) => t.id).join(':') !==
          s.availableDebtTokens?.map((t) => t.id).join(':') ||
        availableDepositTokens.map((t) => t.id).join(':') !==
          s.availableDepositTokens?.map((t) => t.id).join(':');

      const debt = getSelectedToken(availableDebtTokens, s.debt?.symbol);
      const collateral = getSelectedToken(
        availableCollateralTokens,
        s.collateral?.symbol
      );

      return hasChanged
        ? {
            availableCollateralTokens,
            availableDebtTokens,
            availableDepositTokens,

            // Set the default values if only one is available
            deposit,
            debt,
            collateral,
            selectedDepositToken: deposit?.symbol,
          }
        : undefined;
    }),
    filterEmpty()
  );
}
