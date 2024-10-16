import { useEffect } from 'react';
import { SideBarLayout } from '@notional-finance/mui';
import { VaultActionSideDrawer } from './vault-view/vault-action-side-drawer';
import { VaultSummary } from './vault-view/vault-summary';
import { FeatureLoader } from '@notional-finance/shared-web';
import {
  createVaultContext,
  useVaultContext,
} from '@notional-finance/notionable-hooks';
import { Box, styled } from '@mui/material';

export const VaultActionContext = createVaultContext();

export const VaultView = () => {
  const context = useVaultContext();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const {
    state: { isReady, confirm },
  } = context;

  return (
    <VaultActionContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady}>
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
    </VaultActionContext.Provider>
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
