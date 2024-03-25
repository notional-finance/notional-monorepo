import {
  FiatKeys,
  TokenBalance,
  TokenDefinition,
  TokenType,
} from '@notional-finance/core-entities';
import { formatNumberAsPercent } from './number-helpers';

const tokenTypeSortOrder: TokenType[] = [
  'Underlying',
  'Fiat',
  'NOTE',
  'PrimeCash',
  'PrimeDebt',
  'nToken',
  'fCash',
  'WrappedfCash',
  'VaultShare',
  'VaultDebt',
  'VaultCash',
];

export const getHoldingsSortOrder = (t: TokenDefinition) => {
  if (t.currencyId)
    return t.currencyId * 10000 + tokenTypeSortOrder.indexOf(t.tokenType);
  else return tokenTypeSortOrder.indexOf(t.tokenType);
};

// ===== NOTE: All of these helpers are to be used with the MultiValueCell
export const formatCryptoWithFiat = (
  baseCurrency: FiatKeys,
  tbn?: TokenBalance | null,
  isDebt?: boolean
) => {
  return !tbn || tbn.isZero()
    ? '-'
    : {
        data: [
          {
            displayValue: tbn.toDisplayStringWithSymbol(),
            isNegative: isDebt ? false : tbn.isNegative(),
          },
          {
            displayValue: tbn.toFiat(baseCurrency).toDisplayStringWithSymbol(2),
            isNegative: isDebt ? false : tbn.isNegative(),
          },
        ],
      };
};

export const formatValueWithFiat = (
  baseCurrency: FiatKeys,
  tbn?: TokenBalance,
  isDebt?: boolean
) => {
  return !tbn || tbn.isZero()
    ? '-'
    : {
        data: [
          {
            displayValue: tbn.toDisplayString(),
            isNegative: isDebt || tbn.isNegative(),
          },
          {
            displayValue: tbn.toFiat(baseCurrency).toDisplayStringWithSymbol(0),
            isNegative: isDebt || tbn.isNegative(),
          },
        ],
      };
};

export const formatTokenAmount = (
  tbn?: TokenBalance,
  impliedFixedRate?: any,
  showDisplayStringWithSymbol?: boolean,
  showStyledNegativeValues?: boolean,
  showPositiveAsGreen?: boolean,
  decimalPlaces?: number
) => {
  return !tbn || tbn.isZero()
    ? '-'
    : {
        data: [
          {
            displayValue: showDisplayStringWithSymbol
              ? tbn.toDisplayStringWithSymbol(decimalPlaces || 4)
              : tbn.toDisplayString(4, true),
            showPositiveAsGreen: showPositiveAsGreen,
            isNegative: showStyledNegativeValues ? tbn.isNegative() : false,
          },
          {
            displayValue:
              impliedFixedRate !== undefined
                ? `${formatNumberAsPercent(impliedFixedRate)} Fixed`
                : '',
            isNegative: showStyledNegativeValues ? tbn.isNegative() : false,
          },
        ],
      };
};
