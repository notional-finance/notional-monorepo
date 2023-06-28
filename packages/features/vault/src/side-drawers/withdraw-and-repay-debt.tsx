import { useContext, useEffect } from 'react';
import { LeverageSlider, VaultSideDrawer } from '../components';
import { messages } from '../messages';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { TokenBalance } from '@notional-finance/core-entities';

export const WithdrawAndRepayDebt = () => {
  const {
    state: { calculateError, postAccountRisk, deposit },
    updateState,
  } = useContext(VaultActionContext);

  useEffect(() => {
    // No withdraws when doing a deleverage action
    if (deposit) {
      updateState({
        depositBalance: TokenBalance.zero(deposit),
        tradeType: 'WithdrawAndRepayVault',
      });
    }
  }, [updateState, deposit]);

  const sliderError = calculateError
    ? messages['WithdrawAndRepayVault']['leverageTooHigh']
    : undefined;

  const isFullRepayment = postAccountRisk?.leverageRatio === null;
  const sliderInfo = isFullRepayment
    ? messages['WithdrawAndRepayVault']['fullRepaymentInfo']
    : undefined;

  return (
    <VaultSideDrawer>
      <LeverageSlider
        repayDebt
        sliderError={sliderError}
        sliderInfo={sliderInfo}
        inputLabel={messages['WithdrawAndRepayVault'].leverage}
      />
    </VaultSideDrawer>
  );
};
