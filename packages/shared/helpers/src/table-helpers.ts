import {
  FiatKeys,
  TokenBalance,
  TokenDefinition,
  TokenType,
} from '@notional-finance/core-entities';
import { formatNumberAsPercent } from '@notional-finance/util';
import { MessageDescriptor } from 'react-intl';

export type MultiRowTableData =
  | {
      data: [
        {
          displayValue: string;
          isNegative?: boolean;
          showPositiveAsGreen?: boolean;
          textColor?: string;
          toolTipContent?: MessageDescriptor;
        },
        {
          displayValue: string;
          isNegative?: boolean;
        }
      ];
    }
  | string;

const tokenTypeSortOrder: TokenType[] = [
  'Underlying',
  'Fiat',
  'VaultShare',
  'VaultDebt',
];

export const getHoldingsSortOrder = (t: TokenDefinition) => {
  return tokenTypeSortOrder.indexOf(t.tokenType);
};

// ===== NOTE: All of these helpers are to be used with the MultiValueCell
export const formatCryptoWithFiat = (
  baseCurrency: FiatKeys,
  tbn?: TokenBalance | null,
  options?: { showZero?: boolean; isDebt?: boolean }
): MultiRowTableData => {
  if (options?.showZero && (!tbn || tbn.isZero())) {
    return '0.00';
  } else if (!tbn || tbn.isZero()) {
    return '-';
  } else {
    return {
      data: [
        {
          displayValue: tbn.toDisplayStringWithSymbol(4, true, false),
          isNegative: options?.isDebt ? false : tbn.isNegative(),
        },
        {
          displayValue: tbn
            .toFiat(baseCurrency)
            .toDisplayStringWithSymbol(2, true, false),
          isNegative: options?.isDebt ? false : tbn.isNegative(),
        },
      ],
    };
  }
};

export const formatValueWithFiat = (
  baseCurrency: FiatKeys,
  tbn?: TokenBalance,
  isDebt?: boolean
): MultiRowTableData => {
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
): MultiRowTableData => {
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
