import {
  ChartType,
  initializeTokenBalanceRegistry,
} from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { getSnapshot } from 'mobx-state-tree';

export async function fetchYields() {
  const models = initializeTokenBalanceRegistry();
  await Promise.all(models.map((m) => m.triggerRefresh(true)));
  const mainnet = models.find((m) => m.network === Network.mainnet);
  if (!mainnet) return [];

  const allVaults = mainnet.getAllListedVaults().filter((v) => v.isVisible);
  await Promise.all(
    allVaults.map((v) =>
      mainnet.fetchTimeSeriesData(v.vaultAddress, ChartType.APY)
    )
  );
  const allVaultsWithYield = mainnet
    .getAllListedVaultsWithYield()
    .filter((v) => v.vaultConfig.isVisible);

  return (
    allVaultsWithYield?.map((v) => ({
      chain: Network.mainnet,
      vaultAddress: v.vaultConfig.vaultAddress,
      symbol: v.token?.symbol,
      apyBase: v.apy?.totalAPY,
      tvlUSD: v.tvl?.toFiat('USD').toFloat(),
      underlying: [v.underlying?.id],
      poolMeta: 'Notional Exponent Vault',
      rewardTokens: getSnapshot(v.vaultConfig.rewards).map((r) => r.token),
    })) || []
  );
}
