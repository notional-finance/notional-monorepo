import { useContext } from 'react';
import {
  Drawer,
  SideDrawer,
  SideBarSubHeader,
  PageLoading,
} from '@notional-finance/mui';
import { Box, useTheme, styled } from '@mui/material';
import { useVaultSideDrawers } from '../hooks';
import { useAccount, useOnboard } from '@notional-finance/notionable-hooks';
import { CreateVaultPosition, ManageVault } from '../side-drawers';
import { MobileVaultSummary } from '../components';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { defineMessage } from 'react-intl';

export const VaultActionSideDrawer = () => {
  const theme = useTheme();
  const { accountSummariesLoaded } = useAccount();
  const { connected } = useOnboard();
  const { SideDrawerComponent, openDrawer } = useVaultSideDrawers();
  const {
    state: { vaultAddress, vaultAccount },
  } = useContext(VaultActionContext);

  const { clearSideDrawer } = useSideDrawerManager();

  const handleDrawer = () => {
    clearSideDrawer(`/vaults/${vaultAddress}`);
  };

  const CustomHeader = () => {
    return (
      <Container>
        <MobileVaultSummary />
      </Container>
    );
  };

  return (
    <Drawer size="large">
      {!connected && accountSummariesLoaded && <CreateVaultPosition />}
      {accountSummariesLoaded && vaultAccount?.isInactive && (
        <CreateVaultPosition />
      )}
      {accountSummariesLoaded && !vaultAccount?.isInactive && <ManageVault />}
      {!accountSummariesLoaded && <PageLoading type="notional" />}
      <SideDrawer
        callback={handleDrawer}
        openDrawer={openDrawer}
        CustomHeader={CustomHeader}
        zIndex={1202}
        disableBackDrop
      >
        <Box
          sx={{
            marginTop: {
              xs: theme.spacing(20),
              sm: theme.spacing(20),
              md: theme.spacing(9),
            },
          }}
        >
          <SideBarSubHeader
            callback={() => handleDrawer()}
            titleText={defineMessage({ defaultMessage: 'Manage' })}
          />
        </Box>
        {SideDrawerComponent && <SideDrawerComponent />}
      </SideDrawer>
    </Drawer>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
  display: none;
  ${theme.breakpoints.down('sm')} {
    display: flex;
    min-width: 100vw;
    top: 0;
    position: fixed;
    left: 0;
    z-index: 1203;
  }
`
);
