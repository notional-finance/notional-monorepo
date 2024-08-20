import {
  formatNumber,
  formatNumberAsPercent,
  truncateAddress,
} from '@notional-finance/helpers';
import {
  useNotionalContext,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { useCallback, useEffect, useState } from 'react';

// NOTE: this URL would need to be updated if we were to ever start running contests again.
const DATA_URL = process.env['NX_DATA_URL'] || '';

interface ContestData {
  rank: string;
  username: {
    text: string;
    communityName: string;
    dataSet: string;
    fullAddress: string;
  };
  totalAPY: string;
  totalDeposits: string;
  netWorth: { displayValue: string; value: number };
  totalEarnings: string;
  address: string;
  communityId: number;
}

interface AccountResponse {
  irr: number | null;
  totalNetWorth: number;
  netDeposits: number;
  earnings: number;
  hasLeverage: boolean;
  address: string;
  communityId: number;
  contestId: number;
}

const handleCommunityName = (communityId: number) => {
  let communityName = 'NOTE';
  switch (communityId) {
    case 1:
      communityName = 'cryptotesters';
      break;
    case 2:
      communityName = 'layer2dao';
      break;
    case 3:
      communityName = 'llamas';
      break;
    default:
      communityName = 'NOTE';
      break;
  }
  return communityName;
};

const formatTableData = (
  a: AccountResponse,
  i: number,
  hasLeverage: boolean
) => {
  return {
    rank: (i + 1).toString().padStart(2, '0'),
    username: {
      text: truncateAddress(a.address),
      communityName: handleCommunityName(a.communityId),
      dataSet: hasLeverage ? 'highRoller' : 'fatCat',
      fullAddress: a.address,
    },
    communityId: a.communityId,
    address: a.address,
    totalAPY: formatNumberAsPercent((a.irr || 0) * 100),
    totalEarnings: `$${formatNumber(a.earnings)}`,
    totalDeposits:
      a.netDeposits < 0 ? `$0.0000` : `$${formatNumber(a.netDeposits)}`,
    netWorth: {
      displayValue:
        a.totalNetWorth < 0 ? `$0.0000` : `$${formatNumber(a.totalNetWorth)}`,
      value: a.totalNetWorth,
    },
  };
};

export function useLeaderboardData() {
  const [highRollerData, setHighRollerData] = useState<ContestData[]>([]);
  const [fatCatData, setFatCatData] = useState<ContestData[]>([]);
  const [currentUserData, setCurrentUserData] = useState<
    ContestData[] | undefined
  >([]);
  const [highRollerPartner, setHighRollerPartner] = useState<number>(0);
  const [fatCatPartner, setFatCatPartner] = useState<number>(0);
  const network = useSelectedNetwork();
  const {
    globalState: { wallet },
  } = useNotionalContext();

  const fetchContestData = useCallback(async () => {
    if (network) {
      const response = await fetch(`${DATA_URL}/${network}/accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data: AccountResponse[] = await response.json();
      const userData = data.find((c) => c.address === wallet?.selectedAddress);

      const filteredHighRollerData = data
        .filter((a) => a.hasLeverage && a.irr)
        .filter(({ totalNetWorth }) => totalNetWorth > 100)
        .sort((a, b) => (b.irr || 0) - (a.irr || 0))
        .map((a, i) => formatTableData(a, i, true));

      setHighRollerData(filteredHighRollerData);

      const filteredFatCatData = data
        .filter((a) => !a.hasLeverage && a.irr)
        .filter(({ totalNetWorth }) => totalNetWorth > 100)
        .sort((a, b) => (b.irr || 0) - (a.irr || 0))
        .map((a, i) => formatTableData(a, i, false));

      setFatCatData(filteredFatCatData);

      if (userData && userData.totalNetWorth < 100) {
        setCurrentUserData(
          [userData].map((a, i) => {
            const hasLeverage = a.hasLeverage && a.irr ? true : false;
            return formatTableData(a, i, hasLeverage);
          })
        );
      } else if (userData && userData.totalNetWorth > 100) {
        const userContestData =
          filteredHighRollerData.find(
            (c) => c.address === wallet?.selectedAddress
          ) ||
          filteredFatCatData.find((c) => c.address === wallet?.selectedAddress);
        if (userContestData) setCurrentUserData([userContestData]);
      }
    }
  }, [network, wallet?.selectedAddress]);

  useEffect(() => {
    fetchContestData();
  }, [fetchContestData]);

  return {
    highRollerData:
      highRollerPartner > 0
        ? highRollerData.filter(
            ({ communityId }) => communityId === highRollerPartner
          )
        : highRollerData,
    fatCatData:
      fatCatPartner > 0
        ? fatCatData.filter(({ communityId }) => communityId === fatCatPartner)
        : fatCatData,
    setHighRollerPartner,
    highRollerPartner,
    setFatCatPartner,
    fatCatPartner,
    currentUserData: currentUserData ? currentUserData : [],
  };
}
