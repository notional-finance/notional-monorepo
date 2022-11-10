import { notional$ } from '@notional-finance/notionable';
import { TypedBigNumber } from '@notional-finance/sdk';
import { Treasury } from '@notional-finance/sdk/src/staking';
import Order from '@notional-finance/sdk/src/staking/Order';
import { BigNumber, ethers } from 'ethers';
import { combineLatest, filter, map, Observable, switchMap, timer } from 'rxjs';
import { selectTreasuryState, updateTreasuryState } from './treasury-store';

export interface ReserveData {
  symbol: string;
  reserveBalance: TypedBigNumber;
  reserveBuffer: TypedBigNumber;
  treasuryBalance: TypedBigNumber;
}

export interface CompReserveData {
  symbol: 'COMP';
  reserveBalance: BigNumber;
  reserveBuffer: BigNumber;
  reserveValueUSD: BigNumber;
  treasuryBalance: BigNumber;
}

export const reserveData$ = notional$.pipe(
  filter((n) => !!n),
  switchMap(() => {
    return Treasury.getReserveData();
  })
);

export const compReserveData$ = notional$.pipe(
  filter((n) => !!n),
  switchMap(() => {
    return Treasury.getCompData();
  })
);

export const treasuryManager$ = notional$.pipe(
  filter((n) => !!n),
  switchMap(() => {
    return Treasury.getManager();
  })
);

export const openLimitOrders$ = timer(0, 10000).pipe(
  switchMap(async () => {
    const orders: Order[] = await Treasury.getOpenLimitOrders();
    return orders?.sort((a, b) => {
      return BigNumber.from(a.expirationTimeSeconds)
        .sub(BigNumber.from(b.expirationTimeSeconds))
        .toNumber();
    });
  })
);

const selectedReserveCurrency$ = selectTreasuryState(
  'selectedReserveCurrency'
) as Observable<string>;

selectedReserveCurrency$.pipe(filter((s) => !!s)).subscribe(async (s) => {
  const { priceFloor, spotPrice } = await Treasury.getTradePriceData(s);
  updateTreasuryState({ tradePriceFloor: priceFloor, tradeSpotPrice: spotPrice });
});

export const tradeWETHAmount$ = combineLatest([
  notional$,
  selectTreasuryState('inputTradeWETH') as Observable<string>,
]).pipe(
  filter(([n]) => !!n),
  map(([notional, input]) => {
    return notional!.parseInput(input, 'WETH', false);
  })
);

export const tradeReserveAmount$ = combineLatest([
  notional$,
  selectedReserveCurrency$,
  selectTreasuryState('inputTradeReserve') as Observable<string>,
]).pipe(
  filter(([n]) => !!n),
  map(([notional, symbol, input]) => {
    try {
      if (symbol === 'COMP') {
        return ethers.utils.parseUnits(input.replace(/,/g, ''), 18);
      } else {
        return notional!.parseInput(input, symbol, false);
      }
    } catch {
      return undefined;
    }
  })
);

export const tradeReserveAmountError$ = combineLatest([
  tradeReserveAmount$,
  compReserveData$,
  reserveData$,
  selectedReserveCurrency$,
]).pipe(
  filter(([t, c, r, s]) => !!t && !!c && !!r && !!s),
  map(([amt, comp, reserveData, symbol]) => {
    if (symbol === 'COMP' && (amt as BigNumber).gt(comp.treasuryBalance)) {
      return 'Amount over treasury balance';
    } else if (symbol !== 'COMP') {
      const reserve = reserveData.find(({ symbol: s }) => s === symbol);
      if (!reserve) {
        return 'Reserve data not found';
      } else if ((amt as TypedBigNumber).gt(reserve.treasuryBalance)) {
        return 'Amount over treasury balance';
      }
    }

    return '';
  })
);

export const tradeReserveCurrentPrice$ = combineLatest([
  tradeWETHAmount$,
  tradeReserveAmount$,
  selectedReserveCurrency$,
]).pipe(
  filter(([w, r]) => !!w && !!r && w.isPositive()),
  map(([weth, reserve, symbol]) => {
    if (symbol === 'COMP') {
      return weth!.n.mul(ethers.constants.WeiPerEther).div(reserve as BigNumber);
    } else {
      return weth!.scale((reserve as TypedBigNumber).decimals, (reserve as TypedBigNumber).n).n;
    }
  })
);

export const investWETHAmount$ = combineLatest([
  notional$,
  selectTreasuryState('inputInvestETH') as Observable<string>,
]).pipe(
  filter(([n]) => !!n),
  map(([notional, input]) => {
    return notional!.parseInput(input, 'WETH', false);
  })
);

export const investNOTEAmount$ = combineLatest([
  notional$,
  selectTreasuryState('inputInvestNOTE') as Observable<string>,
]).pipe(
  filter(([n]) => !!n),
  map(([notional, input]) => {
    return notional!.parseInput(input, 'NOTE', false);
  })
);

export const maxPriceImpact$ = notional$.pipe(
  filter((n) => !!n),
  switchMap(() => {
    return Treasury.getMaxNotePriceImpact();
  })
);

export const investNOTEError$ = combineLatest([investNOTEAmount$, reserveData$]).pipe(
  filter(([i, r]) => !!i && !!r),
  map(([amt, reserveData]) => {
    const reserve = reserveData.find(({ symbol: s }) => s === 'NOTE');
    if (!reserve) {
      return 'Reserve data not found';
    } else if ((amt as TypedBigNumber).gt(reserve.treasuryBalance)) {
      return 'Amount over treasury balance';
    }

    return '';
  })
);

export const investWETHError$ = combineLatest([investWETHAmount$, reserveData$]).pipe(
  filter(([i, r]) => !!i && !!r),
  map(([amt, reserveData]) => {
    const reserve = reserveData.find(({ symbol: s }) => s === 'WETH');
    if (!reserve) {
      return 'Reserve data not found';
    } else if ((amt as TypedBigNumber).gt(reserve.treasuryBalance)) {
      return 'Amount over treasury balance';
    }

    return '';
  })
);

export const maxAmounts$ = combineLatest([
  reserveData$,
  compReserveData$,
  selectedReserveCurrency$,
]).pipe(
  filter(([r, c, s]) => !!r && !!c && !!s),
  map(([reserveData, compReserveData, symbol]) => {
    const note = reserveData.find(({ symbol: s }) => s === 'NOTE');
    const weth = reserveData.find(({ symbol: s }) => s === 'WETH');

    let maxReserveAmount: string;
    if (symbol === 'COMP') {
      maxReserveAmount = ethers.utils.formatUnits(compReserveData.treasuryBalance, 18);
    } else {
      maxReserveAmount = reserveData
        .find(({ symbol: s }) => s === symbol)!
        .treasuryBalance.toExactString();
    }

    return {
      maxNOTEAmount: note!.treasuryBalance.toExactString(),
      maxETHAmount: weth!.treasuryBalance.toExactString(),
      maxReserveAmount,
    };
  })
);
