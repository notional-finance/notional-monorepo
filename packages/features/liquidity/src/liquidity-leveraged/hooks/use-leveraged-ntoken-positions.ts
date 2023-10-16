import { useNotionalContext } from '@notional-finance/notionable-hooks';

export const useLeveragedNTokenPositions = (selectedDepositToken?: string) => {
  const {
    globalState: { holdingsGroups },
  } = useNotionalContext();
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

  return { isLoading: false, currentPosition, depositTokensWithPositions };
};
