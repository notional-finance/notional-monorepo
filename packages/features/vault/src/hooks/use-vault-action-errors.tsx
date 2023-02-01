import { LabelValue } from '@notional-finance/mui';
import { formatLeverageRatio } from '@notional-finance/helpers';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useVault } from '@notional-finance/notionable-hooks';
import { useVaultCapacity } from './use-vault-capacity';
import { useContext } from 'react';
import { MessageDescriptor } from 'react-intl';
import { VaultActionContext } from '../managers';
import { messages } from '../messages';
import { tradeErrors } from '@notional-finance/trade';

export function useVaultActionErrors() {
  const { state } = useContext(VaultActionContext);
  const {
    selectedMarketKey,
    depositAmount,
    vaultAddress,
    leverageRatio,
    hasError,
    vaultAction,
    fCashBorrowAmount,
    currentBorrowRate,
    minimumLeverageRatio,
    vaultAccount,
  } = state;
  const { minAccountBorrowSize, maxLeverageRatio } = useVault(vaultAddress);
  const { overCapacityError } = useVaultCapacity();

  let underMinAccountBorrow = false;
  if (vaultAccount && fCashBorrowAmount && minAccountBorrowSize) {
    underMinAccountBorrow = fCashBorrowAmount
      .add(vaultAccount.primaryBorrowfCash)
      .abs()
      .lte(minAccountBorrowSize);
  } else if (
    vaultAccount?.primaryBorrowfCash.isZero() === false &&
    !fCashBorrowAmount &&
    minAccountBorrowSize
  ) {
    underMinAccountBorrow = vaultAccount.primaryBorrowfCash
      .abs()
      .lte(minAccountBorrowSize);
  } else if (fCashBorrowAmount && minAccountBorrowSize) {
    underMinAccountBorrow = fCashBorrowAmount.abs().lte(minAccountBorrowSize);
  }

  let inputErrorMsg: MessageDescriptor | undefined;
  if (depositAmount && !selectedMarketKey) {
    inputErrorMsg = tradeErrors.selectMaturityToCompleteTrade;
  } else if (overCapacityError) {
    inputErrorMsg = messages.error.overCapacity;
  } else if (depositAmount && !currentBorrowRate) {
    inputErrorMsg = tradeErrors.insufficientLiquidity;
  }

  let leverageRatioError: MessageDescriptor | undefined;
  if (
    leverageRatio &&
    minimumLeverageRatio &&
    leverageRatio < minimumLeverageRatio
  ) {
    leverageRatioError = {
      ...messages.error.belowMinimumLeverage,
      values: {
        minLeverageRatio: (
          <LabelValue error inline>
            {formatLeverageRatio(minimumLeverageRatio)}
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

  const hasDepositAmount =
    vaultAction === VAULT_ACTIONS.CREATE_VAULT_POSITION
      ? !!depositAmount
      : true;
  const canSubmit =
    hasError === false &&
    inputErrorMsg === undefined &&
    !!fCashBorrowAmount &&
    !!selectedMarketKey &&
    leverageRatioError === undefined &&
    hasDepositAmount;

  return {
    underMinAccountBorrow,
    inputErrorMsg,
    canSubmit,
    leverageRatioError,
  };
}
