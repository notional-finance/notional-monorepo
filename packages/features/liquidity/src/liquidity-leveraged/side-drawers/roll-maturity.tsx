import { useContext } from 'react';
import { LiquidityContext } from '../../liquidity';
import { TransactionSidebar } from '@notional-finance/trade';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';

export const RollMaturity = () => {
  const context = useContext(LiquidityContext);
  const {
    state: { debt },
  } = context;

  return (
    <TransactionSidebar
      context={context}
      enablePrimeBorrow={debt?.tokenType === 'PrimeDebt'}
      riskComponent={<LiquidityDetailsTable />}
    />
  );
};
