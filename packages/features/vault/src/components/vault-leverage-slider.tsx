import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useVaultActionErrors } from '../hooks';
import { LeverageSlider } from '@notional-finance/trade';
import {
  VaultContext,
  useAllMarkets,
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
    state: {
      netRealizedDebtBalance,
      selectedNetwork,
      collateral,
      riskFactorLimit,
    },
  } = context;
  const {
    yields: { vaultShares },
  } = useAllMarkets(selectedNetwork);
  const {
    leverageRatioError,
    isDeleverage,
    underMinAccountBorrowError,
    inputErrorMsg,
  } = useVaultActionErrors();
  const errorMsg =
    leverageRatioError || underMinAccountBorrowError || inputErrorMsg;
  const leverageRatio = riskFactorLimit?.limit as number;
  const points = vaultShares.find(
    (y) => y.token.id === collateral?.id
  )?.pointMultiples;
  const additionalSliderInfo = points
    ? Object.keys(points).map((k) => ({
        caption: (
          <FormattedMessage defaultMessage={'{k} Points'} values={{ k }} />
        ),
        value: pointsMultiple(points[k], leverageRatio),
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
