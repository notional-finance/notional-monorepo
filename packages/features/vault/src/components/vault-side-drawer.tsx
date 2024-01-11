import { ToggleSwitchProps } from '@notional-finance/mui';
import { TransactionSidebar } from '@notional-finance/trade';
import { useHistory } from 'react-router';
import { messages } from '../messages';
import { VaultDetailsTable } from './vault-details-table';
import {
  VaultContext,
  useVaultProperties,
} from '@notional-finance/notionable-hooks';
import { VaultTradeType } from '@notional-finance/notionable';
import { CreateVaultLiquidationRisk } from './create-vault-liquidation-risk';

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
  const { state } = context;
  const {
    minBorrowSize,
    vaultAddress,
    tradeType: _tradeType,
    selectedNetwork,
  } = state;
  const { minDepositRequired } = useVaultProperties(
    selectedNetwork,
    vaultAddress
  );
  const tradeType = _tradeType as VaultTradeType;

  if (!tradeType) return null;

  return (
    <TransactionSidebar
      context={context}
      showDrawer={false}
      heading={messages[tradeType].heading}
      advancedToggle={advancedToggle}
      onCancelRouteCallback={() => history.push(`/vaults/${vaultAddress}`)}
      hideTextOnMobile={false}
      riskComponent={
        tradeType === 'CreateVaultPosition' ? (
          <CreateVaultLiquidationRisk key={'vault-risk-table'} state={state} />
        ) : (
          <VaultDetailsTable key={'vault-risk-table'} />
        )
      }
      helptext={{
        ...messages[tradeType].helptext,
        values: {
          minDepositRequired,
          minBorrowSize,
        },
      }}
    >
      {children}
    </TransactionSidebar>
  );
};
