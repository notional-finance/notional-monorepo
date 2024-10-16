import { AssetSelectDropdown } from '@notional-finance/mui';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { useCallback, useEffect } from 'react';
import { defineMessage, FormattedMessage, MessageDescriptor } from 'react-intl';
import {
  TradeContext,
  useSpotMaturityData,
} from '@notional-finance/notionable-hooks';

interface CollateralSelectProps {
  context: TradeContext;
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
      depositBalance,
      collateralOptions,
      availableCollateralTokens,
    },
  } = context;
  const spotRates = useSpotMaturityData(
    deposit ? availableCollateralTokens : []
  );

  const options = availableCollateralTokens
    ?.map((c, i) => {
      const opt = collateralOptions?.find((o) => o.token.id === c.id);
      // If there is an input but no balance, the trade has failed
      const disabled = !!depositBalance && opt?.balance === undefined;

      return {
        token: c,
        largeFigure: disabled
          ? 0
          : opt?.interestRate ||
            spotRates.find(({ tokenId }) => c.id === tokenId)?.tradeRate ||
            0,
        largeFigureDecimals: 2,
        largeFigureSuffix:
          c.tokenType === 'fCash' ? '% Fixed APY' : '% Variable APY',
        disabled,
        sortOrder:
          c.tokenType === 'PrimeCash'
            ? 0
            : c.tokenType === 'nToken'
            ? 1
            : i + 99,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

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
          apy: `${formatNumberAsPercent(highestApy)} APY`,
        }}
      />
    ) : null;

  const onSelect = useCallback(
    (id: string | null) => {
      const c = options?.find((t) => t.token.id === id);
      updateState({ collateral: c?.token });
    },
    [updateState, options]
  );

  useEffect(() => {
    if (
      !collateral &&
      options &&
      options.length > 0 &&
      deposit &&
      deposit.currencyId === options[0].token.currencyId
    ) {
      updateState({ collateral: options[0].token });
    }
  }, [options, collateral, updateState, deposit]);

  useEffect(() => {
    // Clears previously selected collateral on route change
    if (deposit?.currencyId !== collateral?.currencyId) {
      updateState({ collateral: undefined });
    }
  }, [deposit, collateral, updateState]);

  return (
    <AssetSelectDropdown
      tightMarginTop={tightMarginTop}
      selectedTokenId={collateral?.id}
      inputLabel={inputLabel}
      onSelect={onSelect}
      options={options}
      caption={caption}
    />
  );
};
