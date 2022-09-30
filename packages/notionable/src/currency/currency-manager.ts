import { combineLatest, of, map, switchMap, share, filter } from 'rxjs';
import { Currency } from '@notional-finance/sdk';
import { constants } from 'ethers';
import { ETHER_CURRENCY_ID } from '@notional-finance/sdk/config/constants';
import { ERC20Token } from '../types';
import { system$ } from '../notional/notional-store';
import { updateCurrencyState, selectCurrencyState } from './currency-store';

const { AddressZero } = constants;

export const additionalTokens$ = system$.pipe(
  filter((system) => system !== null),
  switchMap((system) => {
    return of([
      {
        symbol: 'NOTE',
        spender: system!.getStakedNote().address,
        contract: system!.getNOTE(),
      },
      {
        symbol: 'WETH',
        spender: system!.getStakedNote().address,
        contract: system!.getWETH(),
      },
      {
        symbol: 'sNOTE',
        spender: AddressZero,
        contract: system!.getStakedNote(),
      },
    ] as ERC20Token[]);
  })
);

const currencies$ = selectCurrencyState('currencies').pipe(
  map((currencies) => [...(currencies as Map<number, Currency>).values()])
);

export const systemTokens$ = combineLatest(currencies$, system$).pipe(
  map(([currencies, system]) => {
    if (system) {
      return currencies.flatMap((currency) => {
        const {
          assetSymbol,
          id,
          assetContract,
          underlyingContract,
          underlyingSymbol,
        } = currency;
        if (id === ETHER_CURRENCY_ID) {
          return [
            {
              symbol: 'ETH',
              spender: system.getNotionalProxy().address,
            },
            {
              symbol: assetSymbol,
              spender: system.getNotionalProxy().address,
              contract: assetContract,
            },
          ] as ERC20Token[];
        }

        if (underlyingContract) {
          return [
            {
              symbol: assetSymbol,
              spender: system.getNotionalProxy().address,
              contract: assetContract,
            },
            {
              symbol: underlyingSymbol ?? assetSymbol,
              spender: system.getNotionalProxy().address,
              contract: underlyingContract,
            },
          ] as ERC20Token[];
        }
        return [
          {
            symbol: assetSymbol,
            spender: system.getNotionalProxy().address,
            contract: assetContract,
          },
        ] as ERC20Token[];
      });
    }
    return [];
  }),
  share()
);

const _allTokens$ = combineLatest(systemTokens$, additionalTokens$).pipe(
  map(([systemTokens, additionalTokens]) => [
    ...systemTokens,
    ...additionalTokens,
  ])
);

system$.subscribe((system) => {
  if (system) {
    const currencies = new Map(
      system!.getAllCurrencies().map((c) => [c.id, c])
    );
    const tradableCurrencies = new Map(
      system!.getTradableCurrencies().map((c) => [c.id, c])
    );
    updateCurrencyState({ currencies, tradableCurrencies });
  } else {
    updateCurrencyState({
      currencies: new Map<number, Currency>(),
      tradableCurrencies: new Map<number, Currency>(),
    });
  }
});

_allTokens$.subscribe((tokens) => {
  updateCurrencyState({
    tokens: new Map(tokens.map((token) => [token.symbol, token])),
  });
});

systemTokens$.subscribe((systemTokens) => {
  updateCurrencyState({
    systemTokens: new Map(
      systemTokens.map((systemToken) => [systemToken.symbol, systemToken])
    ),
  });
});
