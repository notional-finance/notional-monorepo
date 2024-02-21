import {
  formatNumber,
  formatNumberAsPercent,
  truncateAddress,
} from '@notional-finance/helpers';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { useSelectedNetwork } from '@notional-finance/wallet';
import { useCallback, useEffect, useState } from 'react';

const DATA_URL = process.env['NX_DATA_URL'] || 'https://data.notional.finance';

interface ContestData {
  rank: string;
  username: { text: string; dataSet: string };
  totalAPY: string;
  totalDeposits: string;
  netWorth: string;
  totalEarnings: string;
  address: string;
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

export function useLeaderboardData() {
  const [highRollerData, setHighRollerData] = useState<ContestData[]>([]);
  const [fatCatData, setFatCatData] = useState<ContestData[]>([]);
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
      const haveLeverage = data
        .filter((a) => a.hasLeverage && a.irr)
        .sort((a, b) => (b.irr || 0) - (a.irr || 0));

      setHighRollerData(
        haveLeverage.map((a, i) => ({
          rank: (i + 1).toString().padStart(2, '0'),
          username: {
            text: truncateAddress(a.address),
            dataSet: 'highRoller',
            fullAddress: a.address,
          },
          address: a.address,
          totalAPY: formatNumberAsPercent((a.irr || 0) * 100),
          totalEarnings: `$${formatNumber(a.earnings)}`,
          totalDeposits:
            a.netDeposits < 0 ? `$0.0000` : `$${formatNumber(a.netDeposits)}`,
          netWorth: `$${formatNumber(a.totalNetWorth)}`,
        }))
      );
      setFatCatData(
        data
          .filter((a) => !a.hasLeverage && a.irr)
          .sort((a, b) => (b.irr || 0) - (a.irr || 0))
          .map((a, i) => ({
            rank: (i + 1).toString().padStart(2, '0'),
            username: {
              text: truncateAddress(a.address),
              dataSet: 'fatCat',
              fullAddress: a.address,
            },
            address: a.address,
            totalAPY: formatNumberAsPercent((a.irr || 0) * 100),
            totalEarnings: `$${formatNumber(a.earnings)}`,
            totalDeposits:
              a.netDeposits < 0 ? `$0.0000` : `$${formatNumber(a.netDeposits)}`,
            netWorth: `$${formatNumber(a.totalNetWorth)}`,
          }))
      );
    }
  }, [network]);

  useEffect(() => {
    fetchContestData();
  }, [fetchContestData]);

  const currentUserData =
    highRollerData.find((c) => c.address === wallet?.selectedAddress) ||
    fatCatData.find((c) => c.address === wallet?.selectedAddress);

  return {
    highRollerData,
    fatCatData,
    currentUserData: currentUserData ? [currentUserData] : [],
  };
}
