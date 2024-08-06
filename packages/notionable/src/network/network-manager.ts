import {
  getFromLocalStorage,
  getNetworkIdFromHostname,
} from '@notional-finance/util';
import {
  initializeOnboard,
  connectWallet,
} from '../onboard/onboard-manager';
import { OnboardOptions } from '../types';
import { chainIds as supportedChainIds, chainEntities } from '../chains';

export async function initializeNetwork({
  enableAccountCenter = false,
  container = '#root',
}: OnboardOptions) {
  try {
    // Initialize onboard
    await initializeOnboard({
      enableAccountCenter,
      container,
    });

    // attempt to load selectedNetwork from localStorage
    const wallet = getFromLocalStorage('selectedWallet');

    if (wallet && typeof wallet === 'string') {
      await connectWallet(wallet);
    }
  } catch (e) {
    throw new Error('Failed to initialize network');
  }
}

export async function switchNetwork(id: string | number) {
  const chainId = typeof id === 'string' ? parseInt(id) : id;
  try {
    const chainSupported = supportedChainIds.includes(chainId);
    if (!chainSupported) {
      throw new Error('Unsupported Chain');
    }
  } catch (e) {
    console.error(e);
    throw new Error('Failed to initialize network');
  }
}

export function getDefaultNetwork() {
  const chainId = getFromLocalStorage('selectedChain');
  if (chainId && typeof chainId === 'string') {
    return parseInt(chainId);
  } else if (chainId && typeof chainId === 'number') {
    return chainId;
  }
  return getNetworkIdFromHostname(window.location.hostname);
}

export function getNetworkName(chainId: number | string) {
  const id =
    typeof chainId === 'number' ? `0x${chainId.toString(16)}` : chainId;
  const chain = chainEntities[id].label;
  return chain;
}
