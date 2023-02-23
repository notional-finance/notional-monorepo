import { ActionSidebar, ToggleSwitchProps } from '@notional-finance/mui';
import { TransactionData } from '@notional-finance/trade';
import { VaultAccount } from '@notional-finance/sdk';
import {
  TransactionConfirmation,
  TradeActionButton,
} from '@notional-finance/trade';
import { VaultDetailsTable } from '@notional-finance/risk';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useHistory } from 'react-router';
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
      CustomActionButton={TradeActionButton}
      hideTextOnMobile={false}
    >
      {children}
      {action !== VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY && (
        <VaultDetailsTable
          key={'vault-risk-table'}
          updatedVaultAccount={updatedVaultAccount}
          vaultAddress={vaultAddress}
        />
      )}
    </ActionSidebar>
  );
};
