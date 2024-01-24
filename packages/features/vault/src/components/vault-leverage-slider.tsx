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
  sliderInfo,
  context,
}: {
  inputLabel: MessageDescriptor;
  sliderInfo?: MessageDescriptor;
  context: VaultContext;
}) => {
  const {
    state: {
      deposit,
      debtFee,
      collateralFee,
      netRealizedDebtBalance,
      underMinAccountBorrow,
      minBorrowSize,
    },
  } = context;
  const { leverageRatioError, isDeleverage } = useVaultActionErrors();
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
      showMinMax
      isDeleverage={isDeleverage}
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
