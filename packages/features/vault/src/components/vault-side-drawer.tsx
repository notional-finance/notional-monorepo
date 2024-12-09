import { ToggleSwitchProps } from '@notional-finance/mui';
import { TransactionSidebar } from '@notional-finance/trade';
import { useNavigate } from 'react-router-dom';
import { messages } from '../messages';
import {
  useCurrentTradeContext,
  useVaultProperties,
} from '@notional-finance/notionable-hooks';
import { CreateVaultLiquidationRisk } from './create-vault-liquidation-risk';

interface VaultSideDrawerProps {
  children?: React.ReactNode | React.ReactNode[];
  advancedToggle?: ToggleSwitchProps;
}

export const VaultSideDrawer = ({
  children,
  advancedToggle,
}: VaultSideDrawerProps) => {
  const navigate = useNavigate();
  const trade = useCurrentTradeContext();
  const vaultAddress = trade?.vaultAddress;
  const tradeType = trade?.tradeType;
  const selectedNetwork = trade?.selectedNetwork;
  const { minBorrowSize } = trade?.getVaultCapacity() ?? {};
  const props = useVaultProperties(vaultAddress);
  const { minDepositRequired } = props ?? {};

  if (!tradeType) return null;

  return (
    <TransactionSidebar
      showDrawer={false}
      heading={messages[tradeType].heading}
      advancedToggle={advancedToggle}
      onCancelRouteCallback={() =>
        navigate(`/vaults/${selectedNetwork}/${vaultAddress}`)
      }
      hideTextOnMobile={false}
      riskComponent={<CreateVaultLiquidationRisk key={'vault-risk-table'} />}
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
