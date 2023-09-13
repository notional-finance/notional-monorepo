import { ComponentType, useCallback, useContext, useEffect } from 'react';
import { Drawer, SideBarSubHeader } from '@notional-finance/mui';
import { Transition, TransitionStatus } from 'react-transition-group';
import { Box, SxProps, useTheme } from '@mui/material';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { defineMessage } from 'react-intl';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { useHistory } from 'react-router';
import { VaultTradeType } from '@notional-finance/notionable';
import { ManageVault, VaultDrawers } from '../side-drawers';
import { CreateVaultPosition } from '../side-drawers/create-vault-position';

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
  const { clearSideDrawer } = useSideDrawerManager();

  useEffect(() => {
    clearSideDrawer();
  }, [clearSideDrawer]);

  const {
    state: { vaultAddress, priorAccountRisk, tradeType, debt },
    updateState,
  } = useContext(VaultActionContext);
  const hasVaultPosition = !!priorAccountRisk;

  useEffect(() => {
    // Clear any trade types if there is no position
    if (!hasVaultPosition && tradeType !== 'CreateVaultPosition') {
      history.push(`/vaults/${vaultAddress}`);
    }
  }, [hasVaultPosition, tradeType, history, vaultAddress]);

  const returnToManageVault = useCallback(() => {
    history.push(`/vaults/${vaultAddress}`);
    updateState({ tradeType: undefined, confirm: false });
  }, [vaultAddress, history, updateState]);

  let VaultDrawer: ComponentType | null = null;
  if (tradeType === 'RollVaultPosition') {
    VaultDrawer = debt ? VaultDrawers['RollVaultPosition'] : null;
  } else if (tradeType) {
    VaultDrawer = VaultDrawers[tradeType as VaultTradeType];
  }

  let drawerEl;
  if (!hasVaultPosition) {
    drawerEl = <CreateVaultPosition />;
  } else {
    drawerEl = (
      <Box>
        <Transition in={!VaultDrawer} timeout={150}>
          {(state: TransitionStatus) => {
            return (
              <Box
                sx={{
                  ...fadeStart,
                  ...fadeTransition[state],
                }}
              >
                {!VaultDrawer && <ManageVault />}
              </Box>
            );
          }}
        </Transition>
        <Transition in={!!VaultDrawer} timeout={150}>
          {(state: TransitionStatus) => {
            return (
              <Box
                sx={{
                  ...slideStart,
                  ...slideTransition[state],
                }}
              >
                {VaultDrawer && (
                  <>
                    <SideBarSubHeader
                      paddingTop="150px"
                      callback={returnToManageVault}
                      titleText={defineMessage({ defaultMessage: 'Manage' })}
                    />
                    <VaultDrawer />
                  </>
                )}
              </Box>
            );
          }}
        </Transition>
      </Box>
    );
  }

  return (
    <Drawer
      size="large"
      sx={{
        paddingTop: tradeType ? theme.spacing(4, 2) : '',
      }}
    >
      {drawerEl}
    </Drawer>
  );
};
