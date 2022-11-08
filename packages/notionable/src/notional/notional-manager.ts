import { getProvider, setInLocalStorage } from '@notional-finance/utils';
import Notional from '@notional-finance/sdk';
import { OnboardState, onboardState$ } from '../onboard/onboard-store';
import { updateNotionalState } from './notional-store';
import { filter } from 'rxjs';
import { chainIds as supportedChainIds } from '../chains';
import { reportNotionalError } from '../error/error-manager';
import { setChain } from '../onboard/onboard-manager';
import {
  initialAccountState,
  updateAccountState,
} from '../account/account-store';
import { updateMarketState, initialMarketState } from '../market/market-store';
import {
  initialCurrencyState,
  updateCurrencyState,
} from '../currency/currency-store';
import { initialWalletState, updateWalletState } from '../wallet/wallet-store';
import {
  initialVaultState,
  updateVaultState,
} from '../leveraged-vaults/vault-store';

let _connectedNetwork = -1;

export const initializeNotional = async (networkId: number) => {
  try {
    destroyNotional();
    const rpcProvider = getProvider(networkId);
    const notional = await Notional.load(networkId, rpcProvider);
    updateNotionalState({ connectedChain: networkId, loaded: true, notional });
    setInLocalStorage('selectedChain', networkId);
    _connectedNetwork = networkId;
  } catch (e) {
    reportNotionalError(
      {
        ...(e as Error),
        msgId: 'notional.error.unsupportedChain',
        code: 500,
      },
      'notional-manager',
      'initializeNotional'
    );
  }
};

async function handleWalletConnections({ chain }: OnboardState) {
  const chainId = parseInt(chain!.id);
  const chainSupported = supportedChainIds.includes(chainId);

  // The wallet is connected to a supported chain and Notional is connected to a different chain
  if (
    chainSupported &&
    chainId !== _connectedNetwork &&
    _connectedNetwork !== -1
  ) {
    updateNotionalState({ pendingChainId: chainId });
  } else if (!chainSupported && _connectedNetwork !== -1) {
    // The wallet is connected to a chain that isn't supported and Notional is connected to a different chain
    const ableToSetChain = await setChain(_connectedNetwork);
    if (!ableToSetChain) {
      reportNotionalError(
        {
          name: 'Unsupported Chain',
          message: 'Unsupported Chain',
          msgId: 'notional.error.unsupportedChain',
          code: 500,
        },
        'notional-manager',
        'handleWalletConnections'
      );
    }
  } else if (chainSupported && _connectedNetwork === -1) {
    // The wallet is connected to a supported chain and Notional isn't connected to a chain
    updateNotionalState({ pendingChainId: chainId });
  }
}

function destroyNotional() {
  updateWalletState(initialWalletState);
  updateCurrencyState(initialCurrencyState);
  updateAccountState({ ...initialAccountState, readOnlyAddress: undefined });
  updateMarketState(initialMarketState);
  updateVaultState(initialVaultState);
  _connectedNetwork = -1;
  setInLocalStorage('selectedChain', null);
  updateNotionalState({ connectedChain: -1, loaded: false, notional: null });
}

onboardState$
  .pipe(filter(({ connected, chain }) => connected && !!chain))
  .subscribe(handleWalletConnections);
