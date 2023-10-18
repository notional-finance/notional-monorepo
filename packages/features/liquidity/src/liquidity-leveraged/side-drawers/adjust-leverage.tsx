import { useCallback, useContext } from 'react';
import { LiquidityContext } from '../../liquidity';
import { LeverageSlider, TransactionSidebar } from '@notional-finance/trade';
import { defineMessage } from 'react-intl';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';
import { useLeveragedNTokenPositions } from '../hooks';

export const AdjustLeverage = () => {
  const context = useContext(LiquidityContext);
  const {
    state: { selectedDepositToken, debt, collateral },
    updateState,
  } = context;
  const { currentPosition } = useLeveragedNTokenPositions(selectedDepositToken);

  // NOTE: when the leverage slider goes below the account's default position
  // then we need to swap the debt and collateral tokens
  const onChange = useCallback(
    (leverageRatio: number) => {
      if (!isFinite(leverageRatio)) return;

      if (currentPosition) {
        let tokenState = {};
        if (
          leverageRatio >= currentPosition.leverageRatio &&
          (debt?.id !== currentPosition.debt.tokenId ||
            collateral?.id !== currentPosition.asset.tokenId)
        ) {
          tokenState = {
            collateral: currentPosition.asset.token,
            debt: currentPosition.debt.token,
            collateralBalance: undefined,
            debtBalance: undefined,
          };
        } else if (
          leverageRatio < currentPosition.leverageRatio &&
          (debt?.id !== currentPosition.asset.tokenId ||
            collateral?.id !== currentPosition.debt.tokenId)
        ) {
          tokenState = {
            collateral: currentPosition.debt.token,
            debt: currentPosition.asset.token,
            collateralBalance: undefined,
            debtBalance: undefined,
          };
        }

        updateState({
          ...tokenState,
          riskFactorLimit: {
            riskFactor: 'leverageRatio',
            limit: leverageRatio,
            args: [currentPosition.asset.currencyId],
          },
        });
      }
    },
    [currentPosition, debt, collateral, updateState]
  );

  return (
    <TransactionSidebar
      context={context}
      heading={defineMessage({ defaultMessage: 'Adjust Leverage' })}
      helptext={defineMessage({
        defaultMessage: 'Increase or decrease your position leverage.',
      })}
      riskComponent={<LiquidityDetailsTable />}
    >
      <LeverageSlider
        context={context}
        inputLabel={defineMessage({
          defaultMessage: 'Specify Leverage',
        })}
        onChange={onChange}
      />
    </TransactionSidebar>
  );
};
