import { getProvider, setInLocalStorage } from '@notional-finance/util';
import Notional from '@notional-finance/sdk';
import { updateNotionalState } from './notional-store';
import { reportNotionalError } from '../error/error-manager';
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

function destroyNotional() {
  updateWalletState(initialWalletState);
  updateCurrencyState(initialCurrencyState);
  updateAccountState({ ...initialAccountState, readOnlyAddress: undefined });
  updateMarketState(initialMarketState);
  _connectedNetwork = -1;
  setInLocalStorage('selectedChain', null);
  updateNotionalState({ connectedChain: -1, loaded: false, notional: null });
}
