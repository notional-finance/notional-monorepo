import { TokenBalance } from '@notional-finance/core-entities';
import { useNotionalContext } from './use-notional';
import { truncateAddress } from '@notional-finance/helpers';
import { Network } from '@notional-finance/util';
import { useFiat, useFiatToken } from './use-user-settings';
import { AccountRiskProfile } from '@notional-finance/risk-engine';

/** Contains selectors for account holdings information */

export function useAccountDefinition(network: Network | undefined) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();

  const account =
    network && networkAccounts ? networkAccounts[network] : undefined;

  return account?.accountDefinition;
}

export function useTotalIncentives(network: Network | undefined) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();

  return networkAccounts && network
    ? networkAccounts[network].totalIncentives || {}
    : {};
}

export function useAccountReady(network: Network | undefined) {
  return useAccountDefinition(network) !== undefined;
}

export function useTransactionHistory(network: Network | undefined) {
  const account = useAccountDefinition(network);
  return account?.accountHistory?.filter((h) => !h.isTransientLineItem) || [];
}

export function useVaultHoldings(network: Network | undefined) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  return networkAccounts && network
    ? networkAccounts[network].vaultHoldings || []
    : [];
}

export function usePortfolioHoldings(network: Network | undefined) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  return networkAccounts && network
    ? networkAccounts[network].portfolioHoldings || []
    : [];
}

export function useGroupedHoldings(network: Network | undefined) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  return networkAccounts && network
    ? networkAccounts[network].groupedHoldings || []
    : [];
}

export function useTruncatedAddress() {
  const {
    globalState: { wallet },
  } = useNotionalContext();

  return wallet?.selectedAddress
    ? truncateAddress(wallet?.selectedAddress)
    : '';
}

export function usePortfolioRiskProfile(network: Network | undefined) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  const profile =
    networkAccounts && network
      ? networkAccounts[network].riskProfile
      : undefined;
  return profile || new AccountRiskProfile([], network);
}

export function useAccountCurrentFactors(network: Network | undefined) {
  const baseCurrency = useFiat();
  const fiatToken = useFiatToken();
  const holdings = usePortfolioHoldings(network);
  const vaults = useVaultHoldings(network);

  const { weightedYield, netWorth, debts, assets } = vaults.reduce(
    ({ weightedYield, netWorth, debts, assets }, { totalAPY, vault }) => {
      const { debts: d, assets: a, netWorth: _w } = vault.getAllRiskFactors();
      const w = _w.toFiat(baseCurrency).toFloat();
      return {
        weightedYield: weightedYield + (totalAPY || 0) * w,
        netWorth: netWorth.add(_w.toFiat(baseCurrency)),
        debts: debts.add(d.toFiat(baseCurrency)),
        assets: assets.add(a.toFiat(baseCurrency)),
      };
    },
    holdings.reduce(
      (
        { weightedYield, netWorth, assets, debts },
        { marketYield, balance }
      ) => {
        const w = balance.toFiat(baseCurrency);
        return {
          weightedYield:
            weightedYield + (marketYield?.totalAPY || 0) * w.toFloat(),
          netWorth: netWorth.add(w),
          debts: balance.isNegative() ? debts.add(w) : debts,
          assets: balance.isPositive() ? assets.add(w) : assets,
        };
      },
      {
        weightedYield: 0,
        netWorth: TokenBalance.zero(fiatToken),
        debts: TokenBalance.zero(fiatToken),
        assets: TokenBalance.zero(fiatToken),
      }
    )
  );

  return {
    currentAPY: !netWorth.isZero()
      ? weightedYield / netWorth.toFloat()
      : undefined,
    netWorth,
    debts,
    assets,
  };
}
