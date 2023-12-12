import { useCallback, useMemo } from 'react';
import {
  BaseTradeContext,
  useAllMarkets,
  useSpotMaturityData,
} from '@notional-finance/notionable-hooks';
import { formatMaturity } from '@notional-finance/helpers';
import { isVaultTrade } from '@notional-finance/notionable';
import { leveragedYield } from '@notional-finance/util';
import { TokenDefinition } from '@notional-finance/core-entities';
import { FormattedMessage } from 'react-intl';
import { Box } from '@mui/material';

export const useBorrowTerms = (
  context: BaseTradeContext,
  priorVaultFactors?: {
    vaultShare?: TokenDefinition;
    vaultBorrowRate?: number;
    leverageRatio?: number;
  }
) => {
  const { nonLeveragedYields } = useAllMarkets();
  const {
    state: {
      debtOptions,
      tradeType,
      collateral,
      availableCollateralTokens,
      availableDebtTokens,
      collateralOptions,
      riskFactorLimit,
      deposit,
    },
    updateState,
  } = context;

  // Need to check if deposit is set to resolve some race conditions here
  const spotMaturityData = useSpotMaturityData(
    deposit ? availableDebtTokens : []
  );

  const isVault = isVaultTrade(tradeType);

  const assetAPY =
    collateralOptions?.find((c) => c.token.id === collateral?.id)
      ?.interestRate ||
    nonLeveragedYields.find((y) => y.token.id === collateral?.id)?.totalAPY;

  const leverageRatio =
    riskFactorLimit?.riskFactor === 'leverageRatio'
      ? (riskFactorLimit.limit as number)
      : priorVaultFactors?.leverageRatio;

  const borrowOptions = useMemo(() => {
    const options = (debtOptions || spotMaturityData) as any[];
    return options?.map((o) => {
      const borrowAmount = o?.interestRate || o?.tradeRate;
      const totalAPY = leveragedYield(assetAPY, borrowAmount, leverageRatio);

      return {
        token: o.token,
        largeCaption: totalAPY ? totalAPY : undefined,
        largeFigure: borrowAmount,
        largeFigureSuffix: `% Borrow APY`,
        caption: o.token.maturity ? (
          <Box>
            <FormattedMessage defaultMessage={'Fixed:'} />{' '}
            {formatMaturity(o.token.maturity)}
          </Box>
        ) : (
          <FormattedMessage defaultMessage={'Variable'} />
        ),
      };
    });
  }, [debtOptions, spotMaturityData, leverageRatio, assetAPY]);

  const onSelect = useCallback(
    (selectedId: string | null) => {
      if (isVault) {
        // Selects the matching vault collateral asset when the debt asset is selected
        const debt = availableDebtTokens?.find((t) => t.id === selectedId);
        const collateral = availableCollateralTokens?.find(
          (t) => t.maturity === debt?.maturity
        );
        updateState({ debt, collateral });
      } else {
        const debt = availableDebtTokens?.find((t) => t.id === selectedId);
        updateState({ debt });
      }
    },
    [availableCollateralTokens, availableDebtTokens, updateState, isVault]
  );

  const defaultDebtOption = borrowOptions.find(
    (data) => data.token.tokenType === 'PrimeDebt'
  );

  return { borrowOptions, onSelect, defaultDebtOption };
};
