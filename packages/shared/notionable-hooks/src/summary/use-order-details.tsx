import { IntlShape, MessageDescriptor, useIntl } from 'react-intl';
import { DetailItem, OrderDetailLabels } from '.';
import { TokenBalance } from '@notional-finance/core-entities';
import { BaseTradeState, TokenOption } from '@notional-finance/notionable';
import {
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import { RATE_DECIMALS } from '@notional-finance/util';

interface OrderDetails {
  orderDetails: DetailItem[];
  filteredOrderDetails: DetailItem[];
}

function getOrderDetails(
  b: TokenBalance,
  realized: TokenBalance,
  feeValue: TokenBalance,
  intl: IntlShape,
  isLeverageOrRoll: boolean,
  options: TokenOption[] | undefined
): DetailItem[] {
  const { title, caption } = formatTokenType(b.token);
  const apyLabel =
    b.tokenType === 'fCash' || b.tokenType === 'VaultShare'
      ? OrderDetailLabels.captionAPY
      : OrderDetailLabels.apy;
  const feeLabel =
    b.tokenType === 'fCash' || b.tokenType === 'VaultShare'
      ? OrderDetailLabels.captionFee
      : OrderDetailLabels.fee;
  const priceLabel =
    b.tokenType === 'fCash' || b.tokenType === 'VaultShare'
      ? OrderDetailLabels.captionPrice
      : OrderDetailLabels.price;
  const apy = options?.find((o) => o.token.id === b.tokenId)?.interestRate;

  let valueLabel: MessageDescriptor;
  switch (b.tokenType) {
    case 'PrimeCash':
    case 'nToken':
      valueLabel = b.isPositive()
        ? OrderDetailLabels.assetMinted
        : OrderDetailLabels.assetRedeemed;
      break;
    case 'fCash':
      valueLabel = b.isPositive()
        ? OrderDetailLabels.fCashBought
        : OrderDetailLabels.fCashSold;
      break;
    case 'VaultShare':
      valueLabel = b.isPositive()
        ? OrderDetailLabels.vaultShareMinted
        : OrderDetailLabels.vaultShareRedeemed;
      break;
    case 'PrimeDebt':
      valueLabel = b.isPositive()
        ? OrderDetailLabels.primeDebtRepaid
        : OrderDetailLabels.primeDebtBorrowed;
      break;
    case 'Underlying':
    case 'NOTE':
      valueLabel = b.isPositive()
        ? OrderDetailLabels.assetMinted
        : OrderDetailLabels.assetRedeemed;
      break;
    default:
      throw Error('Unknown token type');
  }

  const orderDetails = [
    {
      label: intl.formatMessage(valueLabel, { title, caption }),
      value: {
        data: [
          {
            displayValue: `${
              isLeverageOrRoll
                ? b.toDisplayString(4, true, false)
                : b.abs().toDisplayString(4, true, false)
            } ${title}`,
            isNegative: isLeverageOrRoll ? b.isNegative() : false,
          },
        ],
      },
    },
    {
      label: intl.formatMessage(feeLabel, { title, caption }),
      value: {
        data: [
          {
            displayValue: feeValue
              .toUnderlying()
              .toDisplayStringWithSymbol(4, true, false),
          },
        ],
      },
    },
    {
      // Price: realized cash / total units
      label: intl.formatMessage(priceLabel, { title, caption }),
      value: {
        data: [
          {
            displayValue: realized
              .abs()
              .toUnderlying()
              .divInRatePrecision(b.abs().scaleTo(RATE_DECIMALS))
              .toDisplayStringWithSymbol(4, true, false),
            isNegative: false,
          },
        ],
      },
      showOnExpand: true,
    },
  ];

  if (apy !== undefined) {
    orderDetails.push({
      label: intl.formatMessage(apyLabel, { title, caption }),
      value: {
        data: [
          {
            displayValue: `${formatNumberAsPercent(apy, 2)}`,
            isNegative: apy < 0,
          },
        ],
      },
      showOnExpand: true,
    });
  }

  return orderDetails;
}

export function useOrderDetails(state: BaseTradeState): OrderDetails {
  const {
    debtBalance,
    debtFee,
    collateralFee,
    debtOptions,
    collateralOptions,
    collateralBalance,
    netRealizedDebtBalance,
    netRealizedCollateralBalance,
    depositBalance,
    tradeType,
    secondaryDepositBalance,
  } = state;
  const intl = useIntl();
  const orderDetails: DetailItem[] = [];
  // Only show positive values if one of the values is defined
  const isLeverageOrRoll = !!debtBalance && !!collateralBalance;

  if (depositBalance?.isPositive()) {
    orderDetails.push({
      label: intl.formatMessage(OrderDetailLabels.amountFromWallet),
      value: {
        data: [
          {
            displayValue: depositBalance.toDisplayStringWithSymbol(
              4,
              true,
              false
            ),
            isNegative: depositBalance.isNegative(),
          },
        ],
      },
    });
  }

  if (secondaryDepositBalance?.isPositive()) {
    orderDetails.push({
      label: intl.formatMessage(OrderDetailLabels.amountFromWallet),
      value: {
        data: [
          {
            displayValue: secondaryDepositBalance.toDisplayStringWithSymbol(
              4,
              true,
              false
            ),
            isNegative: secondaryDepositBalance.isNegative(),
          },
        ],
      },
    });
  }

  // NOTE: if sign changes occur, they don't get marked here
  if (debtBalance?.isZero() === false && netRealizedDebtBalance) {
    // Undo withdraw and convert token type here
    const balance =
      debtBalance.tokenType === 'PrimeDebt' &&
      (tradeType === 'ConvertAsset' || tradeType === 'Withdraw')
        ? debtBalance.toPrimeCash()
        : debtBalance;

    orderDetails.push(
      ...getOrderDetails(
        balance.unwrapVaultToken(),
        netRealizedDebtBalance,
        debtFee?.toUnderlying() || netRealizedDebtBalance.copy(0),
        intl,
        isLeverageOrRoll,
        debtOptions
      )
    );
  }

  if (collateralBalance?.isZero() === false && netRealizedCollateralBalance) {
    // Undo withdraw and convert token type here
    orderDetails.push(
      ...getOrderDetails(
        collateralBalance.unwrapVaultToken(),
        netRealizedCollateralBalance,
        collateralFee?.toUnderlying() || netRealizedCollateralBalance.copy(0),
        intl,
        isLeverageOrRoll,
        collateralOptions
      )
    );
  }

  if (depositBalance?.isNegative()) {
    orderDetails.push({
      label: intl.formatMessage(OrderDetailLabels.amountToWallet),
      value: {
        data: [
          {
            displayValue: depositBalance
              .neg()
              .toDisplayStringWithSymbol(4, true, false),
            isNegative: depositBalance.isNegative(),
          },
        ],
      },
    });
  }

  const filteredOrderDetails: DetailItem[] = orderDetails.filter(
    ({ showOnExpand }) => !showOnExpand
  );

  return { orderDetails, filteredOrderDetails };
}
