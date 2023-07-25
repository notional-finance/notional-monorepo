import { AssetSelectDropdown, PageLoading } from '@notional-finance/mui';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { useContext, useCallback } from 'react';
import { defineMessage, FormattedMessage, MessageDescriptor } from 'react-intl';
import {
  BaseContext,
  useSpotMaturityData,
} from '@notional-finance/notionable-hooks';

interface CollateralSelectProps {
  context: BaseContext;
  inputLabel: MessageDescriptor;
  errorMsg?: MessageDescriptor;
  tightMarginTop?: boolean;
}

export const CollateralSelect = ({
  context,
  inputLabel,
  tightMarginTop,
}: CollateralSelectProps) => {
  const {
    updateState,
    state: {
      deposit,
      collateral,
      collateralOptions,
      availableCollateralTokens,
    },
  } = useContext(context);
  const spotRates = useSpotMaturityData(
    deposit ? availableCollateralTokens : []
  );
  const options = availableCollateralTokens?.map((c) => {
    return {
      token: c,
      largeFigure:
        collateralOptions?.find((o) => o.token.id === c.id)?.interestRate ||
        spotRates.find(({ tokenId }) => c.id === tokenId)?.tradeRate ||
        0,
      largeFigureSuffix:
        c.tokenType === 'fCash' ? '% Fixed APY' : '% Variable APY',
      caption: '70% LTV',
    };
  });

  const highestApy = Math.max(
    ...(options?.map(({ largeFigure }) => largeFigure) || [0])
  );

  const caption =
    highestApy > 0 ? (
      <FormattedMessage
        {...defineMessage({
          defaultMessage: 'Earn up to {apy}',
          description: 'input caption',
        })}
        values={{
          apy: `${formatNumberAsPercent(highestApy)}% APY`,
        }}
      />
    ) : null;

  const onSelect = useCallback(
    (id: string | null) => {
      const c = availableCollateralTokens?.find((t) => t.id === id);
      updateState({ collateral: c });
    },
    [updateState, availableCollateralTokens]
  );

  return options && collateral ? (
    <AssetSelectDropdown
      tightMarginTop={tightMarginTop}
      selectedTokenId={collateral.id}
      inputLabel={inputLabel}
      onSelect={onSelect}
      options={options}
      caption={caption}
    />
  ) : (
    <PageLoading />
  );
};
