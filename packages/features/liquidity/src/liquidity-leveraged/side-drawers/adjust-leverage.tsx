import { useContext } from 'react';
import { LiquidityContext } from '../../liquidity';
import { LeverageSlider, TransactionSidebar } from '@notional-finance/trade';
import { defineMessage } from 'react-intl';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';

export const AdjustLeverage = () => {
  const context = useContext(LiquidityContext);
  // NOTE: when the leverage slider goes below the account's default position
  // then we need to swap the debt and collateral tokens

  return (
    <TransactionSidebar
      context={context}
      riskComponent={<LiquidityDetailsTable />}
    >
      <LeverageSlider
        context={context}
        inputLabel={defineMessage({
          defaultMessage: 'Adjust Leverage Ratio',
        })}
      />
    </TransactionSidebar>
  );
};
