import { getVaultDocsLink } from '@notional-finance/core-entities';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';

export interface VaultsDataProps {
  vaultName: string;
  baseProtocol: string;
  boosterProtocol: string;
  primaryBorrowCurrency: string;
  poolName: string;
  docsLink: string;
}

export const useVaultNameInfo = () => {
  const trade = useCurrentTradeContext();
  const selectedNetwork = trade?.selectedNetwork;
  const vaultAddress = trade?.vaultAddress;
  const { deposit } = trade?.selectedTokens ?? {};
  const { baseProtocol, boosterProtocol, poolName, name } =
    trade?.vaultName ?? {};
  const docsLink = getVaultDocsLink(vaultAddress, selectedNetwork);

  if (!baseProtocol) return undefined;

  return {
    name,
    baseProtocol,
    boosterProtocol,
    primaryBorrowCurrency: deposit?.symbol,
    poolName,
    docsLink,
  };
};
