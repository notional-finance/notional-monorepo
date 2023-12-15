import { useEffect, useState } from 'react';
import { getProviderURLFromNetwork } from '@notional-finance/util';
import {
  useSelectedNetwork,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import { useHistory, useLocation } from 'react-router-dom';
import { BETA_ACCESS } from '@notional-finance/notionable';

const NFT = '0x7c2d3a5fa3b41f4e6e2086bb19372016a7533f3e';

export const useNftContract = (selectedAddress?: string) => {
  const selectedNetwork = useSelectedNetwork();
  const history = useHistory();
  const { pathname } = useLocation();
  const [pending, setPending] = useState(false);
  const {
    updateNotional,
    globalState: { hasContestNFT, isAccountReady },
  } = useNotionalContext();

  useEffect(() => {
    if (!hasContestNFT) {
      if (pathname.includes('error')) return;

      if (pathname.includes('contest')) {
        history.push(pathname);
      } else {
        history.push('/contest');
      }
    }
  }, [history, hasContestNFT, pathname]);

  useEffect(() => {
    if (
      selectedNetwork &&
      selectedAddress &&
      isAccountReady &&
      !pending &&
      !hasContestNFT
    ) {
      const providerURL = getProviderURLFromNetwork(selectedNetwork, true);
      const url = `${providerURL}/getNFTs?owner=${selectedAddress}&contractAddresses[]=${NFT}&withMetadata=false`;
      setPending(true);
      updateNotional({ hasContestNFT: BETA_ACCESS.PENDING });

      fetch(url)
        .then((resp) => resp.json())
        .then((resp) => {
          setPending(false);
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
  }, [
    updateNotional,
    selectedAddress,
    selectedNetwork,
    hasContestNFT,
    isAccountReady,
    pending,
  ]);
};

export default useNftContract;
