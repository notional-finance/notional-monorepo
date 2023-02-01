import { useContext } from 'react';
import { Drawer, SideDrawer, SideBarSubHeader } from '@notional-finance/mui';
import { Box, useTheme } from '@mui/material';
import { useVaultSideDrawers } from '../hooks';
import { CreateVaultPosition, ManageVault } from '../side-drawers';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { VaultActionContext } from '../managers';
import { defineMessage } from 'react-intl';

export const VaultActionSideDrawer = () => {
  const theme = useTheme();
  const { SideDrawerComponent, openDrawer } = useVaultSideDrawers();
  const {
    state: { vaultAccount, vaultAddress },
  } = useContext(VaultActionContext);

  const { clearSideDrawer } = useSideDrawerManager();

  const handleDrawer = () => {
    clearSideDrawer(`/vaults/${vaultAddress}`);
  };

  const CustomHeader = () => {
    return (
      <Box
        sx={{ padding: theme.spacing(0, 6), marginTop: theme.spacing(9.25) }}
      >
        <SideBarSubHeader
          callback={() => handleDrawer()}
          titleText={defineMessage({ defaultMessage: 'Manage' })}
        />
      </Box>
    );
  };

  return (
    <Drawer size="large">
      {vaultAccount?.isInactive ? <CreateVaultPosition /> : <ManageVault />}
      <SideDrawer
        callback={handleDrawer}
        openDrawer={openDrawer}
        CustomHeader={CustomHeader}
        zIndex={1202}
        disableBackDrop
      >
        {SideDrawerComponent && <SideDrawerComponent />}
      </SideDrawer>
    </Drawer>
  );
};
