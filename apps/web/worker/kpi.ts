import {
  ChartType,
  initializeTokenBalanceRegistry,
  TokenBalance,
} from '@notional-finance/core-entities';
import {
  formatNumberAsPercent,
  getNowSeconds,
  Network,
  SECONDS_IN_HOUR,
} from '@notional-finance/util';

export async function calculateKPI(viewCacheR2: R2Bucket) {
  const kpiCache = await viewCacheR2.get(`${Network.mainnet}/v4/kpi`);
  if (kpiCache) {
    const cache = (await kpiCache.json()) as {
      lastUpdated: number;
      highestUSDC: string;
      highestETH: string;
      totalTVL: string;
    };
    if (cache.lastUpdated > getNowSeconds() - SECONDS_IN_HOUR) {
      return cache;
    }
  }

  const models = initializeTokenBalanceRegistry();
  await Promise.all(models.map((m) => m.triggerRefresh(true)));
  const mainnet = models.find((m) => m.network === Network.mainnet);
  const all = models.find((m) => m.network === Network.all);
  if (!mainnet || !all) return;

  // Update the landing page stats
  const allVaults = mainnet.getAllListedVaults(false);
  await Promise.all(
    allVaults.map((v) =>
      mainnet.fetchTimeSeriesData(v.vaultToken.id, ChartType.APY)
    )
  );
  const allVaultsWithYield = mainnet.getAllListedVaultsWithYield();
  const USD = all.getTokenBySymbol('USD');

  const totalTVL = allVaultsWithYield.reduce(
    (acc, v) => acc.add(v.tvl?.toFiat('USD') || TokenBalance.zero(USD)),
    TokenBalance.zero(USD)
  );

  const highestUSDC = allVaultsWithYield
    .filter((v) => v.underlying?.symbol === 'USDC')
    .reduce(
      (max, v) =>
        v.apy?.totalAPY && max < v.apy.totalAPY ? v.apy.totalAPY : max,
      0
    );
  const highestETH = allVaultsWithYield
    .filter((v) => v.underlying?.symbol === 'WETH')
    .reduce(
      (max, v) =>
        v.apy?.totalAPY && max < v.apy.totalAPY ? v.apy.totalAPY : max,
      0
    );

  const result = {
    lastUpdated: getNowSeconds(),
    highestUSDC: formatNumberAsPercent(highestUSDC, 2),
    highestETH: formatNumberAsPercent(highestETH, 2),
    totalTVL: totalTVL.toDisplayStringWithSymbol(2, true, false),
  };
  await viewCacheR2.put(`${Network.mainnet}/v4/kpi`, JSON.stringify(result));

  return result;
}
