import { useContext, useEffect } from 'react';
import { Drawer, SideBarSubHeader, PageLoading } from '@notional-finance/mui';
import { Transition, TransitionStatus } from 'react-transition-group';
import { Box, SxProps, useTheme } from '@mui/material';
import { useVaultSideDrawers } from '../hooks';
import { useAccount, useOnboard } from '@notional-finance/notionable-hooks';
import { CreateVaultPosition, ManageVault } from '../side-drawers';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { defineMessage } from 'react-intl';
import { useHistory, useParams } from 'react-router';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { VaultParams } from './vault-view';

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
  const { vaultAddress: vaultAddressInURL } = useParams<VaultParams>();
  const { accountSummariesLoaded } = useAccount();
  const { connected } = useOnboard();
  const { SideDrawerComponent, openDrawer } = useVaultSideDrawers();
  const { clearSideDrawer } = useSideDrawerManager();

  useEffect(() => {
    clearSideDrawer();
  }, [clearSideDrawer]);

  const {
    state: { vaultAddress: vaultAddressInState, vaultAccount },
    updateState,
  } = useContext(VaultActionContext);

  const handleDrawer = () => {
    history.push(`/vaults/${vaultAddressInState}`);
    updateState({ vaultAction: undefined });
  };

  const manageVaultActive =
    accountSummariesLoaded && !vaultAccount?.isInactive && !openDrawer
      ? true
      : false;
  const sideDrawerActive = SideDrawerComponent && openDrawer ? true : false;
  const vaultContextIsLoading = vaultAddressInState !== vaultAddressInURL;

  let drawerEl;
  if (vaultContextIsLoading) {
    drawerEl = <PageLoading type="notional" />;
  } else if (!connected || vaultAccount?.isInactive) {
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
                      callback={() => handleDrawer()}
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
