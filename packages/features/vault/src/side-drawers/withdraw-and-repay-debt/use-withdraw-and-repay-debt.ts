import {
  useAccount,
  useBaseVault,
  useVault,
  useVaultAccount,
} from '@notional-finance/notionable-hooks';
import { TypedBigNumber, VaultAccount } from '@notional-finance/sdk';
import {
  TradeProperties,
  TradePropertyKeys,
  TransactionData,
} from '@notional-finance/trade';
import { useFormState } from '@notional-finance/utils';
import { VAULT_ACTIONS, tradeDefaults } from '@notional-finance/shared-config';
import { formatLeverageRatio } from '@notional-finance/helpers';
import { useEffect } from 'react';
import { MessageDescriptor } from 'react-intl';
import { messages } from '../messages';

interface DeleverageVaultState {
  depositAmount: TypedBigNumber | undefined;
  hasError: boolean;
  targetLeverageRatio: number | undefined;
}

const initialDeleverageVaultState = {
  depositAmount: undefined,
  hasError: false,
  targetLeverageRatio: undefined,
};

export function useDeleverageVault(
  vaultAddress: string,
  action: VAULT_ACTIONS
) {
  const [state, updateDeleverageVaultState] =
    useFormState<DeleverageVaultState>(initialDeleverageVaultState);
  const { address } = useAccount();
  const { vaultAccount } = useVaultAccount(vaultAddress);
  const {
    primaryBorrowSymbol,
    maxLeverageRatio,
    defaultLeverageRatio,
    minLeverageRatio,
  } = useVault(vaultAddress);
  const baseVault = useBaseVault(vaultAddress);
  const { depositAmount, hasError, targetLeverageRatio } = state;
  const isDeposit = action === VAULT_ACTIONS.DELEVERAGE_VAULT_DEPOSIT;
  let sliderError: MessageDescriptor | undefined;
  let sliderInfo: MessageDescriptor | undefined;
  let depositError: MessageDescriptor | undefined;

  let fCashToLend: TypedBigNumber | undefined;
  let vaultSharesToRedeemAtCost: TypedBigNumber | undefined;
  let updatedVaultAccount: VaultAccount | undefined;
  if (
    vaultAccount &&
    baseVault &&
    isDeposit &&
    primaryBorrowSymbol &&
    depositAmount
  ) {
    ({ newVaultAccount: updatedVaultAccount } = baseVault.simulateEnter(
      vaultAccount,
      vaultAccount.maturity,
      TypedBigNumber.fromBalance(0, primaryBorrowSymbol, true),
      depositAmount.toInternalPrecision()
    ));

    if (baseVault.getLeverageRatio(updatedVaultAccount) < minLeverageRatio) {
      depositError = {
        ...messages[VAULT_ACTIONS.DELEVERAGE_VAULT]['belowMinLeverageError'],
        values: {
          minLeverage: formatLeverageRatio(minLeverageRatio, 2),
        },
      } as MessageDescriptor;
    }
  } else if (!isDeposit && vaultAccount && baseVault && targetLeverageRatio) {
    // During deleverage, the target leverage ratio cannot increase above the current
    // leverage ratio
    const currentLeverageRatio = baseVault.getLeverageRatio(vaultAccount);
    if (targetLeverageRatio > currentLeverageRatio) {
      sliderError = {
        ...messages[VAULT_ACTIONS.DELEVERAGE_VAULT]['aboveMaxLeverageError'],
        values: {
          maxLeverage: formatLeverageRatio(currentLeverageRatio, 2),
        },
      } as MessageDescriptor;
    }

    try {
      const exitParams = baseVault.getExitParamsFromLeverageRatio(
        vaultAccount,
        targetLeverageRatio
      );

      if (exitParams.isFullExit) {
        sliderInfo = {
          ...messages[VAULT_ACTIONS.DELEVERAGE_VAULT]['fullExitInfo'],
        } as MessageDescriptor;
      }

      ({
        fCashToLend,
        vaultSharesToRedeemAtCost,
        newVaultAccount: updatedVaultAccount,
      } = exitParams);
    } catch (e) {
      console.error(e);
    }
  }

  const canSubmit =
    (isDeposit ? hasError === false && !!depositAmount : true) &&
    (!isDeposit ? !!fCashToLend && !!vaultSharesToRedeemAtCost : true) &&
    !!baseVault &&
    !!vaultAccount &&
    !!address &&
    !!primaryBorrowSymbol &&
    depositError === undefined &&
    sliderError === undefined;

  let sideDrawerInfo: TradeProperties = {};
  if (vaultAccount && baseVault) {
    sideDrawerInfo = {
      [TradePropertyKeys.remainingDebt]: updatedVaultAccount
        ? updatedVaultAccount.primaryBorrowfCash.neg()
        : vaultAccount.primaryBorrowfCash.neg(),
      [TradePropertyKeys.remainingAssets]: updatedVaultAccount
        ? baseVault.getCashValueOfShares(updatedVaultAccount).toUnderlying()
        : baseVault.getCashValueOfShares(vaultAccount).toUnderlying(),
    };
  }

  let transactionData: TransactionData | undefined;
  if (canSubmit) {
    const transactionProperties = {
      ...sideDrawerInfo,
      [TradePropertyKeys.leverageRatio]: updatedVaultAccount
        ? baseVault.getLeverageRatio(updatedVaultAccount)
        : baseVault.getLeverageRatio(vaultAccount),
    };

    if (isDeposit && depositAmount) {
      transactionData = {
        transactionHeader: '',
        transactionProperties,
        buildTransactionCall: {
          transactionFn: baseVault.populateEnterTransaction.bind(baseVault),
          transactionArgs: [
            address,
            depositAmount,
            vaultAccount.maturity,
            TypedBigNumber.fromBalance(0, primaryBorrowSymbol, true),
            tradeDefaults.defaultAnnualizedSlippage,
          ],
        },
      };
    } else {
      transactionData = {
        transactionHeader: '',
        transactionProperties,
        buildTransactionCall: {
          transactionFn: baseVault.populateExitTransaction.bind(baseVault),
          transactionArgs: [
            address,
            vaultAccount.maturity,
            vaultSharesToRedeemAtCost,
            fCashToLend,
            tradeDefaults.defaultAnnualizedSlippage,
          ],
        },
      };
    }
  }

  useEffect(() => {
    if (
      !isDeposit &&
      baseVault &&
      vaultAccount &&
      targetLeverageRatio === undefined
    ) {
      // Set the leverage ratio to the max deleverage ratio by default
      updateDeleverageVaultState({ targetLeverageRatio: defaultLeverageRatio });
    }
  }, [
    isDeposit,
    targetLeverageRatio,
    vaultAccount,
    baseVault,
    updateDeleverageVaultState,
    defaultLeverageRatio,
  ]);

  return {
    canSubmit,
    transactionData,
    sideDrawerInfo,
    maxLeverageRatio,
    sliderError,
    sliderInfo,
    depositError,
    targetLeverageRatio,
    primaryBorrowSymbol,
    updatedVaultAccount,
    updateDeleverageVaultState,
  };
}
