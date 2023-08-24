export const graphQueries = {
  BalancerV2SwapFee: `
    query BalancerV2SwapFee($poolId: String, $ts: Int) {
        poolSnapshots(
          first: 2
          orderBy: timestamp
          orderDirection: desc
          where: {timestamp_lte: $ts, pool_: {id: $poolId}}
        ) {
          swapFees
        }
      }
    `,
  CurveSwapFee: `
    query CurveSwapFee($poolId: String, $ts: Int) {
        liquidityPoolDailySnapshots(
          first: 1
          orderBy: timestamp
          orderDirection: desc
          where: {timestamp_lte: $ts, pool_: {id: $poolId}}
        ) {
          dailyProtocolSideRevenueUSD
        }
    }
    `,
  NotionalV3nTokenDailyFees: `
    query nTokenDailyFees($currencyId: Int, $ts: Int, $dayStart: Int) {
        transfers(
          where: {
            toSystemAccount: "FeeReserve", 
            transferType: "Transfer", 
            token_: {
              currencyId: $currencyId
            },
            timestamp_gt: $dayStart, 
            timestamp_lt: $ts
          }
        ) {
          valueInUnderlying
          token {
              underlying {
                decimals
            }
          }
        }
        currencyConfigurations(where: {id: $currencyId}) {
          fCashReserveFeeSharePercent
        }
    }
    `,
};
