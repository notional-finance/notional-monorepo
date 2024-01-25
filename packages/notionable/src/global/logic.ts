import { Network, getProviderURLFromNetwork } from '@notional-finance/util';
import { BETA_ACCESS, ACCESS_NFTS } from './global-state';
import { identify } from '@notional-finance/helpers';
import { AccountFetchMode, Registry } from '@notional-finance/core-entities';

export function onSelectedNetworkChange(
  cacheHostname: string,
  selectedNetwork: Network,
  previousNetwork?: Network
) {
  // This is a no-op if the registry is already initialized
  Registry.initialize(cacheHostname, AccountFetchMode.SINGLE_ACCOUNT_DIRECT);

  if (
    previousNetwork === selectedNetwork &&
    Registry.isRefreshRunning(selectedNetwork)
  ) {
    // No change
    return;
  } else if (
    Registry.isRefreshRunning(selectedNetwork) &&
    previousNetwork &&
    previousNetwork !== selectedNetwork
  ) {
    // Stop refresh and start a new one below
    Registry.stopRefresh(previousNetwork);
  }

  return {
    isNetworkReady: false,
    isNetworkPending: true,
  };
}

export async function onNetworkPending(selectedNetwork: Network) {
  const isNetworkReady = await new Promise<boolean>((resolve) => {
    Registry.startRefresh(selectedNetwork);
    Registry.onNetworkReady(selectedNetwork, () => {
      Registry.getYieldRegistry().onNetworkRegistered(selectedNetwork, () => {
        resolve(true);
      });
    });
  });
  return { isNetworkReady, isNetworkPending: false };
}

export async function onAccountPending(
  selectedAccount: string,
  selectedNetwork: Network,
  walletLabel: string
) {
  const isAccountReady = await new Promise<boolean>((resolve) => {
    Registry.getAccountRegistry().onAccountReady(
      selectedNetwork,
      selectedAccount,
      (a) => {
        const tokenBalances = a.balances.reduce((acc, data) => {
          if (data.tokenType === 'Underlying') {
            return {
              ...acc,
              [data.token.symbol]: data.toFloat(),
            };
          }
          return acc;
        }, {})
        identify(a.address, selectedNetwork, walletLabel, JSON.stringify(tokenBalances));
        resolve(true);
      }
    );
  });

  let hasContestNFT;
  let partnerData;
  let contestTokenId;

  for (const data in ACCESS_NFTS) {
    const key = data as keyof typeof ACCESS_NFTS; 
    const currentPartnerData = ACCESS_NFTS[key];
    const providerURL = getProviderURLFromNetwork(currentPartnerData.network, true);
    const url = `${providerURL}/getNFTs?owner=${selectedAccount}&contractAddresses[]=${currentPartnerData.address}&withMetadata=false`;  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.totalCount > 0) {
        hasContestNFT = BETA_ACCESS.CONFIRMED;
        contestTokenId = data.ownedNfts[0].id.tokenId;
        partnerData = currentPartnerData;
      } else {
        hasContestNFT = BETA_ACCESS.REJECTED;
      }
    } catch (error) {
      console.warn(error);
      hasContestNFT = BETA_ACCESS.REJECTED;
    }
  }



  return {
    isAccountReady,
    isAccountPending: false,
    hasContestNFT,
    partnerData,
    contestTokenId,
  };
}

export async function disconnectAccount(selectedNetwork: Network) {
  Registry.getAccountRegistry().stopRefresh(selectedNetwork);
}
