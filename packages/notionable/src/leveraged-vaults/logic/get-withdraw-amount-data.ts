import { logError, NonLoggedError } from '@notional-finance/helpers';
import {
  BaseVault,
  GenericBaseVault,
  TypedBigNumber,
  VaultAccount,
} from '@notional-finance/sdk';
import { tradeDefaults, VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultError } from '../vault-action-store';

interface VaultWithdrawDataDependencies {
  // Via Inputs
  vaultAction: VAULT_ACTIONS;
  withdrawAmount?: TypedBigNumber;
  maxWithdraw?: boolean;
  leverageRatio?: number;
  // Via Init
  accountAddress?: string;
  vaultAccount: VaultAccount;
  baseVault: GenericBaseVault;
}

export function getWithdrawAmountData(inputs: VaultWithdrawDataDependencies) {
  if (
    ![
      VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT,
      VAULT_ACTIONS.WITHDRAW_VAULT,
      VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY,
    ].includes(inputs.vaultAction)
  ) {
    // If not in the withdraw and repay debt action, clear all of these inputs, do not
    // clear updatedVaultAccount
    return {
      amountToWallet: undefined,
      fCashToLend: undefined,
      vaultSharesToRedeem: undefined,
      costToRepay: undefined,
    };
  }

  const {
    amountToWallet,
    fCashToLend,
    vaultSharesToRedeem,
    updatedVaultAccount,
    costToRepay,
    transactionCosts,
  } = _getWithdrawAmountData(inputs);

  const { accountAddress, baseVault, vaultAccount } = inputs;

  return {
    amountToWallet,
    fCashToLend,
    vaultSharesToRedeem,
    costToRepay: costToRepay?.toUnderlying(),
    transactionCosts: transactionCosts?.toUnderlying(),
    updatedVaultAccount,
    buildTransactionCall:
      updatedVaultAccount && accountAddress
        ? {
            transactionFn: baseVault.populateExitTransaction.bind(baseVault),
            transactionArgs: [
              accountAddress,
              vaultAccount.maturity,
              vaultSharesToRedeem,
              fCashToLend,
              tradeDefaults.defaultAnnualizedSlippage,
            ],
          }
        : undefined,
  };
}

function _getWithdrawAmountData({
  vaultAction,
  withdrawAmount,
  maxWithdraw,
  leverageRatio,
  vaultAccount,
  baseVault,
}: VaultWithdrawDataDependencies) {
  let amountToWallet: TypedBigNumber | undefined;
  let fCashToLend: TypedBigNumber | undefined;
  let costToRepay: TypedBigNumber | undefined;
  let netTradingFee: TypedBigNumber | undefined;
  let vaultSharesToRedeem: TypedBigNumber | undefined;
  let updatedVaultAccount: VaultAccount | undefined;

  try {
    if (vaultAction === VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY) {
      ({
        amountRedeemed: amountToWallet,
        newVaultAccount: updatedVaultAccount,
      } = baseVault.simulateExitPostMaturity(vaultAccount));

      return {
        amountToWallet,
        updatedVaultAccount,
        costToRepay: vaultAccount.primaryBorrowfCash.copy(0),
        transactionCosts: vaultAccount.primaryBorrowfCash.copy(0),
        fCashToLend: vaultAccount.primaryBorrowfCash.copy(0),
        vaultSharesToRedeem: vaultAccount.vaultShares.copy(0),
      };
    } else if (vaultAction === VAULT_ACTIONS.WITHDRAW_VAULT && maxWithdraw) {
      return getFullWithdrawAmounts(baseVault, vaultAccount);
    } else if (vaultAction === VAULT_ACTIONS.WITHDRAW_VAULT && withdrawAmount) {
      return getPartialWithdrawAmounts(baseVault, vaultAccount, withdrawAmount);
    } else if (
      vaultAction === VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT &&
      leverageRatio
    ) {
      ({
        fCashToLend,
        costToRepay,
        netTradingFee,
        newVaultAccount: updatedVaultAccount,
        vaultSharesToRedeemAtCost: vaultSharesToRedeem,
      } = baseVault.getExitParamsFromLeverageRatio(
        vaultAccount,
        leverageRatio
      ));

      return {
        amountToWallet: undefined,
        updatedVaultAccount,
        fCashToLend,
        costToRepay,
        transactionCosts: netTradingFee,
        vaultSharesToRedeem,
      };
    }
  } catch (e) {
    logError(
      e as NonLoggedError,
      'vault-action-manager',
      'getWithdrawAmountData'
    );

    return {
      error: VaultError.ErrorCalculatingWithdraw,
    };
  }

  return {
    amountToWallet,
    fCashToLend,
    costToRepay,
    transactionCosts: netTradingFee,
    vaultSharesToRedeem,
    updatedVaultAccount: undefined,
  };
}

