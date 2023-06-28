import { useContext } from 'react';
import { CountUp, LabelValue, SliderInput } from '@notional-finance/mui';
import { useVaultProperties } from '@notional-finance/notionable-hooks';
import { MessageDescriptor } from 'react-intl';
import { messages } from '../messages';
import { DebtAmountCaption } from './debt-amount-caption';
import { TransactionCostCaption } from './transaction-cost-caption';
import {
  useDefaultLeverageRatio,
  useVaultActionErrors,
  useVaultCosts,
} from '../hooks';
import { VaultActionContext } from '../vault-view/vault-action-provider';

export const LeverageSlider = ({
  inputLabel,
  sliderError,
  sliderInfo,
  repayDebt,
}: {
  inputLabel: MessageDescriptor;
  sliderError?: MessageDescriptor;
  sliderInfo?: MessageDescriptor;
  repayDebt?: boolean;
}) => {
  const {
    updateState,
    state: { vaultAddress, debtBalance },
  } = useContext(VaultActionContext);
  const { sliderInputRef } = useDefaultLeverageRatio();
  const { maxLeverageRatio } = useVaultProperties(vaultAddress);
  const { underMinAccountBorrow, leverageRatioError, minBorrowSize } =
    useVaultActionErrors();
  const { transactionCosts, cashBorrowed } = useVaultCosts();

  const borrowAmount = (
    <LabelValue inline error={underMinAccountBorrow}>
      <CountUp
        value={debtBalance?.abs().toFloat() || 0}
        suffix={` ${debtBalance?.symbol || ''}`}
        decimals={3}
      />
    </LabelValue>
  );

  return (
    <SliderInput
      ref={sliderInputRef}
      min={0}
      max={maxLeverageRatio}
      onChangeCommitted={(leverageRatio) =>
        updateState({
          riskFactorLimit: {
            riskFactor: 'leverageRatio',
            limit: leverageRatio,
          },
        })
      }
      infoMsg={sliderInfo}
      errorMsg={
        sliderError ||
        leverageRatioError ||
        (underMinAccountBorrow
          ? Object.assign(messages.error.underMinBorrow, {
              values: { minBorrowSize, borrowAmount },
            })
          : undefined)
      }
      rightCaption={
        <DebtAmountCaption repayDebt={repayDebt} amount={cashBorrowed} />
      }
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
