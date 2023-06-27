import { LabelValue } from '@notional-finance/mui';
import { formatLeverageRatio } from '@notional-finance/helpers';
import { useVaultCapacity } from './use-vault-capacity';
import { useContext } from 'react';
import { MessageDescriptor } from 'react-intl';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';
import { tradeErrors } from '@notional-finance/trade';
import { useVaultProperties } from '@notional-finance/notionable-hooks';

export function useVaultActionErrors() {
  const {
    state: {
      canSubmit,
      postAccountRisk,
      depositBalance,
      debt,
      calculateError,
      vaultAddress,
    },
  } = useContext(VaultActionContext);
  const { overCapacityError, underMinAccountBorrow, minBorrowSize } =
    useVaultCapacity();
  const { minLeverageRatio, maxLeverageRatio } =
    useVaultProperties(vaultAddress);
  const leverageRatio = postAccountRisk?.leverageRatio;

  let inputErrorMsg: MessageDescriptor | undefined;
  if (depositBalance && !debt) {
    inputErrorMsg = tradeErrors.selectMaturityToCompleteTrade;
  } else if (overCapacityError) {
    inputErrorMsg = messages.error.overCapacity;
  } else if (calculateError) {
    inputErrorMsg = tradeErrors.insufficientLiquidity;
  }

  let leverageRatioError: MessageDescriptor | undefined;
  if (leverageRatio && minLeverageRatio && leverageRatio < minLeverageRatio) {
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
  } else if (leverageRatio && leverageRatio > maxLeverageRatio) {
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

  return {
    underMinAccountBorrow,
    minBorrowSize,
    inputErrorMsg,
    canSubmit,
    leverageRatioError,
  };
}
