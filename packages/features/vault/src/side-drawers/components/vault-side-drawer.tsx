import { useContext } from 'react';
import {
  ActionSidebar,
  ToggleSwitchProps,
  ProgressIndicator,
} from '@notional-finance/mui';
import { useLocation } from 'react-router-dom';
import { TransactionData } from '@notional-finance/trade';
import { useQueryParams } from '@notional-finance/utils';
import {
  TransactionConfirmation,
  TradeActionButton,
} from '@notional-finance/trade';
import { VaultDetailsTable } from '@notional-finance/risk';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import { formatMaturity } from '@notional-finance/helpers';
import { useHistory } from 'react-router';
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
  const history = useHistory();

  const { confirm } = useQueryParams();
  const { pathname: currentPath } = useLocation();
  const confirmRoute = !!confirm;
  const {
    state: {
      vaultAccount,
      vaultAddress,
      vaultAction,
      buildTransactionCall,
      updatedVaultAccount,
    },
  } = useContext(VaultActionContext);
  const currentVaultAddress = vaultAddress || '';
  const canSubmit = buildTransactionCall ? true : false;

  const formattedMaturity = vaultAccount?.maturity
    ? formatMaturity(vaultAccount?.maturity)
    : '';

  return (
    <div>
      {vaultAction ? (
        transactionData && confirmRoute ? (
          <TransactionConfirmation
            heading={transactionData?.transactionHeader}
            onCancel={() => history.push(`${currentPath}`)}
            transactionProperties={transactionData?.transactionProperties}
            buildTransactionCall={transactionData?.buildTransactionCall}
            showDrawer={false}
            onReturnToForm={() => history.push(`${currentPath}`)}
          />
        ) : (
          <ActionSidebar
            heading={messages[vaultAction].heading}
            helptext={messages[vaultAction].helptext}
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
