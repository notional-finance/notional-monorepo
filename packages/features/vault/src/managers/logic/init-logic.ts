import { reportNotionalError } from '@notional-finance/notionable';
import { getVaultAccount } from '@notional-finance/notionable-hooks';
import {
  GenericBaseVault,
  VaultConfig,
  VaultAccount,
  Account,
  VaultFactory,
  TypedBigNumber,
} from '@notional-finance/sdk';
import { Market, System } from '@notional-finance/sdk/src/system';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { getNowSeconds } from '@notional-finance/helpers';
import { MessageDescriptor } from 'react-intl';
import { messages } from '../../messages';

interface InitVaultActionDependencies {
  system: System;
  activeVaultMarkets: Map<string, string[]>;
  vaultAddress: string;
  account: Account | null;
}

export function getInitVaultAction({
  system,
  account,
  vaultAddress,
  activeVaultMarkets,
}: InitVaultActionDependencies) {
  let vaultAccount: VaultAccount | undefined;
  let settledVaultValues:
    | {
        strategyTokens: TypedBigNumber;
        assetCash: TypedBigNumber;
      }
    | undefined;
  let vaultConfig: VaultConfig | undefined;
  let baseVault: GenericBaseVault | undefined;
  let eligibleMarkets: Market[] = [];
  let eligibleActions: VAULT_ACTIONS[] = [];
  let noEligibleMarketsReason: MessageDescriptor | undefined;

  try {
    vaultAccount = getVaultAccount(account?.accountData, vaultAddress);
    settledVaultValues = vaultAccount.canSettle()
      ? vaultAccount.getSettlementValues()
      : undefined;
    vaultConfig = system.getVault(vaultAddress);
    baseVault = VaultFactory.buildVaultFromCache(
      vaultConfig.strategy,
      vaultAddress
    );
    eligibleMarkets = getEligibleMarkets(
      system,
      vaultConfig,
      vaultAccount,
      activeVaultMarkets,
      vaultAddress
    );
    eligibleActions = getEligibleActions(eligibleMarkets, vaultAccount);

    if (eligibleMarkets.length === 0) {
      noEligibleMarketsReason =
        vaultAccount.maturity > getNowSeconds()
          ? messages.error.noEligibleMarketsIdiosyncratic
          : messages.error.maturedNotSettled;
    }
  } catch (e) {
    // May throw an error on undefined vault address, in this case
    // we return default values for the rest of the parameters but report
    // an error which takes us to the 404 page
    reportNotionalError(
      { ...(e as Error), code: 404 },
      'vault-action',
      'getInitVaultAction'
    );
  }

  return {
    vaultAccount,
    vaultConfig,
    baseVault,
    eligibleMarkets,
    eligibleActions,
    settledVaultValues,
    noEligibleMarketsReason,
    // Clear the vault action so it can get reset
    vaultAction: undefined,
  };
}

function getEligibleMarkets(
  system: System,
  vaultConfig: VaultConfig,
  vaultAccount: VaultAccount,
  activeVaultMarkets: Map<string, string[]>,
  vaultAddress: string
) {
  const activeMarketKeys = activeVaultMarkets.get(vaultAddress) || [];
  const markets = system
    .getMarkets(vaultConfig.primaryBorrowCurrency)
    .filter((m) => activeMarketKeys.includes(m.marketKey));

  if (vaultAccount.isInactive) {
    return markets;
  } else if (vaultAccount.maturity > getNowSeconds()) {
    return markets.filter((m) =>
      vaultConfig.allowRollPosition
        ? // if we allow rolling positions then include longer dated maturities
          m.maturity >= vaultAccount.maturity
        : m.maturity === vaultAccount.maturity
    );
  } else {
    // In the edge case that the vault maturity has not yet settled, then we
    // return no eligible markets
    return [];
  }
}

function getEligibleActions(
  eligibleMarkets: Market[],
  vaultAccount: VaultAccount
) {
  const eligibleActions: VAULT_ACTIONS[] = [];
  if (vaultAccount.isInactive) {
    eligibleActions.push(VAULT_ACTIONS.CREATE_VAULT_POSITION);
  } else {
    if (
      eligibleMarkets.map((m) => m.maturity).includes(vaultAccount.maturity)
    ) {
      eligibleActions.push(VAULT_ACTIONS.INCREASE_POSITION);
    }

    if (
      eligibleMarkets.filter((m) => m.maturity > vaultAccount.maturity).length >
      0
    ) {
      eligibleActions.push(VAULT_ACTIONS.ROLL_POSITION);
    }
  }

  return eligibleActions;
}
