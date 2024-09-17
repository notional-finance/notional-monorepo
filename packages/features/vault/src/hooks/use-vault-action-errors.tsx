import { CountUp, LabelValue } from '@notional-finance/mui';
import { formatLeverageRatio } from '@notional-finance/helpers';
import { useContext } from 'react';
import { MessageDescriptor } from 'react-intl';
import { VaultActionContext } from '../vault';
import { messages } from '../messages';
import { tradeErrors } from '@notional-finance/trade';
import { useVaultPosition } from '@notional-finance/notionable-hooks';

export function useVaultActionErrors() {
  const {
    state: {
      canSubmit,
      depositBalance,
      debt,
      calculateError,
      minLeverageRatio,
      maxLeverageRatio,
      riskFactorLimit,
      minBorrowSize,
      overCapacityError,
      overPoolCapacityError,
      selectedNetwork,
      vaultAddress,
      underMinAccountBorrow,
      netRealizedDebtBalance
    },
  } = useContext(VaultActionContext);
  const currentPosition = useVaultPosition(selectedNetwork, vaultAddress);
  const selectedLeverageRatio = riskFactorLimit?.limit as number | undefined;

  let inputErrorMsg: MessageDescriptor | undefined;
  if (depositBalance && !debt) {
    inputErrorMsg = tradeErrors.selectMaturityToCompleteTrade;
  } else if (overCapacityError) {
    inputErrorMsg = messages.error.overCapacity;
  } else if (overPoolCapacityError) {
    inputErrorMsg = messages.error.overPoolCapacity;
  } else if (calculateError) {
    inputErrorMsg = tradeErrors.insufficientLiquidity;
  }

  let leverageRatioError: MessageDescriptor | undefined;
  if (
    minLeverageRatio !== undefined &&
    maxLeverageRatio !== undefined &&
    selectedLeverageRatio !== undefined
  ) {
    if (selectedLeverageRatio < minLeverageRatio) {
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

  let underMinAccountBorrowError: MessageDescriptor | undefined;
  if (underMinAccountBorrow) {
    const borrowAmount = (
      <LabelValue inline error={underMinAccountBorrow}>
        <CountUp
          value={netRealizedDebtBalance?.abs().toFloat() || 0}
          suffix={` ${netRealizedDebtBalance?.symbol || ''}`}
          decimals={3}
        />
      </LabelValue>
    );

    underMinAccountBorrowError = Object.assign(messages.error.underMinBorrow, {
      values: { minBorrowSize, borrowAmount },
    });
  }

  return {
    minBorrowSize,
    inputErrorMsg,
    canSubmit,
    leverageRatioError,
    underMinAccountBorrowError,
    isDeleverage:
      !!selectedLeverageRatio &&
      selectedLeverageRatio < (currentPosition?.leverageRatio || -1),
  };
}
