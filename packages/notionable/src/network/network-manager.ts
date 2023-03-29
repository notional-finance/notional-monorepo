import {
  getFromLocalStorage,
  getNetworkIdFromHostname,
} from '@notional-finance/util';
import { initializeNotional } from '../notional/notional-manager';
import {
  initializeOnboard,
  connectWallet,
  setChain,
} from '../onboard/onboard-manager';
import { OnboardOptions } from '../types';
import { chainIds as supportedChainIds, chainEntities } from '../chains';
import { log } from '@notional-finance/logging';

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

    const chainId = getDefaultNetwork();
    await initializeNotional(chainId);
    if (wallet && typeof wallet === 'string') {
      await connectWallet(wallet);
    }
  } catch (e) {
    log({
      message: 'Failed to initialize network',
      level: 'error',
    });
    throw new Error('Failed to initialize network');
  }
}

export async function switchNetwork(id: string | number) {
  const chainId = typeof id === 'string' ? parseInt(id) : id;
  try {
    const chainSupported = supportedChainIds.includes(chainId);
    if (chainSupported) {
      const walletConnected = await setChain(chainId);
      if (!walletConnected) {
        initializeNotional(chainId);
      }
    } else {
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
