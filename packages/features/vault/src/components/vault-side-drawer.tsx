import { ToggleSwitchProps } from '@notional-finance/mui';
import { TransactionSidebar } from '@notional-finance/trade';
import { useNavigate } from 'react-router-dom';
import { messages } from '../messages';
import {
  useCurrentTradeContext,
  useVaultProperties,
} from '@notional-finance/notionable-hooks';
import { CreateVaultLiquidationRisk } from './create-vault-liquidation-risk';
import { observer } from 'mobx-react-lite';

interface VaultSideDrawerProps {
  children?: React.ReactNode | React.ReactNode[];
  advancedToggle?: ToggleSwitchProps;
  canSubmitOverride?: boolean;
}

export const VaultSideDrawer = observer(
  ({ children, advancedToggle, canSubmitOverride }: VaultSideDrawerProps) => {
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
        canSubmitOverride={canSubmitOverride}
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
  }
);
