import { CountUp, LabelValue } from '@notional-finance/mui';
import { MessageDescriptor } from 'react-intl';
import { messages } from '../messages';
import { TransactionCostCaption } from './transaction-cost-caption';
import { useVaultActionErrors, useVaultCosts } from '../hooks';
import { LeverageSlider } from '@notional-finance/trade';
import { VaultContext } from '@notional-finance/notionable-hooks';

export const VaultLeverageSlider = ({
  inputLabel,
  sliderError,
  sliderInfo,
  context,
}: {
  inputLabel: MessageDescriptor;
  sliderError?: MessageDescriptor;
  sliderInfo?: MessageDescriptor;
  repayDebt?: boolean;
  context: VaultContext;
}) => {
  const {
    state: { debtBalance },
  } = context;
  const { underMinAccountBorrow, leverageRatioError, minBorrowSize } =
    useVaultActionErrors();
  const { transactionCosts, cashBorrowed } = useVaultCosts();

  const borrowAmount = (
    <LabelValue inline error={underMinAccountBorrow}>
      <CountUp
        value={debtBalance?.toUnderlying().abs().toFloat() || 0}
        suffix={` ${debtBalance?.underlying.symbol || ''}`}
        decimals={3}
      />
    </LabelValue>
  );

  const errorMsg =
    sliderError ||
    leverageRatioError ||
    (underMinAccountBorrow
      ? Object.assign(messages.error.underMinBorrow, {
          values: { minBorrowSize, borrowAmount },
        })
      : undefined);

  return (
    <LeverageSlider
      context={context}
      infoMsg={sliderInfo}
      errorMsg={errorMsg}
      cashBorrowed={cashBorrowed}
      bottomCaption={
        <TransactionCostCaption
          toolTipText={messages.summary.transactionCostToolTip}
          transactionCosts={transactionCosts}
        />
      }
      inputLabel={inputLabel}
    />
  );
};
