import { useAccount, useVaultCapacity } from '@notional-finance/notionable-hooks';
import { TransactionFunction } from '@notional-finance/notionable';
import { TypedBigNumber } from '@notional-finance/sdk';
import { Market } from '@notional-finance/sdk/src/system';
import { TradePropertyKeys } from '@notional-finance/trade';
import { tradeDefaults, useQueryParams, VAULT_ACTIONS } from '@notional-finance/utils';
import { useContext } from 'react';
import { VaultActionContext } from '../managers';
import { messages } from '../messages';
import { useGeoipBlock } from './use-geoip-block';

export const useVaultTransaction = () => {
  const mustBlockGeo = useGeoipBlock();
  const { address } = useAccount();
  const { state } = useContext(VaultActionContext);
  const {
    depositAmount,
    hasError,
    selectedMarketKey,
    leverageRatio,
    vaultAction,
    vaultAccount,
    vaultAddress,
    fCashBorrowAmount,
    baseVault,
  } = state;
  const { overCapacityError } = useVaultCapacity(vaultAddress, fCashBorrowAmount);
  const { confirm } = useQueryParams();
  const confirmRoute = !!confirm;
  const selectedMaturity = selectedMarketKey ? Market.parseMaturity(selectedMarketKey) : undefined;

  if (
    !confirmRoute ||
    hasError ||
    !fCashBorrowAmount ||
    overCapacityError ||
    !baseVault ||
    !selectedMaturity ||
    !address ||
    mustBlockGeo
  ) {
    return undefined;
  }

  const slippageBuffer = tradeDefaults.defaultAnnualizedSlippage;
  let buildTransactionCall: TransactionFunction;
  if (vaultAction === VAULT_ACTIONS.ESTABLISH_ACCOUNT) {
    buildTransactionCall = {
      transactionFn: baseVault.populateEnterTransaction.bind(baseVault),
      transactionArgs: [
        address,
        depositAmount,
        selectedMaturity,
        fCashBorrowAmount,
        slippageBuffer,
      ],
    };
  } else if (vaultAction === VAULT_ACTIONS.INCREASE_POSITION) {
    buildTransactionCall = {
      transactionFn: baseVault.populateEnterTransaction.bind(baseVault),
      transactionArgs: [
        address,
        depositAmount || TypedBigNumber.fromBalance(0, baseVault.getPrimaryBorrowSymbol(), false),
        selectedMaturity,
        fCashBorrowAmount,
        slippageBuffer,
      ],
    };
  } else if (vaultAction === VAULT_ACTIONS.ROLL_POSITION && vaultAccount) {
    buildTransactionCall = {
      transactionFn: baseVault.populateRollTransaction.bind(baseVault),
      transactionArgs: [
        address,
        selectedMaturity,
        depositAmount || TypedBigNumber.fromBalance(0, baseVault.getPrimaryBorrowSymbol(), false),
        fCashBorrowAmount,
        slippageBuffer,
        vaultAccount,
      ],
    };
  } else {
    return undefined;
  }

  return {
    buildTransactionCall,
    transactionHeader: messages[vaultAction].confirm,
    transactionProperties: {
      [TradePropertyKeys.deposit]: depositAmount,
      [TradePropertyKeys.maturity]: selectedMaturity,
      [TradePropertyKeys.additionalDebt]: fCashBorrowAmount.abs(),
      [TradePropertyKeys.leverageRatio]: leverageRatio,
    },
  };
};
