import { useContext } from 'react';
import { VaultLeverageSlider, VaultSideDrawer } from '../components';
import { messages } from '../messages';
import { VaultActionContext } from '../vault';

export const WithdrawAndRepayDebt = () => {
  const context = useContext(VaultActionContext);
  const {
    state: { calculateError, postAccountRisk },
  } = context;

  const sliderError = calculateError
    ? messages['WithdrawAndRepayVault']['leverageTooHigh']
    : undefined;

  const isFullRepayment = postAccountRisk?.leverageRatio === null;
  const sliderInfo = isFullRepayment
    ? messages['WithdrawAndRepayVault']['fullRepaymentInfo']
    : undefined;

  return (
    <VaultSideDrawer context={context}>
      <VaultLeverageSlider
        context={context}
        repayDebt
        sliderError={sliderError}
        sliderInfo={sliderInfo}
        inputLabel={messages['WithdrawAndRepayVault'].leverage}
      />
    </VaultSideDrawer>
  );
};
