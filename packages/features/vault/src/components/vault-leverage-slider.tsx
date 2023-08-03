import { CountUp, LabelValue } from '@notional-finance/mui';
import { MessageDescriptor } from 'react-intl';
import { messages } from '../messages';
import { TransactionCostCaption } from './transaction-cost-caption';
import { useVaultActionErrors } from '../hooks';
import { LeverageSlider } from '@notional-finance/trade';
import { VaultContext } from '@notional-finance/notionable-hooks';
import { TokenBalance } from '@notional-finance/core-entities';

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
    state: { deposit, debtFee, collateralFee, netRealizedDebtBalance },
  } = context;
  const { underMinAccountBorrow, leverageRatioError, minBorrowSize } =
    useVaultActionErrors();
  const transactionCosts = deposit
    ? (debtFee?.toToken(deposit) || TokenBalance.zero(deposit)).add(
        collateralFee?.toToken(deposit) || TokenBalance.zero(deposit)
      )
    : undefined;

  const borrowAmount = (
    <LabelValue inline error={underMinAccountBorrow}>
      <CountUp
        value={netRealizedDebtBalance?.abs().toFloat() || 0}
        suffix={` ${netRealizedDebtBalance?.symbol || ''}`}
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
      cashBorrowed={netRealizedDebtBalance}
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
