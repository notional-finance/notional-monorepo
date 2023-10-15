import { LiquidityContext } from '../../liquidity';
import { useGroupedTokens } from '@notional-finance/notionable-hooks';
import { useContext } from 'react';

export const useLeveragedNTokenPositions = () => {
  const {
    state: { collateral },
  } = useContext(LiquidityContext);
  const nTokenPositions = useGroupedTokens().filter(
    ({ asset }) => asset.balance.tokenType === 'nToken'
  );
  const currentPosition = nTokenPositions.find(
    ({ asset }) => asset.balance.tokenId === collateral?.id
  );
  const depositTokensWithPositions = nTokenPositions.map(
    ({ asset }) => asset.balance.underlying.symbol
  );

  return { currentPosition, depositTokensWithPositions };
};
