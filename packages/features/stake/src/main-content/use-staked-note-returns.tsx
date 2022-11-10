import { useNotional } from '@notional-finance/notionable-hooks';
import { NOTE_CURRENCY_ID } from '@notional-finance/sdk/src/config/constants';
import { StakedNote } from '@notional-finance/sdk/src/staking';

export function useStakedNoteReturns() {
  const { notional } = useNotional();
  let totalStakedNOTEValueUSD: number | undefined;
  let annualInvestmentRate: number | undefined;
  let stakedNOTEApy: number | undefined;

  if (notional) {
    // TODO: update this calculation somehow...
    const { sNOTETotalSupply } = notional.system.getStakedNoteParameters();
    const { ethClaim, noteClaim } = StakedNote.getRedemptionValue(sNOTETotalSupply);
    totalStakedNOTEValueUSD = ethClaim
      .toInternalPrecision()
      .fromETH(NOTE_CURRENCY_ID, false)
      .add(noteClaim)
      .toUSD()
      .toFloat();
    annualInvestmentRate = 1850000;
    stakedNOTEApy = (annualInvestmentRate / totalStakedNOTEValueUSD) * 100;
  }

  return { totalStakedNOTEValueUSD, annualInvestmentRate, stakedNOTEApy };
}
