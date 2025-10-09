import {
  ChartType,
  initializeTokenBalanceRegistry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { formatNumberAsPercent, Network } from '@notional-finance/util';

export async function calculateKPI() {
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

  return {
    totalTVL: totalTVL.toDisplayStringWithSymbol(2, true, false),
    highestUSDC: formatNumberAsPercent(highestUSDC, 2),
    highestETH: formatNumberAsPercent(highestETH, 2),
  };

  // await putStorageKey(
  //   env,
  //   `${mainnet.network}/kpi`,
  //   JSON.stringify({
  //     totalTVL: totalTVL.toDisplayStringWithSymbol(2, true, false),
  //     highestUSDCAPY: formatNumberAsPercent(highestUSDCAPY, 2),
  //     highestETHAPY: formatNumberAsPercent(highestETHAPY, 2),
  //   })
  // );
}
