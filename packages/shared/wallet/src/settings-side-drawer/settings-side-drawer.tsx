import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { Box, styled, useTheme, Typography, Slide } from '@mui/material';
import { useOnboard } from '@notional-finance/notionable-hooks';
import {
  SideBarSubHeader,
  Button,
  H4,
  ButtonText,
} from '@notional-finance/mui';
import {
  SettingsItem,
  useSettingsSideDrawer,
} from './use-settings-side-drawer';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { NotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';

/* eslint-disable-next-line */
export interface SettingsSideDrawerProps {
  showConnectWallet?: boolean;
  toggleDrawer?: Dispatch<SetStateAction<boolean>>;
}

interface StyledWalletButton {
  theme: NotionalTheme;
  clickable?: boolean;
}

export const SettingsSideDrawer = ({
  showConnectWallet,
  toggleDrawer,
}: SettingsSideDrawerProps) => {
  const containerRef = useRef(null);
  const theme = useTheme();
  const { accountData, transactionData } = useSettingsSideDrawer();
  const { clearWalletSideDrawer } = useSideDrawerManager();
  const { label, resetWallet, connected } = useOnboard();
  const [settingsItem, setSettingsItem] = useState<SettingsItem | null>(null);

  useEffect(() => {
    if (showConnectWallet) {
      setSettingsItem(accountData[0]);
    }
    // NOTE: only supposed to run once when component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDisconnect = () => {
    if (label) {
      resetWallet(label);
      clearWalletSideDrawer();
    }
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
          titleText={defineMessage({ defaultMessage: 'back' })}
        />
      )}
      <Box
        ref={containerRef}
        sx={{ visibility: settingsItem === null ? 'visible' : 'hidden' }}
      >
        <Title>
          <FormattedMessage defaultMessage="Account" />
        </Title>
        {accountData.map((data) => (
          <WalletButton
            theme={theme}
            onClick={() => handleClick(data)}
            key={data.key}
            clickable={data.ViewComponent ? true : false}
          >
            <H4
              sx={{
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
          </WalletButton>
        ))}
      </Box>
      <Box sx={{ marginBottom: '48px' }}>
        <Title>
          <FormattedMessage defaultMessage="Transactions" />
        </Title>
        {transactionData.map((data) => (
          <WalletButton
            theme={theme}
            onClick={() => handleClick(data)}
            key={data.key}
            clickable={data.ViewComponent ? true : false}
          >
            <H4
              sx={{
                flex: 1,
                color: theme.palette.common.black,
              }}
              fontWeight="regular"
            >
              {data.label}
            </H4>
            <ButtonData>
              {data?.CustomButton ? <data.CustomButton /> : data.buttonText}
            </ButtonData>
          </WalletButton>
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

const WalletButton = styled('div', {
  shouldForwardProp: (prop: string) => prop !== 'clickable',
})(
  ({ theme, clickable }: StyledWalletButton) => `
  padding: ${theme.spacing(2.5)};
  border-radius: ${theme.shape.borderRadius()};
  margin: 10px 0px;
  cursor: ${clickable ? 'pointer' : 'normal'};
  background: ${theme.palette.background.default};
  display: flex;
  align-items: center;
  `
);

const Title = styled(Typography)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  margin-top: ${theme.spacing(5)};
  font-weight: 700;
  color: ${theme.palette.borders.accentDefault};
  text-transform: uppercase;
  `
);

const ButtonData = styled(ButtonText)(
  ({ theme }) => `
    float: right;
    border: ${theme.shape.borderStandard};
    background: ${theme.palette.background.paper};
    padding: ${theme.spacing(1, 2)};
    border-radius: ${theme.shape.borderRadius()};
    color: ${theme.palette.common.black};
    margin-bottom: 0px;
  `
);

const SubSidebar = styled(Box)(
  ({ theme }) => `
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
