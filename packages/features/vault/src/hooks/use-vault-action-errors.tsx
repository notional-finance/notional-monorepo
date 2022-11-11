import { LabelValue } from '@notional-finance/mui';
import { formatLeverageRatio } from '@notional-finance/helpers';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useVault, useVaultCapacity } from '@notional-finance/notionable-hooks';
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

  let underMinAccountBorrow = true;
  if (vaultAccount && fCashBorrowAmount && minAccountBorrowSize) {
    underMinAccountBorrow = fCashBorrowAmount
      .add(vaultAccount.primaryBorrowfCash)
      .abs()
      .lte(minAccountBorrowSize);
  } else if (vaultAccount && !fCashBorrowAmount && minAccountBorrowSize) {
    underMinAccountBorrow = vaultAccount.primaryBorrowfCash
      .abs()
      .lte(minAccountBorrowSize);
  } else if (fCashBorrowAmount && minAccountBorrowSize) {
    underMinAccountBorrow = fCashBorrowAmount.abs().lte(minAccountBorrowSize);
  }

  let inputErrorMsg: MessageDescriptor | undefined;
  const { overCapacityError } = useVaultCapacity(
    vaultAddress,
    fCashBorrowAmount
  );
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
    vaultAction === VAULT_ACTIONS.ESTABLISH_ACCOUNT ? !!depositAmount : true;
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
