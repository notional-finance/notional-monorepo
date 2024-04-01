import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useVaultActionErrors } from '../hooks';
import { LeverageSlider } from '@notional-finance/trade';
import { VaultContext } from '@notional-finance/notionable-hooks';
import { PointsMultipliers } from '@notional-finance/core-entities';

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
    state: {
      netRealizedDebtBalance,
      selectedNetwork,
      vaultAddress,
      riskFactorLimit,
    },
  } = context;
  const { leverageRatioError, isDeleverage, underMinAccountBorrowError } =
    useVaultActionErrors();
  const errorMsg = leverageRatioError || underMinAccountBorrowError;
  const leverageRatio = riskFactorLimit?.limit as number;
  const points =
    selectedNetwork && vaultAddress
      ? PointsMultipliers[selectedNetwork][vaultAddress]
      : undefined;
  const additionalSliderInfo = points
    ? Object.keys(points).map((k) => ({
        caption: (
          <FormattedMessage defaultMessage={'{k} Points'} values={{ k }} />
        ),
        value: points[k] * leverageRatio,
        suffix: 'x',
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
