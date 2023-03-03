import { useContext } from 'react';
import {
  ActionSidebar,
  ToggleSwitchProps,
  ProgressIndicator,
} from '@notional-finance/mui';
import { TransactionData } from '@notional-finance/trade';
import { useQueryParams } from '@notional-finance/utils';
import {
  TransactionConfirmation,
  TradeActionButton,
} from '@notional-finance/trade';
import { VaultDetailsTable } from '@notional-finance/risk';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useVault } from '@notional-finance/notionable-hooks';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { formatMaturity } from '@notional-finance/helpers';
import { messages } from '../messages';

export interface VaultParams {
  vaultAddress?: string;
  sideDrawerKey?: VAULT_ACTIONS;
}

interface VaultSideDrawerProps {
  children?: React.ReactNode | React.ReactNode[];
  transactionData?: TransactionData;
  advancedToggle?: ToggleSwitchProps;
}

export const VaultSideDrawer = ({
  children,
  transactionData,
  advancedToggle,
}: VaultSideDrawerProps) => {
  const { confirm } = useQueryParams();
  const { clearSideDrawer } = useSideDrawerManager();
  const confirmRoute = !!confirm;
  const {
    updateState,
    state: {
      vaultAccount,
      vaultAddress,
      vaultAction,
      buildTransactionCall,
      updatedVaultAccount,
    },
  } = useContext(VaultActionContext);
  const useVaultData = useVault(vaultAddress);
  const currentVaultAddress = vaultAddress || '';
  const canSubmit = buildTransactionCall ? true : false;

  const messageValues = {
    [VAULT_ACTIONS.CREATE_VAULT_POSITION]: useVaultData?.minDepositRequired,
  };

  const formattedMaturity = vaultAccount?.maturity
    ? formatMaturity(vaultAccount?.maturity)
    : '';

  const handleCancel = () => {
    clearSideDrawer(`/vaults/${vaultAddress}`);
    if (vaultAction === VAULT_ACTIONS.WITHDRAW_VAULT) {
      updateState({
        maxWithdraw: false,
        withdrawAmount: undefined,
        withdrawAmountString: '',
      });
    }
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
            helptext={messages[vaultAction].helptext}
            helpTextValues={messageValues[vaultAction]}
            advancedToggle={advancedToggle}
            showDrawer={false}
            canSubmit={canSubmit}
            cancelRoute={''}
            CustomActionButton={TradeActionButton}
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
