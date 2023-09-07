import { Contract } from 'ethers';
import { NftContract, NftContractABI } from '@notional-finance/contracts';
import { getProviderFromNetwork } from '@notional-finance/util';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import {
  getFromLocalStorage,
  setInLocalStorage,
} from '@notional-finance/helpers';
import { useConnect } from './use-connect';

export enum BETA_ACCESS {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export const useNftContract = () => {
  const selectedNetwork = useSelectedNetwork();
  const { selectedAddress } = useConnect();
  const userSettings = getFromLocalStorage('userSettings');

  if (selectedNetwork && selectedAddress) {
    const provider = getProviderFromNetwork(selectedNetwork);

    const nft = new Contract(
      '0x965b3aad78cdab2cc778243b12705ba3b7c5048c',
      NftContractABI,
      provider
    ) as NftContract;

    nft
      .balanceOf(selectedAddress)
      .then((res) => {
        setInLocalStorage('userSettings', {
          ...userSettings,
          betaAccess: BETA_ACCESS.PENDING,
        });
        return res;
      })
      .then((res) => {
        if (res.isZero()) {
          setInLocalStorage('userSettings', {
            ...userSettings,
            betaAccess: BETA_ACCESS.REJECTED,
          });
        } else {
          setInLocalStorage('userSettings', {
            ...userSettings,
            betaAccess: BETA_ACCESS.CONFIRMED,
          });
        }
      })
      .catch((error) => {
        console.warn(error);
        setInLocalStorage('userSettings', {
          ...userSettings,
          betaAccess: BETA_ACCESS.REJECTED,
        });
      });
  }
};

export default useNftContract;
