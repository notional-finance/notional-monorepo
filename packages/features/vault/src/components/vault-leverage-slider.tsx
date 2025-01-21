import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useVaultActionErrors } from '../hooks';
import { LeverageSlider } from '@notional-finance/trade';
import {
  useVaultPoints,
  usePointPrices,
  useVaultAdapter,
  useCurrentTradeContext,
} from '@notional-finance/notionable-hooks';
import {
  pointsMultiple,
  PRIME_CASH_VAULT_MATURITY,
} from '@notional-finance/util';
import { getVaultType, PendlePT } from '@notional-finance/core-entities';
import { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';

export const VaultLeverageSlider = observer(
  ({
    inputLabel,
    sliderInfo,
    onChange,
  }: {
    inputLabel: MessageDescriptor;
    sliderInfo?: MessageDescriptor;
    onChange?: (leverageRatio: number) => void;
  }) => {
    const trade = useCurrentTradeContext();
    const netRealizedDebtBalance = trade?.netRealizedDebtBalance;
    const vaultAddress = trade?.vaultAddress;
    const selectedNetwork = trade?.selectedNetwork;
    const debtBalance = trade?.debtBalance;
    const collateralBalance = trade?.collateralBalance;
    const tradeType = trade?.tradeType;
    const leverageRatio = trade?.leverageRatio;

    const points = useVaultPoints(vaultAddress);
    const adapter = useVaultAdapter(vaultAddress) as PendlePT | undefined;

    const {
      leverageRatioError,
      isDeleverage,
      underMinAccountBorrowError,
      inputErrorMsg,
    } = useVaultActionErrors();
    const errorMsg =
      leverageRatioError || underMinAccountBorrowError || inputErrorMsg;
    const vaultType =
      vaultAddress && selectedNetwork
        ? getVaultType(vaultAddress, selectedNetwork)
        : undefined;
    const pointPrices = usePointPrices();

    let additionalSliderInfo: {
      caption: ReactNode;
      value: number;
      suffix?: string;
      toolTipTitle?: ReactNode;
      toolTipText?: ReactNode;
    }[] = [];

    if (points) {
      additionalSliderInfo = Object.keys(points).map((k) => ({
        caption: (
          <FormattedMessage defaultMessage={'{k} Points'} values={{ k }} />
        ),
        value: pointsMultiple(points[k], leverageRatio),
        suffix: 'x',
        toolTipTitle: (
          <FormattedMessage
            // eslint-disable-next-line no-template-curly-in-string
            defaultMessage={'{k} Points: ${value}/point'}
            values={{
              k,
              value:
                pointPrices && pointPrices.length
                  ? pointPrices.find((p) => p.points.includes(k))?.price
                  : 0,
            }}
          />
        ),
        toolTipText: (
          <FormattedMessage
            defaultMessage={
              'Point values used are estimates. True values are not known. True values may be very different and will significantly impact total APY.'
            }
          />
        ),
      }));
    } else if (
      vaultType === 'PendlePT' &&
      (tradeType === 'CreateVaultPosition' ||
        tradeType === 'IncreaseVaultPosition')
    ) {
      if (
        debtBalance?.maturity &&
        debtBalance.maturity < PRIME_CASH_VAULT_MATURITY
      ) {
        const symbol = debtBalance.underlying.symbol;
        additionalSliderInfo.push({
          caption: `${symbol} Debt at Maturity`,
          value: debtBalance.abs().toFloat(),
          suffix: ` ${symbol}`,
        });
      }

      if (collateralBalance) {
        const symbol = adapter?.assetToken.symbol;
        additionalSliderInfo.push({
          caption: `${symbol} at PT Expiration`,
          value: collateralBalance.toFloat(),
          suffix: ` ${symbol}`,
        });
      }
    }

    return (
      <LeverageSlider
        infoMsg={sliderInfo}
        errorMsg={errorMsg}
        showMinMax
        isDeleverage={isDeleverage}
        cashBorrowed={netRealizedDebtBalance}
        inputLabel={inputLabel}
        additionalSliderInfo={additionalSliderInfo}
        onChange={onChange}
      />
    );
  }
);