export function getFullWithdrawAmounts(
  baseVault: GenericBaseVault,
  vaultAccount: VaultAccount
) {
  const {
    costToRepay,
    newVaultAccount: updatedVaultAccount,
    netTradingFee,
  } = baseVault.simulateExitPreMaturityInFull(vaultAccount);

  const amountToWallet = baseVault
    .getCashValueOfShares(vaultAccount)
    .toUnderlying()
    // Cost to Repay is negative
    .add(costToRepay.toUnderlying());
  const fCashToLend = vaultAccount.primaryBorrowfCash.neg();
  const vaultSharesToRedeem = vaultAccount.vaultShares;

  return {
    updatedVaultAccount,
    amountToWallet,
    fCashToLend,
    vaultSharesToRedeem,
    costToRepay,
    transactionCosts: netTradingFee,
  };
}

function getPartialWithdrawAmounts(
  baseVault: GenericBaseVault,
  vaultAccount: VaultAccount,
  withdrawAmount: TypedBigNumber
) {
  let costToRepay: TypedBigNumber | undefined;
  let netTradingFee: TypedBigNumber | undefined;
  let fCashToLend: TypedBigNumber | undefined;
  let vaultSharesToRedeem: TypedBigNumber | undefined;
  let updatedVaultAccount: VaultAccount | undefined;

  // Simulate how much the account needs to redeem in order to satisfy the withdraw, does
  // not calculate how much it costs to lend an offsetting position
  ({
    newVaultAccount: updatedVaultAccount,
    vaultSharesToRedeemAtCost: vaultSharesToRedeem,
  } = baseVault.simulateExitPreMaturityGivenWithdraw(
    vaultAccount,
    withdrawAmount
  ));
  const previousLeverageRatio = baseVault.getLeverageRatio(vaultAccount);
  const newLeverageRatio = baseVault.getLeverageRatio(updatedVaultAccount);

  // Minimum leverage ratio the account has to maintain in order to stay inside the vault.
  // If the account drifts above this on exit, then it will have to exit in full
  const minLeverageRatio = BaseVault.collateralToLeverageRatio(
    baseVault.getVault().maxRequiredAccountCollateralRatioBasisPoints
  );

  if (newLeverageRatio < minLeverageRatio) {
    // If this drifts below the vault minimum leverage ratio it means that we've withdrawn into
    // a position where a full exit is required. Any additional repayment of debt will further
    // decrease the leverage ratio.
    return getFullWithdrawAmounts(baseVault, vaultAccount);
  } else if (previousLeverageRatio < newLeverageRatio) {
    // If the new leverage ratio is higher than the previous leverage ratio, then attempt to
    // calculate how much debt to repay to reduce the leverage ratio to the previous level such
    // that the account does not take on additional risk
    let isFullExit = false;
    let vaultSharesToRedeemAtCost: TypedBigNumber;

    ({
      fCashToLend,
      newVaultAccount: updatedVaultAccount,
      isFullExit,
      vaultSharesToRedeemAtCost,
      costToRepay,
      netTradingFee,
    } = baseVault.getExitParamsFromLeverageRatio(
      updatedVaultAccount,
      previousLeverageRatio
    ));

    if (isFullExit) {
      return getFullWithdrawAmounts(baseVault, vaultAccount);
    } else {
      // Sum the vault shares to redeem to fulfill the withdraw and the amount to redeem
      // to repay the debt
      vaultSharesToRedeem = vaultSharesToRedeem.add(vaultSharesToRedeemAtCost);
    }
  }

  return {
    // Unless there is a full exit, the amount to wallet is the specified withdraw amount
    amountToWallet: withdrawAmount,
    fCashToLend,
    vaultSharesToRedeem,
    updatedVaultAccount,
    costToRepay,
    transactionCosts: netTradingFee,
  };
}
