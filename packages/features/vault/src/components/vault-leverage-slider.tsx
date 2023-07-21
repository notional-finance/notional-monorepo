import { useContext } from 'react';
import { CountUp, LabelValue } from '@notional-finance/mui';
import { MessageDescriptor } from 'react-intl';
import { messages } from '../messages';
import { TransactionCostCaption } from './transaction-cost-caption';
import { useVaultActionErrors, useVaultCosts } from '../hooks';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { useVaultProperties } from '@notional-finance/notionable-hooks';
import { LeverageSlider } from '@notional-finance/trade';

export const VaultLeverageSlider = ({
  inputLabel,
  sliderError,
  sliderInfo,
}: {
  inputLabel: MessageDescriptor;
  sliderError?: MessageDescriptor;
  sliderInfo?: MessageDescriptor;
  repayDebt?: boolean;
}) => {
  const {
    state: { debtBalance, vaultAddress },
  } = useContext(VaultActionContext);
  const { defaultLeverageRatio, maxLeverageRatio } =
    useVaultProperties(vaultAddress);
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
      context={VaultActionContext}
      maxLeverageRatio={maxLeverageRatio}
      defaultLeverageRatio={defaultLeverageRatio}
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
