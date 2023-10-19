import { useCallback, useContext, useState } from 'react';
import { LiquidityContext } from '../../liquidity';
import { LeverageSlider, TransactionSidebar } from '@notional-finance/trade';
import { defineMessage } from 'react-intl';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';
import { useLeveragedNTokenPositions } from '../hooks';

export const AdjustLeverage = () => {
  const context = useContext(LiquidityContext);
  const {
    state: { selectedDepositToken, debt, collateral, deposit },
    updateState,
  } = context;
  const { currentPosition } = useLeveragedNTokenPositions(selectedDepositToken);
  const [isDeleverage, setIsDeleverage] = useState(false)

  // NOTE: when the leverage slider goes below the account's default position
  // then we need to swap the debt and collateral tokens
  const onChange = useCallback(
    (leverageRatio: number) => {
      if (!isFinite(leverageRatio)) return;

      if (currentPosition) {
        if (
          leverageRatio >= currentPosition.leverageRatio &&
          (debt?.id !== currentPosition.debt.tokenId ||
            collateral?.id !== currentPosition.asset.tokenId)
        ) {
          setIsDeleverage(false)
          updateState({
            collateral: currentPosition.asset.token,
            debt: currentPosition.debt.token,
            collateralBalance: undefined,
            debtBalance: undefined,
          });
        } else if (
          leverageRatio < currentPosition.leverageRatio &&
          (debt?.id !== currentPosition.asset.tokenId ||
            collateral?.id !== currentPosition.debt.tokenId)
        ) {
          setIsDeleverage(true)
          updateState({
            collateral: currentPosition.debt.token,
            debt: currentPosition.asset.token,
            collateralBalance: undefined,
            debtBalance: undefined,
          });
        }

        updateState({
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
      riskComponent={<LiquidityDetailsTable />}
    >
      <LeverageSlider
        context={context}
        leverageCurrencyId={deposit?.currencyId}
        isDeleverage={isDeleverage}
        inputLabel={defineMessage({
          defaultMessage: 'Specify Leverage',
        })}
        onChange={onChange}
      />
    </TransactionSidebar>
  );
};
