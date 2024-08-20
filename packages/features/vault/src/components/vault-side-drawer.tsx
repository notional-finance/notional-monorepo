import { ToggleSwitchProps } from '@notional-finance/mui';
import { TransactionSidebar } from '@notional-finance/trade';
import { useNavigate } from 'react-router-dom';
import { messages } from '../messages';
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
  const navigate = useNavigate();
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
      onCancelRouteCallback={() =>
        navigate(`/vaults/${selectedNetwork}/${vaultAddress}`)
      }
      hideTextOnMobile={false}
      riskComponent={
        <CreateVaultLiquidationRisk key={'vault-risk-table'} state={state} />
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
