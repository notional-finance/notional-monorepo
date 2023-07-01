import { TokenBalance } from "@notional-finance/core-entities";

// ===== NOTE: All of these helpers are to be used with the MultiValueCell
export const formatCryptoWithFiat = (tbn?: TokenBalance | null) => {
  return !tbn || tbn.isZero()
    ? '-'
    : {
        data: [
          tbn.toDisplayStringWithSymbol(3),
          tbn.toFiat('USD').toDisplayStringWithSymbol(3),
        ],
        isNegative: tbn.isNegative(),
      };
};

export const formatValueWithFiat = (tbn?: TokenBalance, isDebt?: boolean) => {
  return !tbn || tbn.isZero()
    ? '-'
    : {
        data: [
          isDebt || (tbn.isNegative() && !tbn.toDisplayString().includes('-'))
            ? `-${tbn.toDisplayString()}`
            : tbn.toDisplayString(),
          tbn.toFiat('USD').toDisplayStringWithSymbol(0),
        ],
        isNegative: isDebt || tbn.isNegative(),
      };
};
