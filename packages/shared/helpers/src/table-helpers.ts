import {
  AccountHistory,
  FiatKeys,
  TokenBalance,
  TokenDefinition,
  TokenType,
} from '@notional-finance/core-entities';
import { Network, getEtherscanTransactionLink } from '@notional-finance/util';
import { formatNumberAsPercent } from './number-helpers';
import { formatTokenType, truncateAddress } from './text-helpers';

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
  options?: { showZero?: boolean, isDebt?: boolean}
) => {

  if(options?.showZero && (!tbn || tbn.isZero())) {
    return '0.00'
  } else if(!tbn || tbn.isZero()) {
    return '-'
  } else {
    return {
        data: [
          {
            displayValue: tbn.toDisplayStringWithSymbol(),
            isNegative: options?.isDebt ? false : tbn.isNegative(),
          },
          {
            displayValue: tbn.toFiat(baseCurrency).toDisplayStringWithSymbol(2),
            isNegative: options?.isDebt ? false : tbn.isNegative(),
          },
        ],
      }
    }
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

export const formatTxnTableData = (data: AccountHistory, network: Network) => {
    const {
      bundleName,
      label,
      txnLabel,
      underlyingAmountRealized,
      token,
      realizedPrice,
      timestamp,
      transactionHash,
      underlying,
      impliedFixedRate,
      account,
      vaultName,
    } = data;

      const assetData = formatTokenType(token);
      const isIncentive =
        bundleName === 'Transfer Incentive' ||
        bundleName === 'Transfer Secondary Incentive';
      const result = {
        transactionType: {
          label: label,
          caption: vaultName || txnLabel,
          showSentIcon: underlyingAmountRealized.isNegative(),
        },
        vaultName: vaultName,
        address: {
          text: account ? truncateAddress(account) : '-',
          fullAddress: `${account}`,
          network: network,
        },
        underlyingAmount: formatTokenAmount(
          underlyingAmountRealized,
          impliedFixedRate,
          true,
          false,
          underlyingAmountRealized.isPositive(),
          4
        ),
        asset: {
          label: assetData.title,
          symbol: assetData.icon.toLowerCase(),
          caption: assetData.caption ? assetData.caption : '',
        },
        price: isIncentive
          ? '-'
          : realizedPrice.toDisplayStringWithSymbol(4, true),
        time: timestamp,
        txLink: {
          hash: transactionHash,
          href: getEtherscanTransactionLink(transactionHash, network),
        },
        currency: underlying.symbol,
        token: token,
      }
      return result;
    }
      