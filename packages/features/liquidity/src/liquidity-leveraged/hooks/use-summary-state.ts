import { LiquidityContext } from '../../liquidity';
import { useContext } from 'react';
import { useLeveragedNTokenPositions } from './use-leveraged-ntoken-positions';
import { BaseTradeState } from '@notional-finance/notionable';

/**
 * Overrides default state values because for leveraged liquidity
 * the trade types and debt / collateral values change depending on
 * the side sheet chosen. Instead, we use the current nToken position
 * if it exists.
 */
export const useSummaryState = (): BaseTradeState => {
  const { state: internalState } = useContext(LiquidityContext);
  const { selectedDepositToken } = internalState;
  const { currentHoldings } = useLeveragedNTokenPositions(
    selectedDepositToken || ''
  );

  if (currentHoldings) {
    return {
      ...internalState,
      tradeType: 'LeveragedNToken',
      collateral: currentHoldings.asset.balance.token,
      debt: currentHoldings.debt.balance.token,
      collateralBalance:
        internalState.collateralBalance?.tokenType === 'nToken'
          ? internalState.collateralBalance
          : // TODO: will this break anything if we reduce nTokens?
          internalState.debtBalance?.tokenType === 'nToken'
          ? internalState.debtBalance
          : undefined,
      debtBalance:
        internalState.collateralBalance?.tokenType === 'nToken'
          ? internalState.debtBalance
          : internalState.debtBalance?.tokenType === 'nToken'
          ? internalState.collateralBalance
          : undefined,
      riskFactorLimit: internalState.riskFactorLimit || {
        riskFactor: 'leverageRatio',
        limit: currentHoldings.leverageRatio,
        args: [currentHoldings.asset.balance.currencyId],
      },
      debtOptions:
        internalState.debt?.id === currentHoldings.debt.balance.tokenId
          ? internalState.debtOptions
          : [
              {
                token: currentHoldings.debt.balance.token,
                interestRate: currentHoldings.borrowAPY,
              },
            ],
    };
  } else {
    return internalState;
  }
};
