import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { Box, styled, useTheme, Slide } from '@mui/material';
import {
  SideBarSubHeader,
  Button,
  H4,
  ButtonText,
  LabelValue,
  SideDrawerButton,
} from '@notional-finance/mui';
import {
  SettingsItem,
  useSettingsSideDrawer,
} from './use-settings-side-drawer';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { defineMessage, FormattedMessage } from 'react-intl';
import { useWalletConnected } from '@notional-finance/notionable-hooks';
import { useConnect } from '../hooks';

/* eslint-disable-next-line */
export interface SettingsSideDrawerProps {
  showConnectWallet?: boolean;
  toggleDrawer?: Dispatch<SetStateAction<boolean>>;
}

export const SettingsSideDrawer = ({
  showConnectWallet,
  toggleDrawer,
}: SettingsSideDrawerProps) => {
  const containerRef = useRef(null);
  const theme = useTheme();
  const { disconnectWallet } = useConnect();
  const { accountData, transactionData } = useSettingsSideDrawer();
  const { clearWalletSideDrawer } = useSideDrawerManager();
  const connected = useWalletConnected();
  const [settingsItem, setSettingsItem] = useState<SettingsItem | null>(null);

  useEffect(() => {
    if (showConnectWallet) {
      setSettingsItem(accountData[0]);
    }
    // NOTE: only supposed to run once when component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDisconnect = () => {
    disconnectWallet();
    clearWalletSideDrawer();
  };

  const handleClick = (data: SettingsItem | null) => {
    data?.ViewComponent ? setSettingsItem(data) : setSettingsItem(null);
  };

  return (
    <SettingsContainer>
      {toggleDrawer && (
        <SideBarSubHeader
          paddingTop={`${theme.spacing(1)}`}
          callback={() => toggleDrawer(false)}
          titleText={defineMessage({ defaultMessage: 'Back' })}
        />
      )}
      <Box
        ref={containerRef}
        sx={{ visibility: settingsItem === null ? 'visible' : 'hidden' }}
      >
        <Title sx={{ marginTop: theme.spacing(5) }}>
          <FormattedMessage defaultMessage="Account" />
        </Title>
        {accountData.map((data) => (
          <SideDrawerButton
            onClick={() =>
              data.callback ? data.callback() : handleClick(data)
            }
            key={data.key}
            sx={{
              cursor:
                data.ViewComponent || data.key === 'darkMode'
                  ? 'pointer'
                  : 'normal',
            }}
          >
            <H4
              sx={{
                display: 'flex',
                flex: 1,
                color: theme.palette.common.black,
              }}
              fontWeight="regular"
            >
              {data.label}
            </H4>
            {data.key === 'darkMode' && data.CustomButton && (
              <data.CustomButton />
            )}
            {data.key !== 'darkMode' && (
              <ButtonData>
                {data.CustomButton ? <data.CustomButton /> : data.buttonText}
              </ButtonData>
            )}
          </SideDrawerButton>
        ))}
      </Box>
      <Box sx={{ marginBottom: '48px' }}>
        <Title sx={{ marginTop: theme.spacing(5) }}>
          <FormattedMessage defaultMessage="Transactions" />
        </Title>
        {transactionData.map((data) => (
          <SideDrawerButton
            onClick={() =>
              data.callback ? data.callback() : handleClick(data)
            }
            key={data.key}
            sx={{
              cursor: data.ViewComponent ? 'pointer' : 'normal',
            }}
          >
            <H4
              sx={{
                display: 'flex',
                flex: 1,
                color: theme.palette.common.black,
              }}
              fontWeight="regular"
            >
              {data.label}
            </H4>
            {data.key === 'primeBorrow' && data.CustomButton && (
              <data.CustomButton />
            )}
            {data.key !== 'primeBorrow' && (
              <ButtonData>
                {data.CustomButton ? <data.CustomButton /> : data.buttonText}
              </ButtonData>
            )}
          </SideDrawerButton>
        ))}
      </Box>
      {connected && (
        <Box
          sx={{
            textAlign: 'center',
            marginTop: 'auto',
            paddingBottom: theme.spacing(6),
          }}
        >
          <Button
            size="large"
            fullWidth
            variant="outlined"
            onClick={() => handleDisconnect()}
          >
            <FormattedMessage defaultMessage="Disconnect Wallet" />
          </Button>
        </Box>
      )}

      <Slide
        direction="left"
        in={settingsItem !== null}
        container={containerRef.current}
      >
        <SubSidebar>
          <SideBarSubHeader
            paddingTop={`${theme.spacing(1)}`}
            callback={() => handleClick(null)}
            titleText={defineMessage({ defaultMessage: 'Settings' })}
          />
          {settingsItem && settingsItem?.ViewComponent && (
            <settingsItem.ViewComponent />
          )}
        </SubSidebar>
      </Slide>
    </SettingsContainer>
  );
};

const SettingsContainer = styled(Box)(
  ({ theme }) => `
  ${theme.breakpoints.down('sm')} {
    padding: ${theme.spacing(2)};
    background: ${theme.palette.background.paper};
    ${theme.breakpoints.down('sm')} {
      height: 100vh;
    }
  }
  `
);

export const Title = styled(LabelValue)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  color: ${theme.palette.typography.light};
  font-weight: 700; 
  text-transform: uppercase;
  `
);

const ButtonData = styled(ButtonText)(
  ({ theme }) => `
    float: right;
    border: ${theme.shape.borderStandard};
    border-color: ${theme.palette.primary.light};
    background: ${theme.palette.background.paper};
    padding: ${theme.spacing(1, 2)};
    border-radius: ${theme.shape.borderRadius()};
    color: ${theme.palette.common.black};
    margin-bottom: 0px;
  `
);

const SubSidebar = styled(Box)(
  ({ theme }) => `
  min-height: 180vh;
  height: 100%;
  top: 0;
  left: 0;
  width: 100%;
  position: absolute;
  display: flex;
  flex-direction: column;
  margin-left: 0px;
  background: ${theme.palette.background.paper};
  padding: 0px ${theme.spacing(6)};
  &.MuiModal-root, .MuiDrawer-root: {
    z-index: 9999;
  }
  ${theme.breakpoints.down('sm')} {
    padding: ${theme.spacing(2)};
    z-index: 1207;
    height: 100vh;
  }
  `
);

export default SettingsSideDrawer;
