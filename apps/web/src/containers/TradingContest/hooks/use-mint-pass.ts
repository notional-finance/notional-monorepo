import {
  NotionalContestPass,
  NotionalContestPassABI,
} from '@notional-finance/contracts';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { Contract } from 'ethers';
import { ContestPartners, contestId } from '../contest-config';
import { CommunityId } from '@notional-finance/notionable';
import { useCallback } from 'react';
import {
  useNotionalContext,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';

const NotionalPass = new Contract(
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
    globalState: { communityMembership },
  } = useNotionalContext();
  const community = communityMembership?.find((c) =>
    ContestPartners.includes(c.name)
  )?.name;

  const onMintPass = useCallback(
    async (address: string) => {
      if (!isWalletConnectedToNetwork || !isReadOnlyAddress) return;

      const communityId = community ? CommunityId[community] : 0;
      const txn = await NotionalPass.populateTransaction.safeMint(
        address,
        contestId,
        communityId
      );

      onSubmit('Mint Contest Pass', txn);
    },
    [onSubmit, isWalletConnectedToNetwork, isReadOnlyAddress, community]
  );

  return {
    onMintPass,
    isWalletConnectedToNetwork,
    isReadOnlyAddress,
    transactionHash,
    transactionStatus,
  };
}
