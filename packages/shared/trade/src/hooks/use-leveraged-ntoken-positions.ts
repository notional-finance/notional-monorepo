import { useGroupedHoldings } from '@notional-finance/notionable-hooks';
import { Network } from '@notional-finance/util';

export const useLeveragedNTokenPositions = (
  network: Network | undefined,
  selectedDepositToken?: string
) => {
  const holdingsGroups = useGroupedHoldings(network);
  if (holdingsGroups === undefined) {
    return {
      isLoading: true,
      currentPosition: undefined,
      depositTokensWithPositions: [] as string[],
    };
  }


  const nTokenPositions = holdingsGroups.filter(
    ({ asset }) => asset.balance.tokenType === 'nToken'
  );
  const currentPosition = nTokenPositions.find(
    ({ asset }) => asset.balance.underlying.symbol === selectedDepositToken
  );
  const depositTokensWithPositions = nTokenPositions.map(
    ({ asset }) => asset.balance.underlying.symbol
  );
  // The difference between currentPosition and currentHoldings is that current holdings
  // has more metadata but it arrives a little later
  const currentHoldings = holdingsGroups.find(
    ({ asset }) => asset.balance.underlying.symbol === selectedDepositToken
  );

  return {
    isLoading: false,
    currentPosition,
    depositTokensWithPositions,
    currentHoldings,
    nTokenPositions,
  };
};
