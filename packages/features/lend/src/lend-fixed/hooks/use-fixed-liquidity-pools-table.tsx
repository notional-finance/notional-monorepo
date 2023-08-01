import { useContext } from 'react';
import { LendFixedContext } from '../../lend-fixed/lend-fixed';
import { useFCashMarket } from '@notional-finance/notionable-hooks';
import { getNowSeconds } from '@notional-finance/util';
import { RATE_PRECISION } from '@notional-finance/util';

export const useFixedLiquidityPoolsTable = (selectedDepositToken) => {
  const {
    state: { deposit },
  } = useContext(LendFixedContext);
  const fCashMarket = useFCashMarket(deposit?.currencyId);

  if (fCashMarket) {
    const {
      poolParams: { perMarketCash, perMarketfCash },
    } = fCashMarket;
    // const markets = [...perMarketCash, ...perMarketfCash];
    // console.log(perMarketfCash[0].maturity);
    // console.log({ markets });

    // Maturity: fCashMarket.poolParams.perMarketfCash.maturitiy
    // Value of Cash: fCashMarket.poolParams.perMarketCash.toUnderlying().toDisplayString(3, true)
    // Value of fCash: fCashMarket.poolParams.perMarketfCash.toUnderlying().toDisplayString(3, true)
    // Price: fCashMarket.getfCashExchangeRate(
    // Math.floor(interestRate * RATE_PRECISION / 100)
    // (fCashMarket.poolParams.perMarketfCash.token.maturity || 0)  - getNowSeconds())
    // Price: RATE_PRECISION / Returned exchangeRate
    // *(price value returned from above)
    // Interest Rate: fCashMarket.getSpotInterestRate(fCashMarket.poolParams.perMarketfCash.token)
    console.log({ selectedDepositToken });
    const tableData = perMarketfCash.map((data, index) => {
      const interestRate = fCashMarket.getSpotInterestRate(data.token);
      const currentPrice = interestRate
        ? RATE_PRECISION /
          fCashMarket.getfCashExchangeRate(
            Math.floor((interestRate * RATE_PRECISION) / 100),
            data.maturity || 0 - getNowSeconds()
          )
        : 0;
      console.log(currentPrice);
      return {
        maturity: data.maturity,
        valueOfCash: perMarketCash[index]
          .toUnderlying()
          .toDisplayString(3, true),
        valueOfFCash: data.toUnderlying().toDisplayString(3, true),
        price: currentPrice,
        interestRate: interestRate,
      };
    });
    console.log({ tableData });
  }

  return {};
};

export default useFixedLiquidityPoolsTable;
