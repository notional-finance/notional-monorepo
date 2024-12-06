import { useCallback } from 'react';
import { LeverageSlider, TransactionSidebar } from '@notional-finance/trade';
import { defineMessage } from 'react-intl';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { ErrorMessage } from '@notional-finance/mui';

export const AdjustLeverage = () => {
  const trade = useCurrentTradeContext();
  const calculateError = trade?.calculateError;
  const isDeleverage = trade?.isDeleverage;

  // NOTE: when the leverage slider goes below the account's default position
  // then we need to swap the debt and collateral tokens
  const onChange = useCallback(
    (leverageRatio: number) => {
      trade?.setNTokenAdjustedLeverage(leverageRatio);
    },
    [trade]
  );

  return (
    <TransactionSidebar riskComponent={<LiquidityDetailsTable />}>
      <LeverageSlider
        isDeleverage={isDeleverage}
        showMinMax
        inputLabel={defineMessage({
          defaultMessage: 'Specify Leverage',
        })}
        onChange={onChange}
      />
      {calculateError && (
        <ErrorMessage message={calculateError} variant="error" />
      )}
    </TransactionSidebar>
  );
};
