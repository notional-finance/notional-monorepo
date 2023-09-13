import { useEffect } from 'react';
import { getProviderURLFromNetwork } from '@notional-finance/util';
import {
  useSelectedNetwork,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import { useHistory, useLocation } from 'react-router-dom';
import { BETA_ACCESS } from '@notional-finance/notionable';

export const useNftContract = (selectedAddress?: string) => {
  const selectedNetwork = useSelectedNetwork();
  const history = useHistory();
  const { pathname } = useLocation();
  const {
    updateNotional,
    globalState: { hasContestNFT },
  } = useNotionalContext();

  useEffect(() => {
    if (!hasContestNFT) {
      if (pathname.includes('contest')) {
        history.push(pathname);
      } else {
        history.push('/contest');
      }
    }
  }, [history, hasContestNFT, pathname]);

  useEffect(() => {
    if (selectedNetwork && selectedAddress && !hasContestNFT) {
      const providerURL = getProviderURLFromNetwork(selectedNetwork, true);
      const url = `${providerURL}/getNFTs?owner=${selectedAddress}&contractAddresses[]=0x965b3aad78cdab2cc778243b12705ba3b7c5048c&withMetadata=false`;
      updateNotional({ hasContestNFT: BETA_ACCESS.PENDING });

      fetch(url)
        .then((resp) => resp.json())
        .then((resp) => {
          try {
            if (resp['totalCount'] > 0) {
              updateNotional({
                hasContestNFT: BETA_ACCESS.CONFIRMED,
                contestTokenId: resp['ownedNfts'][0]['id']['tokenId'],
              });
            } else {
              updateNotional({ hasContestNFT: BETA_ACCESS.REJECTED });
            }
          } catch (error) {
            console.warn(error);
            updateNotional({ hasContestNFT: BETA_ACCESS.REJECTED });
          }
        });
    }
  }, [updateNotional, selectedAddress, selectedNetwork, hasContestNFT]);
};

export default useNftContract;
