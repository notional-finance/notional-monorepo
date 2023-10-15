import { TokenDefinition } from '@notional-finance/core-entities';
import { useGroupedTokens } from '@notional-finance/notionable-hooks';

export const useLeveragedNTokenPositions = (nToken?: TokenDefinition) => {
  const nTokenPositions = useGroupedTokens().filter(
    ({ asset }) => asset.balance.tokenType === 'nToken'
  );
  const currentPosition = nTokenPositions.find(
    ({ asset }) => asset.balance.tokenId === nToken?.id
  );
  const depositTokensWithPositions = nTokenPositions.map(
    ({ asset }) => asset.balance.underlying.symbol
  );

  return { currentPosition, depositTokensWithPositions };
};
