import { getProvider, setInLocalStorage } from '../utils';
import Notional from '@notional-finance/sdk-v2';
import { OnboardState, onboardState$ } from '../onboard/onboard-store';
import { updateNotionalState } from './notional-store';
import { filter } from 'rxjs';
import { chainIds as supportedChainIds } from '../chains';
import { reportError } from '../error/error-manager';
import { setChain } from '../onboard/onboard-manager';
import { initialAccountState, updateAccountState } from '../account/account-store';
import { updateMarketState, initialMarketState } from '../market/market-store';
import { initialCurrencyState, updateCurrencyState } from '../currency/currency-store';
import { initialWalletState, updateWalletState } from '../wallet/wallet-store';

let _connectedNetwork = -1;
let _notional: Notional | null = null;

export function getNotional() {
  return _notional;
}

export const initializeNotional = async (networkId: number) => {
  try {
    _notional = await loadNotional(networkId);
    setInLocalStorage('selectedChain', networkId);
    _connectedNetwork = networkId;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to initialize Notional');
  }
};

async function handleWalletConnections({ connected, chain }: OnboardState) {
  const chainId = parseInt(chain!.id);
  const chainSupported = supportedChainIds.includes(chainId);

  // The wallet is connected to a supported chain and Notional is connected to a different chain
  if (chainSupported && chainId !== _connectedNetwork && _connectedNetwork !== -1) {
    destroyNotional();
    await initializeNotional(chainId);
  } else if (!chainSupported && _connectedNetwork !== -1) {
    // The wallet is connected to a chain that isn't supported and Notional is connected to a different chain
    const ableToSetChain = await setChain(_connectedNetwork);
    if (!ableToSetChain) {
      reportError({
        name: 'Unsupported Chain',
        message: 'Unsupported Chain',
        msgId: 'notional.error.unsupportedChain',
        code: 500,
      });
    }
  } else if (chainSupported && _connectedNetwork === -1) {
    // The wallet is connected to a supported chain and Notional isn't connected to a chain
    await initializeNotional(chainId);
  }
}

/* function handleNetworkChange(networkId: number) {
  checkConnectedChain(networkId);
} */

async function loadNotional(network: number) {
  try {
    const rpcProvider = getProvider(network);
    const notional = await Notional.load(network, rpcProvider);
    updateNotionalState({ connectedChain: network, loaded: true, notional });
    return notional;
  } catch (error) {
    throw new Error("Couldn't load Notional");
    console.error(error);
  }
}

function destroyNotional() {
  updateWalletState(initialWalletState);
  updateCurrencyState(initialCurrencyState);
  updateAccountState({ ...initialAccountState, readOnlyAddress: undefined });
  updateMarketState(initialMarketState);
  if (_notional && _notional.system) {
    _notional.destroy();
  }
  _notional = null;
  _connectedNetwork = -1;
  setInLocalStorage('selectedChain', null);
  updateNotionalState({ connectedChain: -1, loaded: false, notional: null });
}

onboardState$
  .pipe(filter(({ connected, chain }) => connected && !!chain))
  .subscribe(handleWalletConnections);
