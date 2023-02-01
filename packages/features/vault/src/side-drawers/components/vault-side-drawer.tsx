import { ActionSidebar, ToggleSwitchProps } from '@notional-finance/mui';
import { TransactionData } from '@notional-finance/notionable';
import { VaultAccount } from '@notional-finance/sdk';
import { TransactionConfirmation } from '@notional-finance/trade';
import { VaultRiskTable } from '@notional-finance/risk';
import { useQueryParams } from '@notional-finance/utils';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useHistory, useLocation, useParams } from 'react-router';
import { messages } from '../messages';

export interface VaultParams {
  vaultAddress?: string;
  sideDrawerKey?: VAULT_ACTIONS;
}

interface VaultSideDrawerProps {
  action: VAULT_ACTIONS;
  canSubmit: boolean;
  vaultAddress: string;
  updatedVaultAccount?: VaultAccount;
  children?: React.ReactNode | React.ReactNode[];
  transactionData?: TransactionData;
  advancedToggle?: ToggleSwitchProps;
}

export const VaultSideDrawer = ({
  action,
  children,
  canSubmit,
  transactionData,
  advancedToggle,
  vaultAddress,
  updatedVaultAccount,
}: VaultSideDrawerProps) => {
  const history = useHistory();
  // const { sideDrawerKey } = useParams<VaultParams>();
  // const { confirm } = useQueryParams();
  // const { search } = useLocation();
  // const confirmRoute = !!confirm;

  // const searchParams = new URLSearchParams(search);

  // searchParams.delete('confirm');

  // const cancelRoute = `/vaults/${vaultAddress}/${sideDrawerKey}${
  //   searchParams.toString() ? '?' + searchParams.toString() : ''
  // }`;

  // const returnToVaults = `/vaults/${vaultAddress}`;

  return transactionData ? (
    <TransactionConfirmation
      heading={transactionData?.transactionHeader}
      onCancel={() => history.push('')}
      transactionProperties={transactionData?.transactionProperties}
      buildTransactionCall={transactionData?.buildTransactionCall}
      showDrawer={false}
      onReturnToForm={() => history.push('')}
    />
  ) : (
    <ActionSidebar
      heading={messages[action].heading}
      helptext={messages[action].helptext}
      advancedToggle={advancedToggle}
      showDrawer={false}
      canSubmit={canSubmit}
      cancelRoute={''}
    >
      {children}
      {action !== VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY && (
        <VaultRiskTable
          key={'vault-risk-table'}
          updatedVaultAccount={updatedVaultAccount}
          vaultAddress={vaultAddress}
        />
      )}
    </ActionSidebar>
  );
};
