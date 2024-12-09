import { ErrorMessage } from '@notional-finance/mui';
import { useQueryParams } from '@notional-finance/notionable-hooks';
import {
  DepositInput,
  TransactionSidebar,
  useMaxLiquidityWithdraw,
} from '@notional-finance/trade';
import { defineMessage, FormattedMessage, defineMessages } from 'react-intl';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';

const messages = {
  nTokenHighUtilization: defineMessages({
    title: { defaultMessage: 'Impermanent Loss', description: '' },
    message: {
      defaultMessage:
        'Fixed rate volatility has caused IL. IL will go away if fixed rates go down.',
      description: '',
    },
  }),
  fCashHighUtilization: defineMessages({
    title: { defaultMessage: 'Impermanent Loss', description: '' },
    message: {
      defaultMessage:
        'Fixed rate volatility has caused temporary fCash price declines. Your fixed rate is guaranteed if you hold until maturity.',
      description: '',
    },
  }),
};

export const Withdraw = () => {
  const search = useQueryParams();
  const warning = search.get('warning') as keyof typeof messages | undefined;
  const { currencyInputRef, onMaxValue, maxWithdrawUnderlying } =
    useMaxLiquidityWithdraw();

  return (
    <TransactionSidebar
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
        inputRef={currencyInputRef}
        maxWithdraw={maxWithdrawUnderlying}
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
