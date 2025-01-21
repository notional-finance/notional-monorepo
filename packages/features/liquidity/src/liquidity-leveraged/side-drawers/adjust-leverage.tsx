import { useCallback, useState } from 'react';
import { LeverageSlider, TransactionSidebar } from '@notional-finance/trade';
import { defineMessage } from 'react-intl';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { ErrorMessage } from '@notional-finance/mui';

export const AdjustLeverage = () => {
  const trade = useCurrentTradeContext();
  const calculateError = trade?.calculateError;
  const isDeleverage = trade?.isDeleverage;
  const [hasTouched, setHasTouched] = useState(false);

  const onChange = useCallback(
    (leverageRatio: number) => {
      if (!hasTouched) setHasTouched(true);
      trade?.setNTokenAdjustedLeverage(leverageRatio);
    },
    [trade, hasTouched]
  );

  return (
    <TransactionSidebar
      canSubmitOverride={hasTouched}
      riskComponent={<LiquidityDetailsTable />}
    >
      <LeverageSlider
        isDeleverage={isDeleverage}
        showMinMax
        inputLabel={defineMessage({
          defaultMessage: 'Specify Leverage',
        })}
        onChange={onChange}
      />
      {calculateError && hasTouched && (
        <ErrorMessage message={calculateError} variant="error" />
      )}
    </TransactionSidebar>
  );
};
