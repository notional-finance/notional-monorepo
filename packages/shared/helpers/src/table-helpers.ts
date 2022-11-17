import { TypedBigNumber } from '@notional-finance/sdk';
import { formatNumberAsPercent } from './number-helpers';

// ===== NOTE: All of these helpers are to be used with the MultiValueCell
export const formatCryptoWithFiat = (tbn?: TypedBigNumber | null) => {
  return !tbn || tbn.isZero()
    ? '-'
    : {
        data: [
          tbn.toDisplayStringWithSymbol(3),
          tbn.toCUR('USD').toDisplayStringWithSymbol(3),
        ],
        isNegative: tbn.isNegative(),
      };
};

export const formatValueWithFiat = (tbn?: TypedBigNumber, isDebt?: boolean) => {
  return !tbn || tbn.isZero()
    ? '-'
    : {
        data: [
          isDebt || (tbn.isNegative() && !tbn.toDisplayString().includes('-'))
            ? `-${tbn.toDisplayString()}`
            : tbn.toDisplayString(),
          tbn.toCUR('USD').toDisplayStringWithSymbol(0),
        ],
        isNegative: isDebt || tbn.isNegative(),
      };
};
