import { useCallback, useMemo } from 'react';
import {
  BaseTradeContext,
  useAllMarkets,
  useSpotMaturityData,
} from '@notional-finance/notionable-hooks';
import { formatMaturity } from '@notional-finance/util';
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
      selectedNetwork
    },
    updateState,
  } = context;
  const { nonLeveragedYields } = useAllMarkets(selectedNetwork);
  const spotMaturityData = useSpotMaturityData(
    deposit ? availableDebtTokens : [], selectedNetwork
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

  const formatOptions = (options: any[]) => {
    const result = [] as any[];
    // First sort options by maturity
    options.sort((a, b) => {
      if (a?.token?.maturity && b?.token?.maturity) {
        return a.token.maturity - b.token.maturity;
      } else {
        return 0;
      }
    });
    // then push variable debt to the beginning of the array
    for (const option of options) {
      if (
        option.token.symbol.includes('open') ||
        option.token.tokenType === 'PrimeDebt'
      ) {
        result.unshift(option);
      } else {
        result.push(option);
      }
    }

    return result;
  };

  const borrowOptions = useMemo(() => {
    // Note this is a any[] because there were conflicts when attempting to combine the debtOptions and spotMaturityData types
    const options = debtOptions || spotMaturityData;
    const formattedOptions = formatOptions(options);

    return formattedOptions.map((o, index) => {
      const borrowRate = o?.interestRate || o?.tradeRate;
      const totalAPY = leveragedYield(assetAPY, borrowRate, leverageRatio);
      return {
        error:
          o?.error === 'Error: Insufficient Liquidity' ? (
            <FormattedMessage defaultMessage={'Insufficient Liquidity'} />
          ) : o?.error ? (
            <FormattedMessage defaultMessage={'Error'} />
          ) : undefined,
        optionTitle:
          index === 0 ? (
            <FormattedMessage defaultMessage={'Variable Rate'} />
          ) : o?.token.maturity && index === 1 ? (
            <FormattedMessage defaultMessage={'Fixed Rate'} />
          ) : undefined,
        token: o?.token,
        largeCaption: totalAPY ? totalAPY : undefined,
        largeCaptionSuffix: '% Total APY',
        largeFigure: borrowRate,
        largeFigureSuffix: `% Borrow APY`,
        caption:
          o?.token.maturity && !o?.token?.symbol.includes('open') ? (
            <Box>
              <FormattedMessage defaultMessage={'Fixed:'} />{' '}
              {formatMaturity(o?.token.maturity)}
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

  const defaultDebtOption = isVault
    ? borrowOptions.find((data) => data?.token?.symbol.includes('open'))
    : borrowOptions.find((data) => data?.token?.tokenType === 'PrimeDebt');

  return { borrowOptions, onSelect, defaultDebtOption };
};
