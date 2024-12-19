import { CountUp, LabelValue } from '@notional-finance/mui';
import { formatLeverageRatio } from '@notional-finance/helpers';
import { MessageDescriptor } from 'react-intl';
import { messages } from '../messages';
import { tradeErrors } from '@notional-finance/trade';
import {
  useCurrentTradeContext,
  useVaultPosition,
} from '@notional-finance/notionable-hooks';

export function useVaultActionErrors() {
  const trade = useCurrentTradeContext();
  const { debt } = trade?.selectedTokens ?? {};
  const depositBalance = trade?.depositBalance;
  const selectedNetwork = trade?.selectedNetwork;
  const vaultAddress = trade?.vaultAddress;
  const calculateError = trade?.calculateError;
  const minLeverageRatio = trade?.minLeverageRatio;
  const maxLeverageRatio = trade?.maxLeverageRatio;
  const selectedLeverageRatio = trade?.leverageRatio;
  const capacity = trade?.getVaultCapacity();
  const minBorrowSize = capacity?.minBorrowSize;
  const overCapacityError = capacity?.overCapacityError;
  const overPoolCapacityError = capacity?.overPoolCapacityError;
  const underMinAccountBorrow = capacity?.underMinAccountBorrow;
  const netRealizedDebtBalance = trade?.netRealizedDebtBalance;

  const currentPosition = useVaultPosition(selectedNetwork, vaultAddress);

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
    leverageRatioError,
    underMinAccountBorrowError,
    isDeleverage:
      !!selectedLeverageRatio &&
      selectedLeverageRatio < (currentPosition?.leverageRatio || -1),
  };
}
