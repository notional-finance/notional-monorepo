import {
  useGroupedTokens,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';

export const useLeveragedNTokenPositions = (selectedDepositToken?: string) => {
  const {
    globalState: { holdingsGroups },
  } = useNotionalContext();
  const holdings = useGroupedTokens();
  if (holdingsGroups === undefined) {
    return {
      isLoading: true,
      currentPosition: undefined,
      depositTokensWithPositions: [] as string[],
    };
  }

  const nTokenPositions = holdingsGroups.filter(
    ({ asset }) => asset.tokenType === 'nToken'
  );
  const currentPosition = nTokenPositions.find(
    ({ asset }) => asset.underlying.symbol === selectedDepositToken
  );
  const depositTokensWithPositions = nTokenPositions.map(
    ({ asset }) => asset.underlying.symbol
  );
  // The difference between currentPosition and currentHoldings is that current holdings
  // has more metadata but it arrives a little later
  const currentHoldings = holdings.find(
    ({ asset }) => asset.balance.underlying.symbol === selectedDepositToken
  );

  return {
    isLoading: false,
    currentPosition,
    depositTokensWithPositions,
    currentHoldings,
  };
};
