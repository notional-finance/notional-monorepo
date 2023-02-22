import {
  useAccount,
  useBaseVault,
  useVault,
  useVaultAccount,
} from '@notional-finance/notionable-hooks';
import { TransactionData } from '@notional-finance/trade';
import { TypedBigNumber, VaultAccount } from '@notional-finance/sdk';
import { TradeProperties, TradePropertyKeys } from '@notional-finance/trade';
import { useFormState } from '@notional-finance/utils';
import {
  VAULT_ACTIONS,
  tradeDefaults,
} from '@notional-finance/shared-config';
import { formatLeverageRatio } from '@notional-finance/helpers';
import { useEffect } from 'react';
import { MessageDescriptor } from 'react-intl';
import { messages } from '../messages';

interface DepositCollateralState {
  depositAmount: TypedBigNumber | undefined;
  hasError: boolean;
  targetLeverageRatio: number | undefined;
}

const initialDepositCollateralState = {
  depositAmount: undefined,
  hasError: false,
  targetLeverageRatio: undefined,
};

export function useDepositCollateral(
  vaultAddress: string,
) {
  const [state, updateDepositCollateralState] =
    useFormState<DepositCollateralState>(initialDepositCollateralState);
  const { address } = useAccount();
  const { vaultAccount } = useVaultAccount(vaultAddress);
  const {
    primaryBorrowSymbol,
    maxLeverageRatio,
    defaultLeverageRatio,
  } = useVault(vaultAddress);

  const baseVault = useBaseVault(vaultAddress);

  const { depositAmount, targetLeverageRatio } = state;


  let sliderError: MessageDescriptor | undefined;
  let sliderInfo: MessageDescriptor | undefined;
  let depositError: MessageDescriptor | undefined;

  let fCashToLend: TypedBigNumber | undefined;
  let vaultSharesToRedeemAtCost: TypedBigNumber | undefined;
  let updatedVaultAccount: VaultAccount | undefined;

 if (vaultAccount && baseVault && targetLeverageRatio) {
    // During deleverage, the target leverage ratio cannot increase above the current
    // leverage ratio
    const currentLeverageRatio = baseVault.getLeverageRatio(vaultAccount);
    if (targetLeverageRatio > currentLeverageRatio) {
      sliderError = {
        ...messages[VAULT_ACTIONS.DELEVERAGE_VAULT][
          'aboveMaxLeverageError'
        ],
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
    (!!fCashToLend && !!vaultSharesToRedeemAtCost) &&
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

    if (depositAmount) {
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
      baseVault &&
      vaultAccount &&
      targetLeverageRatio === undefined
    ) {
      // Set the leverage ratio to the max deleverage ratio by default
      updateDepositCollateralState({ targetLeverageRatio: defaultLeverageRatio });
    }
  }, [
    targetLeverageRatio,
    vaultAccount,
    baseVault,
    updateDepositCollateralState,
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
    updateDepositCollateralState,
  };
}
