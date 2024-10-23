import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useVaultActionErrors } from '../hooks';
import { LeverageSlider } from '@notional-finance/trade';
import {
  useVaultPoints,
  VaultContext,
  usePointPrices,
} from '@notional-finance/notionable-hooks';
import { pointsMultiple } from '@notional-finance/util';

export const VaultLeverageSlider = ({
  inputLabel,
  sliderInfo,
  context,
}: {
  inputLabel: MessageDescriptor;
  sliderInfo?: MessageDescriptor;
  context: VaultContext;
}) => {
  const {
    state: { netRealizedDebtBalance, vaultAddress, riskFactorLimit },
  } = context;
  const points = useVaultPoints(vaultAddress);

  const {
    leverageRatioError,
    isDeleverage,
    underMinAccountBorrowError,
    inputErrorMsg,
  } = useVaultActionErrors();
  const errorMsg =
    leverageRatioError || underMinAccountBorrowError || inputErrorMsg;
  const leverageRatio = riskFactorLimit?.limit as number;
  const pointPrices = usePointPrices();

  const additionalSliderInfo = points
    ? Object.keys(points).map((k) => ({
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
      }))
    : [];

  return (
    <LeverageSlider
      context={context}
      infoMsg={sliderInfo}
      errorMsg={errorMsg}
      showMinMax
      isDeleverage={isDeleverage}
      cashBorrowed={netRealizedDebtBalance}
      inputLabel={inputLabel}
      additionalSliderInfo={additionalSliderInfo}
    />
  );
};
