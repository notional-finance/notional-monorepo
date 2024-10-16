import { TokenDefinition, Registry } from '@notional-finance/core-entities';
import {
  Observable,
  combineLatest,
  map,
  filter,
  distinctUntilChanged,
} from 'rxjs';
import {
  AllTradeTypes,
  BaseTradeState,
  TradeState,
  VaultTradeState,
} from '../base-trade-store';
import { selectedAccount, selectedNetwork } from '../../global';
import {
  getNowSeconds,
  filterEmpty,
  PRIME_CASH_VAULT_MATURITY,
} from '@notional-finance/util';
import { getTradeConfig } from '../trade-calculation';

function getDefaultTokens(
  availableTokens: TokenDefinition[],
  category: Category,
  tradeType?: AllTradeTypes
) {
  if (tradeType === 'LendFixed' && category === 'Collateral') {
    return availableTokens[0];
  } else if (tradeType === 'BorrowFixed' && category === 'Debt') {
    return availableTokens[0];
  } else if (tradeType === 'LeveragedNToken' && category === 'Debt') {
    return availableTokens.find((t) => t.tokenType === 'PrimeDebt');
  } else if (tradeType === 'CreateVaultPosition') {
    return availableTokens.find(
      (t) => t.maturity === PRIME_CASH_VAULT_MATURITY
    );
  } else {
    return undefined;
  }
}

/** Ensures that tokens are automatically selected or cleared when they change */
function getSelectedToken(
  availableTokens: TokenDefinition[],
  selectedToken: string | undefined,
  category: Category,
  tradeType?: AllTradeTypes
) {
  if (availableTokens.length === 1) {
    return availableTokens[0];
  } else if (selectedToken === undefined) {
    return getDefaultTokens(availableTokens, category, tradeType);
  } else {
    return availableTokens.find((t) => t.symbol === selectedToken);
  }
}

export type Category = 'Collateral' | 'Debt' | 'Deposit';

export function selectedDepositToken(state$: Observable<BaseTradeState>) {
  return state$.pipe(
    distinctUntilChanged(
      (p, c) =>
        p.selectedDepositToken === c.selectedDepositToken &&
        p.selectedNetwork === c.selectedNetwork
    ),
    map(({ selectedDepositToken, selectedNetwork }) => {
      if (!selectedDepositToken || !selectedNetwork) return undefined;
      return {
        deposit: Registry.getTokenRegistry().getTokenBySymbol(
          selectedNetwork,
          selectedDepositToken
        ),
      };
    }),
    filterEmpty()
  );
}

export function selectedPortfolioToken(state$: Observable<BaseTradeState>) {
  return state$.pipe(
    distinctUntilChanged(
      (p, c) =>
        p.selectedToken === c.selectedToken &&
        p.selectedNetwork === c.selectedNetwork &&
        p.tradeType === c.tradeType
    ),
    filter(
      ({ tradeType, sideDrawerKey }) =>
        // Roll Debt here is used to trigger the selected token for LeveragedNToken, this
        // does not apply on the portfolio RollDebt where sideDrawerKey is defined
        (tradeType === 'RollDebt' && sideDrawerKey === undefined) ||
        tradeType === 'RepayDebt' ||
        tradeType === 'Withdraw' ||
        tradeType === 'RollVaultPosition' ||
        tradeType === 'Deposit'
    ),
    map(({ selectedToken, selectedNetwork, tradeType }) => {
      if (!selectedToken || !selectedNetwork || !tradeType) return undefined;
      const tokens = Registry.getTokenRegistry();
      if (tradeType === 'Deposit') {
        // In deposit collateral, the selectedToken is the underlying symbol
        const underlying = tokens.getTokenBySymbol(
          selectedNetwork,
          selectedToken
        );
        return {
          deposit: underlying,
          collateral: tokens.getPrimeCash(
            selectedNetwork,
            underlying.currencyId
          ),
        };
      }

      const selected = tokens.getTokenByID(selectedNetwork, selectedToken);
      if (tradeType === 'RepayDebt') {
        return {
          collateral:
            selected.tokenType === 'PrimeDebt'
              ? tokens.getPrimeCash(selected.network, selected.currencyId)
              : selected,
        };
      } else if (tradeType === 'Withdraw' || tradeType === 'RollDebt') {
        return {
          debt:
            selected.tokenType === 'PrimeCash'
              ? tokens.getPrimeDebt(selected.network, selected.currencyId)
              : selected,
        };
      } else if (tradeType === 'RollVaultPosition') {
        return { debt: selected };
      } else {
        return undefined;
      }
    }),
    filterEmpty()
  );
}

export function availableTokens(
  state$: Observable<TradeState | VaultTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>,
  account$: ReturnType<typeof selectedAccount>
) {
  return combineLatest([state$, selectedNetwork$, account$]).pipe(
    filter(([{ isReady, tradeType }]) => isReady && !!tradeType),
    distinctUntilChanged(([p], [c]) => {
      return (
        // pa?.address === ca?.address &&
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
        .filter((t) => t.tokenType === 'Underlying' && !!t.currencyId)
        // By default we only allow tokens with a currency id specified (i.e. they are listed
        // on Notional)
        .filter((t) =>
          depositFilter
            ? depositFilter(t, account, s, listedTokens)
            : !!t.currencyId
        );

      const deposit = getSelectedToken(
        availableDepositTokens,
        s.selectedDepositToken || s.deposit?.symbol,
        'Deposit'
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
          collateralFilter
            ? collateralFilter(t, account, newState, listedTokens)
            : true
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
        .filter((t) =>
          debtFilter ? debtFilter(t, account, newState, listedTokens) : true
        );

      const debt = getSelectedToken(
        availableDebtTokens,
        s.debt?.symbol,
        'Debt',
        s.tradeType
      );
      const collateral = getSelectedToken(
        availableCollateralTokens,
        s.collateral?.symbol,
        'Collateral',
        s.tradeType
      );

      const hasChanged =
        availableCollateralTokens.map((t) => t.id).join(':') !==
          s.availableCollateralTokens?.map((t) => t.id).join(':') ||
        availableDebtTokens.map((t) => t.id).join(':') !==
          s.availableDebtTokens?.map((t) => t.id).join(':') ||
        availableDepositTokens.map((t) => t.id).join(':') !==
          s.availableDepositTokens?.map((t) => t.id).join(':') ||
        s.debt?.id !== debt?.id ||
        s.collateral?.id !== collateral?.id ||
        s.deposit?.id !== deposit?.id;

      return hasChanged
        ? {
            availableCollateralTokens,
            availableDebtTokens,
            availableDepositTokens,

            // Set the default values if only one is available
            deposit,
            debt,
            collateral,
          }
        : undefined;
    }),
    filterEmpty()
  );
}
