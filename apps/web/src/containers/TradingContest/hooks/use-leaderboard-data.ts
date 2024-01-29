import { TokenBalance } from '@notional-finance/core-entities';
import {
  formatNumberAsPercent,
  truncateAddress,
} from '@notional-finance/helpers';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import {
  useSelectedNetwork,
} from '@notional-finance/wallet';
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
  address: string;
  irr: number;
  earnings: ReturnType<typeof TokenBalance['toJSON']>;
  netDeposits: ReturnType<typeof TokenBalance['toJSON']>;
  totalNetWorth: ReturnType<typeof TokenBalance['toJSON']>;
  portfolioRisk: {
    leverageRatio: number | null;
  };
  vaultRisk: Record<string, unknown>;
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
        .filter(
          (a) =>
            a.portfolioRisk.leverageRatio !== null ||
            Object.keys(a.vaultRisk).length > 0
        )
        .sort((a, b) => b.irr - a.irr);

      setHighRollerData(
        haveLeverage
          .filter((a) => a.irr > 0)
          .map((a, i) => ({
            rank: (i + 1).toString().padStart(2, '0'),
            username: {
              text: truncateAddress(a.address),
              dataSet: 'highRoller',
              fullAddress: a.address,
            },
            address: a.address,
            totalAPY: formatNumberAsPercent(a.irr),
            totalEarnings: TokenBalance.fromJSON(a.earnings)
              .toFiat('USD')
              .toDisplayStringWithSymbol(),
            totalDeposits: TokenBalance.fromJSON(a.netDeposits).isNegative()
              ? `$0.000`
              : TokenBalance.fromJSON(a.netDeposits)
                  .toFiat('USD')
                  .toDisplayStringWithSymbol(),
            netWorth: TokenBalance.fromJSON(a.totalNetWorth)
              .toFiat('USD')
              .toDisplayStringWithSymbol(),
          }))
      );
      setFatCatData(
        data
          .filter(
            (a) =>
              a.portfolioRisk.leverageRatio === null &&
              Object.keys(a.vaultRisk).length === 0
          )
          .sort((a, b) => b.irr - a.irr)
          .map((a, i) => ({
            rank: (i + 1).toString().padStart(2, '0'),
            username: {
              text: truncateAddress(a.address),
              dataSet: 'fatCat',
              fullAddress: a.address,
            },
            address: a.address,
            totalAPY: formatNumberAsPercent(a.irr),
            totalEarnings: TokenBalance.fromJSON(a.earnings)
              .toFiat('USD')
              .toDisplayStringWithSymbol(),
            totalDeposits: TokenBalance.fromJSON(a.netDeposits).isNegative()
              ? '$0.000'
              : TokenBalance.fromJSON(a.netDeposits)
                  .toFiat('USD')
                  .toDisplayStringWithSymbol(),
            netWorth: TokenBalance.fromJSON(a.totalNetWorth)
              .toFiat('USD')
              .toDisplayStringWithSymbol(),
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
