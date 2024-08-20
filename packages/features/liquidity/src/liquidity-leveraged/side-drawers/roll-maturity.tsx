import { useContext } from 'react';
import { LiquidityContext } from '../../liquidity';
import { TransactionSidebar } from '@notional-finance/trade';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';
import { MessageDescriptor, defineMessage } from 'react-intl';
import { formatMaturity } from '@notional-finance/util';

export const RollMaturity = () => {
  const context = useContext(LiquidityContext);
  const {
    state: { debt, collateral },
  } = context;

  let heading:
    | MessageDescriptor
    | { defaultMessage: string; values?: Record<string, any> };
  let helptext: MessageDescriptor;
  if (debt?.tokenType === 'PrimeDebt') {
    heading = defineMessage({
      defaultMessage: 'Convert to Variable Borrow Rate',
    });
    helptext = defineMessage({
      defaultMessage:
        'Convert your fixed borrow rate to a variable borrow rate for full flexibility.',
    });
  } else if (collateral?.tokenType === 'PrimeCash') {
    heading = defineMessage({
      defaultMessage: 'Convert to Fixed Borrow Rate',
    });
    helptext = defineMessage({
      defaultMessage:
        'Convert your variable debt to a fixed rate and stabilize your total return.',
    });
  } else {
    heading = {
      ...defineMessage({
        defaultMessage: 'Roll Fixed Borrow to {maturity}',
      }),
      values: {
        maturity: formatMaturity(debt?.maturity || 0),
      },
    };
    helptext = defineMessage({
      defaultMessage:
        'Roll your debt and fix your borrow rate at a new maturity.',
    });
  }

  return (
    <TransactionSidebar
      context={context}
      heading={heading}
      helptext={helptext}
      variableBorrowRequired={debt?.tokenType === 'PrimeDebt'}
      riskComponent={<LiquidityDetailsTable />}
    />
  );
};
