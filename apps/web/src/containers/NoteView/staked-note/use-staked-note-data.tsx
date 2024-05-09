import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { useFiat, useStakedNOTE } from '@notional-finance/notionable-hooks';
import { Network, SECONDS_IN_DAY } from '@notional-finance/util';

export function useStakedNoteData(_dateRange = 30 * SECONDS_IN_DAY) {
  const sNOTE = useStakedNOTE();
  const baseCurrency = useFiat();
  let currentSNOTEPrice: TokenBalance | undefined;
  let totalSNOTEValue: TokenBalance | undefined;
  let currentSNOTEYield: number | undefined;

  const oracles = Registry.getOracleRegistry();
  const sNOTEOracle = Registry.getNOTERegistry().sNOTEOracle;
  // TODO: move this logic into the observables
  if (
    Registry.getNOTERegistry().isNetworkRegistered(Network.mainnet) &&
    oracles.isKeyRegistered(Network.mainnet, sNOTEOracle)
  ) {
    currentSNOTEPrice = TokenBalance.unit(sNOTE).toFiat(baseCurrency);
    totalSNOTEValue = Registry.getNOTERegistry()
      .getTotalSNOTE()
      ?.toFiat(baseCurrency);
    currentSNOTEYield = 22.31;
  }

  return {
    currentSNOTEPrice,
    totalSNOTEValue,
    currentSNOTEYield,
    // annualizedRewardRate,
    // historicalSNOTEPrice,
    // walletNOTEBalance,
    // walletSNOTEBalance,
  };
}
