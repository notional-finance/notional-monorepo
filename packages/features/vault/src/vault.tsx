import { SideBarLayout } from '@notional-finance/mui';
import { VaultActionSideDrawer } from './vault-view/vault-action-side-drawer';
import { VaultSummary } from './vault-view/vault-summary';
import { FeatureLoader } from '@notional-finance/shared-web';
import { Box, styled } from '@mui/material';
import {
  useTradeContext,
  useVaultAPYData,
} from '@notional-finance/notionable-hooks';
import { useEffect } from 'react';

export const VaultView = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const context = useTradeContext('CreateVaultPosition');

  const isReady = context.tradeModel?.isReady;
  const confirm = context.tradeModel?.confirm;
  // Fetch the vault data to prefill the APYs, we can't load the page
  // until the data is loaded
  const apyData = useVaultAPYData(
    context.tradeModel?.vaultAddress,
    context.tradeModel?.selectedNetwork
  );

  return (
    <FeatureLoader
      featureLoaded={isReady === true && apyData.data !== undefined}
    >
      <SideBarLayout
        showTransactionConfirmation={confirm}
        sideBar={
          <SummaryWrapper>
            <VaultActionSideDrawer />
          </SummaryWrapper>
        }
        mainContent={<VaultSummary />}
      />
    </FeatureLoader>
  );
};

const SummaryWrapper = styled(Box)(
  ({ theme }) => `
  ${theme.breakpoints.down('sm')} {
    padding-top: ${theme.spacing(10)};
  }
`
);

export default VaultView;
