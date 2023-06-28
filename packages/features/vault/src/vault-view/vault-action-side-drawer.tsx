import { useCallback, useContext, useEffect } from 'react';
import { Drawer, SideBarSubHeader } from '@notional-finance/mui';
import { Transition, TransitionStatus } from 'react-transition-group';
import { Box, SxProps, useTheme } from '@mui/material';
import { useVaultSideDrawers } from '../hooks';
import { CreateVaultPosition, ManageVault } from '../side-drawers';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { defineMessage } from 'react-intl';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { useHistory } from 'react-router';
import { useVaultAccount } from '@notional-finance/notionable-hooks';

const fadeStart = {
  transition: `opacity 150ms ease`,
  opacity: 0,
};

const fadeTransition: Record<TransitionStatus, SxProps> = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 1 },
  exited: { opacity: 0 },
  unmounted: {},
};

const slideStart = {
  transition: `transform 150ms ease`,
  transform: 'translateX(130%)',
};

const slideTransition: Record<TransitionStatus, SxProps> = {
  entering: { transform: 'translateX(130%)' },
  entered: { transform: 'translateX(0)' },
  exiting: { transform: 'translateX(0)' },
  exited: { transform: 'translateX(130%)' },
  unmounted: {},
};

export const VaultActionSideDrawer = () => {
  const theme = useTheme();
  const history = useHistory();
  const { SideDrawerComponent, openDrawer } = useVaultSideDrawers();
  const { clearSideDrawer } = useSideDrawerManager();

  // NOTE: what does this do?
  useEffect(() => {
    clearSideDrawer();
  }, [clearSideDrawer]);

  const {
    state: { vaultAddress },
    updateState,
  } = useContext(VaultActionContext);
  const { hasVaultPosition } = useVaultAccount(vaultAddress);

  useEffect(() => {
    if (!hasVaultPosition) {
      history.push(`/vaults/${vaultAddress}/CreateVaultPosition`);
    }
  }, [hasVaultPosition, history, vaultAddress]);

  const returnToManageVault = useCallback(() => {
    history.push(`/vaults/${vaultAddress}`);
    // TODO: this might cause problems
    updateState({ tradeType: undefined });
  }, [vaultAddress, history, updateState]);

  const manageVaultActive = !openDrawer ? true : false;
  const sideDrawerActive = SideDrawerComponent && openDrawer ? true : false;

  let drawerEl;
  if (!hasVaultPosition) {
    drawerEl = <CreateVaultPosition />;
  } else {
    drawerEl = (
      <>
        <Transition in={manageVaultActive} timeout={150}>
          {(state: TransitionStatus) => {
            return (
              <Box
                sx={{
                  ...fadeStart,
                  ...fadeTransition[state],
                }}
              >
                {manageVaultActive && <ManageVault />}
              </Box>
            );
          }}
        </Transition>
        <Transition in={sideDrawerActive} timeout={150}>
          {(state: TransitionStatus) => {
            return (
              <Box
                sx={{
                  ...slideStart,
                  ...slideTransition[state],
                }}
              >
                {sideDrawerActive && SideDrawerComponent !== null && (
                  <>
                    <SideBarSubHeader
                      paddingTop="150px"
                      callback={returnToManageVault}
                      titleText={defineMessage({ defaultMessage: 'Manage' })}
                    />
                    <SideDrawerComponent />
                  </>
                )}
              </Box>
            );
          }}
        </Transition>
      </>
    );
  }

  return (
    <Drawer
      size="large"
      sx={{
        paddingTop: sideDrawerActive
          ? {
              xs: theme.spacing(4, 2),
              sm: theme.spacing(4, 2),
              md: '0px',
              lg: '0px',
              xl: '0px',
            }
          : '',
      }}
    >
      {drawerEl}
    </Drawer>
  );
};
