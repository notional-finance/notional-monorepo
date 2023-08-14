import { LabelValue } from '@notional-finance/mui';
import { formatLeverageRatio } from '@notional-finance/helpers';
import { useVaultCapacity } from './use-vault-capacity';
import { useContext } from 'react';
import { MessageDescriptor } from 'react-intl';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';
import { tradeErrors } from '@notional-finance/trade';

export function useVaultActionErrors() {
  const {
    state: {
      canSubmit,
      depositBalance,
      debt,
      calculateError,
      minLeverageRatio,
      maxLeverageRatio,
      tradeType,
      riskFactorLimit,
      debtBalance,
      priorAccountRisk,
    },
  } = useContext(VaultActionContext);
  const { overCapacityError, underMinAccountBorrow, minBorrowSize } =
    useVaultCapacity();
  const priorLeverageRatio = priorAccountRisk?.leverageRatio;
  const selectedLeverageRatio = riskFactorLimit?.limit as number | undefined;

  let inputErrorMsg: MessageDescriptor | undefined;
  if (depositBalance && !debt) {
    inputErrorMsg = tradeErrors.selectMaturityToCompleteTrade;
  } else if (overCapacityError) {
    inputErrorMsg = messages.error.overCapacity;
  } else if (calculateError) {
    inputErrorMsg = tradeErrors.insufficientLiquidity;
  }

  let leverageRatioError: MessageDescriptor | undefined;
  if (
    minLeverageRatio !== undefined &&
    maxLeverageRatio !== undefined &&
    selectedLeverageRatio !== undefined
  ) {
    if (
      tradeType === 'WithdrawAndRepayVault' &&
      priorLeverageRatio !== undefined &&
      priorLeverageRatio !== null &&
      priorLeverageRatio < selectedLeverageRatio
    ) {
      leverageRatioError = {
        ...messages.error.withdrawAndRepayLeverageDecrease,
        values: {
          priorLeverageRatio: (
            <LabelValue error inline>
              {formatLeverageRatio(priorLeverageRatio)}
            </LabelValue>
          ),
        },
      } as MessageDescriptor;
    } else if (
      tradeType === 'IncreaseVaultPosition' &&
      debtBalance?.isPositive()
    ) {
      leverageRatioError = messages.error.increasePositionDebtsMustIncrease;
    } else if (selectedLeverageRatio < minLeverageRatio) {
      leverageRatioError = {
        ...messages.error.belowMinimumLeverage,
        values: {
          minLeverageRatio: (
            <LabelValue error inline>
              {formatLeverageRatio(minLeverageRatio)}
            </LabelValue>
          ),
        },
      } as MessageDescriptor;
    } else if (maxLeverageRatio < selectedLeverageRatio) {
      leverageRatioError = {
        ...messages.error.aboveMaximumLeverage,
        values: {
          maxLeverageRatio: (
            <LabelValue error inline>
              {formatLeverageRatio(maxLeverageRatio)}
            </LabelValue>
          ),
        },
      } as MessageDescriptor;
    }
  }

  return {
    underMinAccountBorrow,
    minBorrowSize,
    inputErrorMsg,
    canSubmit,
    leverageRatioError,
  };
}
