import { useEffect } from 'react';
import { Contract } from 'ethers';
import { NftContract, NftContractABI } from '@notional-finance/contracts';
import { getProviderFromNetwork } from '@notional-finance/util';
import {
  useSelectedNetwork,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import { useHistory, useLocation } from 'react-router-dom';
import {
  getFromLocalStorage,
  setInLocalStorage,
} from '@notional-finance/helpers';

export enum BETA_ACCESS {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export const useNftContract = () => {
  const selectedNetwork = useSelectedNetwork();
  const history = useHistory();
  const { pathname } = useLocation();
  const {
    globalState: { wallet },
  } = useNotionalContext();
  const userSettings = getFromLocalStorage('userSettings');
  const onboardWallet = getFromLocalStorage('onboard.js:last_connected_wallet');

  useEffect(() => {
    if (!onboardWallet || onboardWallet.length === 0) {
      setInLocalStorage('userSettings', {
        ...userSettings,
        betaAccess: undefined,
      });
    }
  }, [onboardWallet, userSettings]);

  useEffect(() => {
    if (
      userSettings.betaAccess === BETA_ACCESS.REJECTED ||
      userSettings.betaAccess === undefined
    ) {
      if (pathname.includes('contest')) {
        history.push(pathname);
      } else {
        history.push('/contest');
      }
    }
  }, [history, userSettings.betaAccess, pathname]);

  if (
    selectedNetwork &&
    wallet?.selectedAddress &&
    wallet?.selectedAddress !== userSettings.currentAddress
  ) {
    const provider = getProviderFromNetwork(selectedNetwork);

    const nft = new Contract(
      '0x965b3aad78cdab2cc778243b12705ba3b7c5048c',
      NftContractABI,
      provider
    ) as NftContract;

    nft
      .balanceOf(wallet?.selectedAddress)
      .then((res) => {
        if (res.isZero()) {
          setInLocalStorage('userSettings', {
            ...userSettings,
            betaAccess: BETA_ACCESS.REJECTED,
            currentAddress: wallet?.selectedAddress,
          });
        } else {
          setInLocalStorage('userSettings', {
            ...userSettings,
            currentAddress: wallet?.selectedAddress,
            betaAccess: BETA_ACCESS.CONFIRMED,
          });
        }
      })
      .catch((error) => {
        console.warn(error);
        setInLocalStorage('userSettings', {
          ...userSettings,
          currentAddress: wallet?.selectedAddress,
          betaAccess: BETA_ACCESS.REJECTED,
        });
      });
  }
};

export default useNftContract;
