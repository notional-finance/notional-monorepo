import { notional$, tokenBalances$ } from '@notional-finance/notionable';
import { TypedBigNumber } from '@notional-finance/sdk';
import { StakedNote } from '@notional-finance/sdk/src/staking';
import { map, combineLatest, filter, Observable } from 'rxjs';
import { selectStakeState } from './stake-store';

const noteAmount$ = selectStakeState('noteAmount') as Observable<TypedBigNumber | undefined>;
const ethInputAmount$ = selectStakeState('ethInputAmount') as Observable<
  TypedBigNumber | undefined
>;
const ethOrWethSelected$ = selectStakeState('ethOrWethSelected') as Observable<string>;
const useOptimumETH$ = selectStakeState('useOptimumETH') as Observable<boolean>;

export const ethAmount$ = combineLatest({
  ethInput: ethInputAmount$,
  ethOrWeth: ethOrWethSelected$,
  useOptimumETH: useOptimumETH$,
  noteAmount: noteAmount$,
  tokenBalances: tokenBalances$,
  notional: notional$,
}).pipe(
  filter(({ ethOrWeth, notional }) => !!ethOrWeth && !!notional),
  map(({ ethInput, ethOrWeth, useOptimumETH, noteAmount, tokenBalances }) => {
    const maxETHAmount = tokenBalances.get(ethOrWeth)?.balance;

    if (useOptimumETH) {
      // If using optimum ETH, the eth amount is calculated
      if (noteAmount && noteAmount.isPositive()) {
        const optimalETH = TypedBigNumber.fromBalance(
          StakedNote.getOptimumETHForNOTE(noteAmount).n,
          ethOrWeth,
          false
        );

        // If we have a maxEthValue then us it as an upper bound, otherwise just use the optimal eth
        return maxETHAmount ? TypedBigNumber.min(optimalETH, maxETHAmount) : optimalETH;
      } else {
        // In this case there is no NOTE amount so clear the eth amount as well
        return undefined;
      }
    } else {
      // If not using optimum ETH, then parse the input string
      return ethInput;
    }
  })
);

export const priceImpact$ = combineLatest([noteAmount$, ethAmount$]).pipe(
  map(([noteAmount, ethAmount]) => calculateNotePriceImpact(noteAmount, ethAmount))
);

export function calculateNotePriceImpact(
  noteAmount?: TypedBigNumber,
  ethAmount?: TypedBigNumber
): {
  noteModifiedPriceUSD: number | undefined;
  error: string;
} {
  const noteIn = noteAmount || TypedBigNumber.fromBalance(0, 'NOTE', true);
  const ethIn = ethAmount || TypedBigNumber.fromBalance(0, 'ETH', false);
  try {
    const noteModifiedPriceUSD = StakedNote.spotPriceToUSD(
      StakedNote.getExpectedPriceImpact(noteIn, ethIn)
    ).toFloat();
    // This throws an error if there is too much price impact
    StakedNote.getExpectedBPT(noteIn, ethIn);
    return {
      noteModifiedPriceUSD,
      error: '',
    };
  } catch (e) {
    return {
      noteModifiedPriceUSD: undefined,
      error: 'view.staking.stakeAction.priceImpact',
    };
  }
}
