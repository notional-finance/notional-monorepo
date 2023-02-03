import {
  useAccount,
  useBaseVault,
  useVault,
  useVaultAccount,
} from '@notional-finance/notionable-hooks';
import { TransactionData } from '@notional-finance/notionable';
import { TypedBigNumber, VaultAccount } from '@notional-finance/sdk';
import { TradeProperties, TradePropertyKeys } from '@notional-finance/trade';
import { useFormState } from '@notional-finance/utils';
import {
  VAULT_ACTIONS,
  tradeDefaults,
} from '@notional-finance/shared-config';
import { formatLeverageRatio } from '@notional-finance/helpers';
import { MessageDescriptor } from 'react-intl';
import { messages } from '../messages';

interface withdrawAndRepayDebtState {
  depositAmount: TypedBigNumber | undefined;
  hasError: boolean;
  targetLeverageRatio: number | undefined;
}

const initialWithdrawAndRepayDebtState = {
  depositAmount: undefined,
  hasError: false,
  targetLeverageRatio: undefined,
};

export function useWithdrawAndRepayDebt(
  vaultAddress: string,
) {
  const [state, updateWithdrawAndRepayDebtState] =
    useFormState<withdrawAndRepayDebtState>(initialWithdrawAndRepayDebtState);
  const { address } = useAccount();
  const { vaultAccount } = useVaultAccount(vaultAddress);
  const {
    primaryBorrowSymbol,
    maxLeverageRatio,
    minLeverageRatio,
  } = useVault(vaultAddress);
  const baseVault = useBaseVault(vaultAddress);
  const { depositAmount, hasError, targetLeverageRatio } = state;

  let sliderError: MessageDescriptor | undefined;
  let sliderInfo: MessageDescriptor | undefined;
  let depositError: MessageDescriptor | undefined;

  let fCashToLend: TypedBigNumber | undefined;
  let vaultSharesToRedeemAtCost: TypedBigNumber | undefined;
  let updatedVaultAccount: VaultAccount | undefined;
  if (
    vaultAccount &&
    baseVault &&
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
        ...messages[VAULT_ACTIONS.DELEVERAGE_VAULT][
          'belowMinLeverageError'
        ],
        values: {
          minLeverage: formatLeverageRatio(minLeverageRatio, 2),
        },
      } as MessageDescriptor;
    }
  }

  const canSubmit =
    (hasError === false && !!depositAmount) &&
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
    updateWithdrawAndRepayDebtState,
  };
}
