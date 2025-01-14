import { COMMUNITY_NAMES, CommunityId } from '@notional-finance/notionable';
import { useSubmitTxn, useWalletCommunities } from './use-wallet';
import { BigNumber } from 'ethers';
import {
  NotionalContestPass,
  NotionalContestPassABI,
} from '@notional-finance/contracts';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { Contract } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { useWalletStore } from './context/use-root-store';

export const showContestNavLink = true;
// Millisecond time stamp for Feb 26th 10:00 AM EST
export const contestStartDate = 1708959600000;
// Millisecond time stamp for Mar 25th 10:00 AM EST
export const contestEndDate = 1711375200000;

const date = new Date();
const currentDate = moment(date);
// If the startDate is before the current date, the contest is active. In the future we could add a additional check to hide things once the end date has passed.
export const contestActive = moment(contestStartDate).isBefore(currentDate);
export const contestOver = moment(contestEndDate).isBefore(currentDate);

export const contestCountDownDate = contestActive
  ? contestEndDate
  : contestStartDate;

export const startDateDisplayString = 'Feb 26th 10:00 AM EST';
export const endDateDisplayString = 'Mar 25th 10:00 AM EST';
export const CURRENT_CONTEST_ID = 1;

export const ContestPartners = [
  COMMUNITY_NAMES.L2DAO,
  COMMUNITY_NAMES.LLAMAS,
  COMMUNITY_NAMES.CRYPTO_TESTERS,
];

export const NotionalPass = new Contract(
  '0xbBEF91111E9Db19E688B495972418D8ebC11F008',
  NotionalContestPassABI,
  getProviderFromNetwork(Network.arbitrum)
) as NotionalContestPass;

export function useContestPass() {
  const communities = useWalletCommunities();
  const contestPass = communities?.find(
    (c) => c.name === COMMUNITY_NAMES.CONTEST_PASS
  );
  const [contestCommunity, setContestCommunity] = useState<
    COMMUNITY_NAMES | undefined
  >(undefined);
  const [passContestId, setContestId] = useState<number | undefined>(undefined);

  useEffect(() => {
    async function decodeId(tokenId: BigNumber) {
      const { communityId, contestId } = await NotionalPass.decodeTokenId(
        tokenId
      );
      setContestId(contestId);
      const communityName = Object.entries(CommunityId).find(
        ([, id]) => id === communityId
      );
      if (communityName)
        setContestCommunity(communityName[0] as COMMUNITY_NAMES);
    }

    if (contestPass?.tokenId) {
      decodeId(BigNumber.from(contestPass.tokenId));
    }
  }, [contestPass?.tokenId]);

  return {
    contestCommunity,
    hasContestPass: CURRENT_CONTEST_ID === passContestId,
  };
}

export function useMintPass() {
  const submitTxn = useSubmitTxn();
  const { transactionHash, transactionStatus, userWallet } = useWalletStore();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const community = undefined;
  const [mintedAddress, setMintedAddress] = useState<string | undefined>(
    undefined
  );

  const onMintPass = useCallback(async () => {
    setErrorMessage('');
    if (userWallet?.isReadOnlyAddress || !mintedAddress) return;
    const communityId = 0;
    const txn = await NotionalPass.populateTransaction.safeMint(
      mintedAddress,
      CURRENT_CONTEST_ID,
      communityId
    );

    submitTxn('Mint Contest Pass', txn);
    try {
      await NotionalPass.estimateGas.safeMint(
        mintedAddress,
        CURRENT_CONTEST_ID,
        communityId
      );
    } catch (e: any) {
      const message =
        e && e?.reason?.includes('token already minted')
          ? 'A pass has already been minted for this address'
          : 'Error occurred';
      setErrorMessage(message);
    }
  }, [submitTxn, userWallet?.isReadOnlyAddress, mintedAddress]);

  return {
    onMintPass,
    isReadOnlyAddress: userWallet?.isReadOnlyAddress,
    transactionHash,
    transactionStatus,
    mintedAddress,
    setMintedAddress,
    community,
    errorMessage,
  };
}
