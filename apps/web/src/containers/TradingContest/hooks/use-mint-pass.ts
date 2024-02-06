import {
  NotionalContestPass,
  NotionalContestPassABI,
} from '@notional-finance/contracts';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { Contract } from 'ethers';
import { ContestPartners, CURRENT_CONTEST_ID } from '../contest-config';
import { CommunityId } from '@notional-finance/notionable';
import { useCallback, useEffect, useState } from 'react';
import {
  useNotionalContext,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';

export const NotionalPass = new Contract(
  '0xbBEF91111E9Db19E688B495972418D8ebC11F008',
  NotionalContestPassABI,
  getProviderFromNetwork(Network.ArbitrumOne)
) as NotionalContestPass;

export function useMintPass() {
  const {
    onSubmit,
    isWalletConnectedToNetwork,
    isReadOnlyAddress,
    transactionHash,
    transactionStatus,
  } = useTransactionStatus(Network.ArbitrumOne);
  const {
    globalState: { communityMembership, wallet },
  } = useNotionalContext();
  const community = communityMembership?.find((c) =>
    ContestPartners.includes(c.name)
  );
  const [mintedAddress, setMintedAddress] = useState<string | undefined>(
    wallet?.selectedAddress
  );

  useEffect(() => {
    if (wallet?.selectedAddress) setMintedAddress(wallet?.selectedAddress);
  }, [wallet?.selectedAddress]);

  const onMintPass = useCallback(async () => {
    if (!isWalletConnectedToNetwork || isReadOnlyAddress || !mintedAddress)
      return;

    const communityId = community?.name ? CommunityId[community.name] : 0;
    const txn = await NotionalPass.populateTransaction.safeMint(
      mintedAddress,
      CURRENT_CONTEST_ID,
      communityId
    );

    onSubmit('Mint Contest Pass', txn);
  }, [
    onSubmit,
    isWalletConnectedToNetwork,
    isReadOnlyAddress,
    community?.name,
    mintedAddress,
  ]);

  return {
    onMintPass,
    isWalletConnectedToNetwork,
    isReadOnlyAddress,
    transactionHash,
    transactionStatus,
    mintedAddress,
    setMintedAddress,
    community
  };
}
