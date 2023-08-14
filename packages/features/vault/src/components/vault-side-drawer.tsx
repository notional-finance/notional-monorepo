import { useCallback } from 'react';
import {
  ActionSidebar,
  ToggleSwitchProps,
  ProgressIndicator,
} from '@notional-finance/mui';
import { TradeActionButton, Confirmation2 } from '@notional-finance/trade';
import { useHistory } from 'react-router';
import { messages } from '../messages';
import { VaultDetailsTable } from './vault-details-table';
import {
  VaultContext,
  useVaultProperties,
} from '@notional-finance/notionable-hooks';
import { useVaultCapacity } from '../hooks';
import { VaultTradeType } from '@notional-finance/notionable';
import { FormattedMessage } from 'react-intl';

interface VaultSideDrawerProps {
  children?: React.ReactNode | React.ReactNode[];
  advancedToggle?: ToggleSwitchProps;
  context: VaultContext;
}

export const VaultSideDrawer = ({
  children,
  advancedToggle,
  context,
}: VaultSideDrawerProps) => {
  const history = useHistory();
  const {
    state: {
      vaultAddress,
      tradeType: _tradeType,
      canSubmit,
      confirm,
      populatedTransaction,
    },
    updateState,
  } = context;
  const { minDepositRequired } = useVaultProperties(vaultAddress);
  const { minBorrowSize } = useVaultCapacity();
  const tradeType = _tradeType as VaultTradeType;

  const handleCancel = useCallback(() => {
    history.push(`/vaults/${vaultAddress}`);
  }, [vaultAddress, history]);

  const handleSubmit = useCallback(() => {
    updateState({ confirm: true });
  }, [updateState]);

  return (
    <div>
      {tradeType ? (
        populatedTransaction && confirm ? (
          <Confirmation2
            heading={<FormattedMessage {...messages[tradeType].heading} />}
            context={context}
            onCancel={handleCancel}
            showDrawer={false}
            onReturnToForm={handleCancel}
          />
        ) : (
          <ActionSidebar
            heading={messages[tradeType].heading}
            helptext={{
              ...messages[tradeType].helptext,
              values: {
                minDepositRequired,
                minBorrowSize,
              },
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
            <VaultDetailsTable key={'vault-risk-table'} />
          </ActionSidebar>
        )
      ) : (
        <ProgressIndicator type="notional" />
      )}
    </div>
  );
};
