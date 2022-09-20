import {
  from,
  combineLatest,
  timer,
  forkJoin,
  Subject,
  map,
  tap,
  takeUntil,
  switchMap,
  distinctUntilChanged,
  mergeMap,
  exhaustMap,
} from 'rxjs';
import { ethers, providers } from 'ethers';
import { account$, accountConnected$ } from '../account/account-store';
import { BigNumberType, TypedBigNumber } from '@notional-finance/sdk-v2';
import { TokenBalance, ERC20Token } from '../types';
import { tokens$ } from '../currency/currency-store';
import { updateWalletState } from './wallet-store';
import { system$ } from '../notional/notional-store';
import { WalletRefreshInterval } from '../notionable.config';

const _startRefresh = new Subject();
const startRefresh$ = _startRefresh.asObservable();
const _stopRefresh = new Subject();
const stopRefresh$ = _stopRefresh
  .asObservable()
  .pipe(tap(() => console.log('stop wallet refresh')));

const _walletUpdates = new Subject<Map<string, TokenBalance>>();
const walletUpdates$ = _walletUpdates.asObservable().pipe(
  distinctUntilChanged((a, b) => {
    return (
      a &&
      b &&
      a.size === b.size &&
      [...a.entries()].every(([key, t1]) => b.has(key) && compareTokenBalances(t1, b.get(key)!))
    );
  })
);

function compareTokenBalances(a: TokenBalance, b: TokenBalance) {
  const sameBalance = a.balance.eq(b.balance);
  const noAllowance = TypedBigNumber.from(0, BigNumberType.ExternalUnderlying, 'ETH');
  const aAllowance = a.allowance ?? noAllowance;
  const bAllowance = b.allowance ?? noAllowance;
  return sameBalance && aAllowance.eq(bAllowance);
}

const _refreshWalletBalances$ = combineLatest([tokens$, system$, account$]).pipe(
  mergeMap(([tokens, system, account]) => {
    if (system && account?.address) {
      const provider = system.batchProvider;
      return forkJoin(
        [...tokens.values()].map((token) =>
          from(getBalanceAndAllowance(token, provider, account?.address))
        )
      );
    }
    return from([]);
  }),
  map((balances) => {
    const tokens = new Map(balances?.map((balance) => [balance.symbol, balance]) ?? []);
    _walletUpdates.next(tokens);
  })
);

const _walletRefreshTimer$ = timer(0, WalletRefreshInterval).pipe(
  switchMap((_) => _refreshWalletBalances$),
  takeUntil(stopRefresh$)
);
async function getBalanceAndAllowance(
  token: ERC20Token,
  provider: providers.JsonRpcBatchProvider,
  address: string
) {
  const { symbol, contract, spender } = token;
  if (contract) {
    const balanceBN = await contract.balanceOf(address);
    const balance = TypedBigNumber.fromBalance(balanceBN, symbol, false);
    const allowanceBN = await contract.allowance(address, spender);
    const allowance = TypedBigNumber.fromBalance(allowanceBN, symbol, false);
    return {
      symbol,
      balance,
      allowance,
      contract,
      spender,
    } as TokenBalance;
  } else {
    const balanceBN = await provider.getBalance(address);
    const balance = TypedBigNumber.fromBalance(balanceBN, symbol, false);
    const allowance = TypedBigNumber.fromBalance(ethers.constants.MaxUint256, symbol, false);
    return {
      symbol,
      balance,
      allowance,
    } as TokenBalance;
  }
}

startRefresh$.pipe(exhaustMap(() => _walletRefreshTimer$)).subscribe();
accountConnected$.subscribe((connected) => {
  connected ? _startRefresh.next(connected) : _stopRefresh.next(null);
  updateWalletState({ walletConnected: connected });
});

walletUpdates$.subscribe((tokens) => {
  console.log('wallet balances updated');
  updateWalletState({ tokens });
});
