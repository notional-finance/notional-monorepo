import { Contract } from 'ethers';
import { useState } from 'react';
import { NftContract, NftContractABI } from '@notional-finance/contracts';
import { getProviderFromNetwork } from '@notional-finance/util';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { useConnect } from '@notional-finance/wallet/hooks/use-connect';

export enum BETA_ACCESS {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export const useNftContract = () => {
  const selectedNetwork = useSelectedNetwork();
  const { selectedAddress } = useConnect();
  const [betaAccess, setBetaAccess] = useState<BETA_ACCESS>(
    BETA_ACCESS.PENDING
  );

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
        res.isZero()
          ? setBetaAccess(BETA_ACCESS.REJECTED)
          : setBetaAccess(BETA_ACCESS.CONFIRMED);
      })
      .catch((error) => {
        console.warn(error);
        setBetaAccess(BETA_ACCESS.REJECTED);
      });
  }
  return betaAccess;
};

export default useNftContract;
