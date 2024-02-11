import { useContext } from 'react';
import { LiquidityContext } from '../../liquidity';
import { ErrorMessage } from '@notional-finance/mui';
import { useQueryParams } from '@notional-finance/notionable-hooks';
import { TABLE_WARNINGS } from '@notional-finance/util';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { defineMessage, FormattedMessage, defineMessages } from 'react-intl';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';
import { useMaxLiquidityWithdraw } from '../hooks/use-max-liquidity-withdraw';

const messages = {
  [TABLE_WARNINGS.HIGH_UTILIZATION_NTOKEN]: defineMessages({
    title: { defaultMessage: 'Impermanent Loss', description: '' },
    message: {
      defaultMessage:
        'Fixed rate volatility has caused IL. IL will go away when fixed rates return to normal range.',
      description: '',
    },
  }),
  [TABLE_WARNINGS.HIGH_UTILIZATION_FCASH]: defineMessages({
    title: { defaultMessage: 'Impermanent Loss', description: '' },
    message: {
      defaultMessage:
        'Fixed rate volatility has caused temporary fCash price declines. Your fixed rate is guaranteed if you hold until maturity.',
      description: '',
    },
  }),
};

export const Withdraw = () => {
  const context = useContext(LiquidityContext);
  const search = useQueryParams();
  const warning = search.get('warning') as TABLE_WARNINGS | undefined;
  const { currencyInputRef, onMaxValue, maxWithdraw } =
    useMaxLiquidityWithdraw(context);

  return (
    <TransactionSidebar
      context={context}
      heading={defineMessage({ defaultMessage: 'Withdraw' })}
      helptext={defineMessage({
        defaultMessage: 'Unwind your position and withdraw your capital.',
      })}
      riskComponent={<LiquidityDetailsTable />}
      isWithdraw
    >
      <DepositInput
        isWithdraw
        showScrollPopper
        ref={currencyInputRef}
        context={context}
        inputRef={currencyInputRef}
        maxWithdraw={maxWithdraw}
        onMaxValue={onMaxValue}
        inputLabel={defineMessage({
          defaultMessage: 'Enter amount to withdraw',
        })}
      />
      {warning && (
        <ErrorMessage
          variant="warning"
          title={<FormattedMessage {...messages[warning]['title']} />}
          message={<FormattedMessage {...messages[warning]['message']} />}
          maxWidth={'100%'}
        />
      )}
    </TransactionSidebar>
  );
};
