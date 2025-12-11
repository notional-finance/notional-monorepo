import { IntlShape, MessageDescriptor, useIntl } from 'react-intl';
import { DetailItem, OrderDetailLabels } from '.';
import { TokenBalance } from '@notional-finance/core-entities';
import {
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import { RATE_DECIMALS } from '@notional-finance/util';
import { useCurrentTradeContext } from '../context/use-trade-context';

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
  apy: number | undefined
): DetailItem[] {
  const { title, caption } = formatTokenType(b.token);
  const apyLabel =
    b.tokenType === 'VaultShare'
      ? OrderDetailLabels.captionAPY
      : OrderDetailLabels.apy;
  const feeLabel =
    b.tokenType === 'VaultShare'
      ? OrderDetailLabels.captionFee
      : OrderDetailLabels.fee;
  const priceLabel =
    b.tokenType === 'VaultShare'
      ? OrderDetailLabels.captionPrice
      : OrderDetailLabels.price;

  let valueLabel: MessageDescriptor;
  switch (b.tokenType) {
    case 'VaultShare':
      valueLabel = b.isPositive()
        ? OrderDetailLabels.vaultShareMinted
        : OrderDetailLabels.vaultShareRedeemed;
      break;
    case 'Underlying':
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

export function useOrderDetails(): OrderDetails {
  const trade = useCurrentTradeContext();
  const debtBalance = trade?.debtBalance;
  const collateralBalance = trade?.collateralBalance;
  const debtFee = trade?.debtFee;
  const collateralFee = trade?.collateralFee;
  const collateralAPY = trade?.collateralAPY;
  const debtAPY = trade?.debtAPY;
  const netRealizedDebtBalance = trade?.netRealizedDebtBalance;
  const netRealizedCollateralBalance = trade?.netRealizedCollateralBalance;
  const depositBalance = trade?.depositBalance;
  const secondaryDepositBalance = trade?.secondaryDepositBalance;

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
    orderDetails.push(
      ...getOrderDetails(
        debtBalance,
        netRealizedDebtBalance,
        debtFee?.toUnderlying() || netRealizedDebtBalance.copy(0),
        intl,
        isLeverageOrRoll,
        debtAPY
      )
    );
  }

  if (collateralBalance?.isZero() === false && netRealizedCollateralBalance) {
    // Undo withdraw and convert token type here
    orderDetails.push(
      ...getOrderDetails(
        collateralBalance,
        netRealizedCollateralBalance,
        collateralFee?.toUnderlying() || netRealizedCollateralBalance.copy(0),
        intl,
        isLeverageOrRoll,
        collateralAPY
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
