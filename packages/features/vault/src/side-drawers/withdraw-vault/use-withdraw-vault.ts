import {
  useAccount,
  useBaseVault,
  useNotional,
  useVault,
  useVaultAccount,
} from '@notional-finance/notionable-hooks';
import { TransactionData } from '@notional-finance/notionable';
import { TypedBigNumber, VaultAccount } from '@notional-finance/sdk';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import {
  tradeErrors,
  TradeProperties,
  TradePropertyKeys,
} from '@notional-finance/trade';
import { useFormState } from '@notional-finance/utils';
import { logError, NonLoggedError } from '@notional-finance/helpers';
import {
  VAULT_ACTIONS,
  tradeDefaults,
} from '@notional-finance/shared-config';
import { MessageDescriptor } from 'react-intl';
import { messages } from '../messages';
import { useMaxWithdraw } from './use-max-withdraw';

interface WithdrawVaultState {
  withdrawAmountString: string;
  minimumLeverageRatio: number | undefined;
  maximumLeverageRatio: number | undefined;
  maxWithdraw: boolean;
}

const initialWithdrawVaultState = {
  withdrawAmountString: '',
  minimumLeverageRatio: undefined,
  maximumLeverageRatio: undefined,
  maxWithdraw: false,
};

export function useWithdrawVault(vaultAddress: string) {
  const [state, updateWithdrawVaultState] = useFormState<WithdrawVaultState>(
    initialWithdrawVaultState
  );
  const { notional } = useNotional();
  const { address } = useAccount();
  const { vaultAccount } = useVaultAccount(vaultAddress);
  const { primaryBorrowSymbol, maxLeverageRatio, minLeverageRatio } =
    useVault(vaultAddress);
  const baseVault = useBaseVault(vaultAddress);
  const { withdrawAmountString, maxWithdraw } = state;
  const {
    maxWithdrawAmount,
    maxWithdrawAmountString,
    maxWithdrawVaultAccount,
  } = useMaxWithdraw(vaultAddress);
  const targetLeverageRatio =
    baseVault && vaultAccount
      ? baseVault.getLeverageRatio(vaultAccount)
      : undefined;

  const isPostMaturityExit = vaultAccount?.canSettle() || false;
  let error: MessageDescriptor | undefined;

  const withdrawAmount = primaryBorrowSymbol
    ? notional?.parseInput(withdrawAmountString, primaryBorrowSymbol, true)
    : undefined;
  let newVaultAccount: VaultAccount | undefined;
  let vaultSharesToRedeem: TypedBigNumber | undefined;
  let fCashToLend = primaryBorrowSymbol
    ? TypedBigNumber.fromBalance(0, primaryBorrowSymbol, true)
    : undefined;
  let amountToWallet: TypedBigNumber | undefined;

  if (maxWithdraw && vaultAccount && maxWithdrawVaultAccount) {
    newVaultAccount = maxWithdrawVaultAccount;
    fCashToLend = vaultAccount.primaryBorrowfCash.neg();
    vaultSharesToRedeem = vaultAccount.vaultShares;
  } else if (
    !isPostMaturityExit &&
    vaultAccount &&
    baseVault &&
    withdrawAmount?.isPositive()
  ) {
    try {
      const withdraw = baseVault.simulateExitPreMaturityGivenWithdraw(
        vaultAccount,
        withdrawAmount
      );
      newVaultAccount = withdraw.newVaultAccount;
      const newLeverageRatio = baseVault.getLeverageRatio(newVaultAccount);
      // If the leverage ratio drifts below zero then the account cannot withdraw the input amount
      vaultSharesToRedeem = withdraw.vaultSharesToRedeemAtCost;

      if (newLeverageRatio < minLeverageRatio) {
        // If this drifts below the vault minimum leverage ratio it means that we've withdrawn into
        // a position where a full exit is required.
        const repayment =
          baseVault.simulateExitPreMaturityInFull(newVaultAccount);
        newVaultAccount = repayment.newVaultAccount;
        vaultSharesToRedeem = vaultAccount.vaultShares;
        fCashToLend = vaultAccount.primaryBorrowfCash.neg();
      } else if (
        targetLeverageRatio &&
        targetLeverageRatio < newLeverageRatio
      ) {
        // If we are above the target leverage ratio then we need to calculate
        // how much fCashToLend and vault shares to sell in order to reduce the
        // leverage ratio down to the target ratio
        try {
          const repayment = baseVault.getExitParamsFromLeverageRatio(
            newVaultAccount,
            targetLeverageRatio
          );

          vaultSharesToRedeem = repayment.isFullExit
            ? vaultAccount.vaultShares
            : vaultSharesToRedeem.add(repayment.vaultSharesToRedeemAtCost);

          // This method should be the entire cash balance above a certain point
          fCashToLend = vaultAccount.primaryBorrowfCash.neg();
          newVaultAccount = repayment.newVaultAccount;
        } catch (e) {
          logError(
            e as NonLoggedError,
            'use-withdraw-vault',
            'getExitParamsFromLeverageRatio'
          );
          error = messages[VAULT_ACTIONS.WITHDRAW_VAULT]['unableToExit'];
          newVaultAccount = undefined;
        }
      }
    } catch (e) {
      logError(
        e as NonLoggedError,
        'use-withdraw-vault',
        'simulateExitPreMaturityGivenWithdraw'
      );
      error = {
        ...tradeErrors.errorCalculatingWithdraw,
        values: { e: (e as Error).message },
      } as MessageDescriptor;

      newVaultAccount = undefined;
    }
  } else if (isPostMaturityExit && baseVault && vaultAccount) {
    const settlement = baseVault.simulateExitPostMaturity(vaultAccount);
    newVaultAccount = settlement.newVaultAccount;
    amountToWallet = settlement.amountRedeemed;
    fCashToLend = vaultAccount.primaryBorrowfCash.copy(0);
    vaultSharesToRedeem = vaultAccount.vaultShares.copy(0);
  }

  const isFullRepayment = newVaultAccount?.primaryBorrowfCash.isZero() || false;
  const canSubmit =
    !!baseVault &&
    !!vaultAccount &&
    !!address &&
    !!primaryBorrowSymbol &&
    !!fCashToLend &&
    !!vaultSharesToRedeem &&
    error === undefined;

  let transactionData: TransactionData | undefined;
  if (canSubmit) {
    let transactionProperties;
    if (isPostMaturityExit) {
      transactionProperties = {
        [TradePropertyKeys.amountToWallet]: amountToWallet,
      };
    } else {
      transactionProperties = {
        [TradePropertyKeys.amountToWallet]: isFullRepayment
          ? maxWithdrawAmount
          : withdrawAmount,
        [TradePropertyKeys.leverageRatio]: targetLeverageRatio,
        [TradePropertyKeys.remainingDebt]: newVaultAccount
          ? newVaultAccount.primaryBorrowfCash
          : vaultAccount.primaryBorrowfCash,
        [TradePropertyKeys.remainingAssets]: newVaultAccount
          ? baseVault.getCashValueOfShares(newVaultAccount).toUnderlying()
          : baseVault.getCashValueOfShares(vaultAccount).toUnderlying(),
        [TradePropertyKeys.transactionCosts]: undefined,
      };
    }

    transactionData = {
      transactionHeader: '',
      buildTransactionCall: {
        transactionFn: baseVault.populateExitTransaction.bind(baseVault),
        transactionArgs: [
          address,
          vaultAccount.maturity,
          vaultSharesToRedeem,
          fCashToLend,
          tradeDefaults.defaultAnnualizedSlippage,
        ],
      },
      transactionProperties,
    };
  }

  let sideDrawerInfo: TradeProperties = {};
  if (isPostMaturityExit) {
    sideDrawerInfo = {
      [TradePropertyKeys.amountToWallet]: amountToWallet,
    };
  } else if (vaultAccount && baseVault) {
    sideDrawerInfo = {
      [TradePropertyKeys.remainingDebt]: newVaultAccount
        ? newVaultAccount.primaryBorrowfCash.neg()
        : vaultAccount.primaryBorrowfCash.neg(),
      [TradePropertyKeys.remainingAssets]: newVaultAccount
        ? baseVault.getCashValueOfShares(newVaultAccount).toUnderlying()
        : baseVault.getCashValueOfShares(vaultAccount).toUnderlying(),
      [TradePropertyKeys.amountToWallet]: isFullRepayment
        ? maxWithdrawAmount
        : withdrawAmount,
    };
  }

  return {
    canSubmit,
    transactionData,
    sideDrawerInfo,
    isPostMaturityExit,
    maxWithdrawAmountString,
    error,
    isFullRepayment,
    primaryBorrowSymbol,
    minLeverageRatio: minLeverageRatio / RATE_PRECISION,
    targetLeverageRatio,
    maxLeverageRatio: maxLeverageRatio / RATE_PRECISION,
    updatedVaultAccount: newVaultAccount,
    updateWithdrawVaultState,
  };
}
