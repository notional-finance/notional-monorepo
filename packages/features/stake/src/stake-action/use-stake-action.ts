import { StakedNote } from '@notional-finance/sdk/src/staking';
import { useObservableState } from 'observable-hooks';
import { initialStakeState, stakeState$ } from './stake-store';
import { ethAmount$, priceImpact$ } from './stake-manager';
import { defineMessage } from 'react-intl';

export const useStakeAction = () => {
  const { ethOrWethSelected, noteAmount, ethHasError, noteHasError } = useObservableState(
    stakeState$,
    initialStakeState
  );
  const ethAmount = useObservableState(ethAmount$);
  const priceImpact = useObservableState(priceImpact$);
  const noteSpotPriceUSD = StakedNote.spotPriceToUSD(StakedNote.getSpotPrice()).toFloat();

  const noteError =
    ethAmount !== undefined && noteAmount === undefined
      ? defineMessage({
          defaultMessage: 'NOTE amount not defined, zero is accepted',
          description: 'error message',
        })
      : undefined;

  const canSubmit =
    !!noteAmount &&
    !!ethAmount &&
    noteError === undefined &&
    noteHasError === false &&
    ethHasError === false;

  return {
    noteAmount,
    ethAmount,
    ethAmountString: ethAmount?.toExactString() || '',
    ethOrWeth: ethOrWethSelected,
    priceImpact,
    noteError,
    noteSpotPriceUSD,
    canSubmit,
  };
};
