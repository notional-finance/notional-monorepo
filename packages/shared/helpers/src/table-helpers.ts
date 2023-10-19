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
  tbn?: TokenBalance | null
) => {
  return !tbn || tbn.isZero()
    ? '-'
    : {
        data: [
          {
            displayValue: tbn.toDisplayStringWithSymbol(3),
            isNegative: tbn.isNegative(),
          },
          {
            displayValue: tbn.toFiat(baseCurrency).toDisplayStringWithSymbol(3),
            isNegative: tbn.isNegative(),
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
  impliedFixedRate?: any
) => {
  return !tbn || tbn.isZero()
    ? '-'
    : {
        data: [
          {
            displayValue: tbn.toDisplayString(3, true),
            isNegative: tbn.isNegative(),
          },
          {
            displayValue:
              impliedFixedRate !== undefined
                ? `${formatNumberAsPercent(impliedFixedRate)} Fixed`
                : '',
            isNegative: tbn.isNegative(),
          },
        ],
      };
};
