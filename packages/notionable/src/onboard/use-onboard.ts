import { initialOnboardState, onboardState$ } from './onboard-store';
import {
  resetAllWallets,
  resetWallet,
  supportedWallets,
  connectWallet,
  setChain,
} from './onboard-manager';
import { useObservableState } from 'observable-hooks';

export function useOnboard() {
  const {
    connected,
    signer,
    label,
    icon,
    address,
    chain,
    chains,
    modules,
    accounts,
  } = useObservableState(onboardState$, initialOnboardState);

  function getTruncatedAddress() {
    return address && address.length > 0
      ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}`
      : '';
  }

  function formatAddressTruncated(address: string) {
    return `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;
  }

  return {
    connected,
    signer,
    label,
    icon,
    address,
    chain,
    chains,
    modules,
    accounts,
    resetWallet,
    resetAllWallets,
    getTruncatedAddress,
    formatAddressTruncated,
    supportedWallets,
    connectWallet,
    setChain,
  };
}
