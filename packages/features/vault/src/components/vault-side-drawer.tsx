import { useContext } from 'react';
import {
  ActionSidebar,
  ToggleSwitchProps,
  ProgressIndicator,
} from '@notional-finance/mui';
import { useQueryParams } from '@notional-finance/utils';
import {
  TransactionConfirmation,
  TradeActionButton,
} from '@notional-finance/trade';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useVault } from '@notional-finance/notionable-hooks';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { formatMaturity } from '@notional-finance/helpers';
import { useHistory } from 'react-router';
import { messages } from '../messages';
import { useTransactionProperties } from '../hooks/use-transaction-properties';
import { VaultDetailsTable } from './vault-details-table';

interface VaultSideDrawerProps {
  children?: React.ReactNode | React.ReactNode[];
  advancedToggle?: ToggleSwitchProps;
}

export const VaultSideDrawer = ({
  children,
  advancedToggle,
}: VaultSideDrawerProps) => {
  const { confirm } = useQueryParams();
  const history = useHistory();
  const confirmRoute = !!confirm;
  const {
    updateState,
    state: {
      vaultAccount,
      vaultAddress,
      vaultAction,
      buildTransactionCall,
      updatedVaultAccount,
      minBorrowSize,
    },
  } = useContext(VaultActionContext);
  const transactionData = useTransactionProperties();
  const useVaultData = useVault(vaultAddress);
  const currentVaultAddress = vaultAddress || '';
  const canSubmit = buildTransactionCall ? true : false;

  const helptextValues = {
    minDepositRequired: useVaultData?.minDepositRequired,
    minBorrowSize,
  };

  const formattedMaturity = vaultAccount?.maturity
    ? formatMaturity(vaultAccount?.maturity)
    : '';

  const handleCancel = () => {
    history.push(`/vaults/${vaultAddress}`);
    // updateState({ vaultAction: undefined });
    if (vaultAction === VAULT_ACTIONS.WITHDRAW_VAULT) {
      updateState({
        maxWithdraw: false,
        withdrawAmount: undefined,
      });
    }
  };

  const handleSubmit = () => {
    updateState({ confirm: true });
  };

  return (
    <div>
      {vaultAction ? (
        transactionData && confirmRoute ? (
          <TransactionConfirmation
            heading={transactionData?.transactionHeader}
            onCancel={handleCancel}
            transactionProperties={transactionData?.transactionProperties}
            buildTransactionCall={transactionData?.buildTransactionCall}
            showDrawer={false}
            onReturnToForm={handleCancel}
          />
        ) : (
          <ActionSidebar
            heading={messages[vaultAction].heading}
            helptext={{
              ...messages[vaultAction].helptext,
              values: helptextValues,
            }}
            advancedToggle={advancedToggle}
            showDrawer={false}
            canSubmit={canSubmit}
            cancelRoute={''}
            CustomActionButton={TradeActionButton}
            handleSubmit={handleSubmit}
            hideTextOnMobile={false}
          >
            {children}
            {vaultAction !== VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY && (
              <VaultDetailsTable
                key={'vault-risk-table'}
                updatedVaultAccount={updatedVaultAccount}
                maturity={formattedMaturity}
                vaultAddress={currentVaultAddress}
              />
            )}
          </ActionSidebar>
        )
      ) : (
        <ProgressIndicator type="notional" />
      )}
    </div>
  );
};
