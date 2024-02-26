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
  NotionalV3Accounts: `
    query NotionalV3Accounts($size: Int, $offset: Int) {
      accounts(first: $size, skip: $offset, where: {systemAccountType: "None"}) {
        id
      }
    }
    `,
  NotionalV3VaultAccounts: `
    query NotionalV3VaultAccounts($size: Int, $offset: Int) {
      balances(
        first: $size
        skip: $offset
        where: {account_: {systemAccountType: "None"}, token_: {tokenType_in: ["VaultShare"]}}
      ) {
        account {
          id
        }
        token {
          vaultAddress
        }
      }
    }
    `,
  NotionalV3VaultReinvestments: `
  query NotionalV3VaultReinvestments($vault: String) {
    reinvestments(
      orderBy: timestamp,
      orderDirection:desc,
      first:1,
      where:{vault: $vault}
    ) {
      timestamp
      vault { id }
    }
  }
  `,
};
