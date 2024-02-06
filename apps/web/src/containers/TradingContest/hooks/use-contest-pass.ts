import { COMMUNITY_NAMES, CommunityId } from '@notional-finance/notionable';
import { useWalletCommunities } from '@notional-finance/notionable-hooks';
import { useEffect, useState } from 'react';
import { NotionalPass } from './use-mint-pass';
import { BigNumber } from 'ethers';
import { CURRENT_CONTEST_ID } from '../contest-config';

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
