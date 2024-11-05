import { Box, styled, ThemeProvider } from '@mui/material';
import { Button, Body } from '@notional-finance/mui';
import { useAppStore } from '@notional-finance/notionable-hooks';
import {
  useNotionalTheme,
  colors,
  NotionalTheme,
} from '@notional-finance/styles';
import {
  getFromLocalStorage,
  setInLocalStorage,
  NATIVE_YIELD,
} from '@notional-finance/util';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router';

interface ComponentProps {
  theme: NotionalTheme;
  themeVariant: string;
}

export interface NativeYieldPopupProps {
  selectedToken: string;
}

export const NativeYieldPopup = ({ selectedToken }: NativeYieldPopupProps) => {
  const { themeVariant } = useAppStore();
  const { pathname } = useLocation();
  const userSettings = getFromLocalStorage('userSettings');
  const [show, setShow] = useState<boolean>(false);
  const theme = useNotionalTheme(
    themeVariant === 'light' ? 'dark' : 'light',
    'product'
  );

  useEffect(() => {
    if (NATIVE_YIELD.includes(selectedToken)) {
      setShow(true);
    } else if (show) {
      setShow(false);
    }
  }, [selectedToken, show]);

  const handleClick = () => {
    setShow(false);
    setInLocalStorage('userSettings', {
      ...userSettings,
      hideNativeYieldsPopup: true,
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        themeVariant={themeVariant}
        theme={theme}
        sx={{
          display:
            show && !userSettings.hideNativeYieldsPopup ? 'block' : 'none',
          marginLeft:
            pathname.includes('fixed') ||
            pathname.includes('liquidity-leveraged')
              ? '480px'
              : '330px',
        }}
      >
        <Body
          sx={{
            marginBottom: theme.spacing(2),
          }}
        >
          <FormattedMessage
            defaultMessage={
              'APY does not include native {selectedToken} yield. This APY is on top of the native yield.'
            }
            values={{
              selectedToken,
            }}
          />
        </Body>
        <Button variant="outlined" onClick={() => handleClick()}>
          <FormattedMessage defaultMessage={'Okay'} />
        </Button>
        <Arrow themeVariant={themeVariant} theme={theme}></Arrow>
      </Container>
    </ThemeProvider>
  );
};

const Container = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'themeVariant',
})(
  ({ themeVariant, theme }: ComponentProps) => `
    padding: ${theme.spacing(2)};
    position: absolute;
    width: ${theme.spacing(33.5)};
    height: ${theme.spacing(18.5)};
    margin-top: -${theme.spacing(9)};
    border-radius: ${theme.shape.borderRadius()};
    background: ${themeVariant === 'light' ? colors.darkGreen : colors.white};
    box-shadow: ${
      themeVariant === 'light'
        ? '-5px 4px 10px 2px rgba(20, 42, 74, 0.30)'
        : ' -5px 4px 10px 2px rgba(51, 248, 255, 0.30)'
    };
    ${theme.breakpoints.down('sm')} {
        display: none;
    }
  `
);

const Arrow = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'themeVariant',
})(
  ({ themeVariant, theme }: ComponentProps) => `
    position: absolute;
    width: 0;
    height: 0;
    border-left: ${theme.spacing(2.5)} solid transparent;
    border-right: ${theme.spacing(2.5)} solid transparent;
    border-bottom: ${theme.spacing(3.75)} solid ${
    themeVariant === 'light' ? colors.darkGreen : colors.white
  };
    rotate: -90deg;
    margin-top: -${theme.spacing(13.5)};
    margin-left: -${theme.spacing(5.25)};
  `
);

export default NativeYieldPopup;
