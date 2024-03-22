import { useEffect, useState } from 'react';
import { useTheme, Box, styled } from '@mui/material';
import { H3, Body } from '../typography/typography';
import { Button } from '../button/button';
import { ExternalLink } from '../external-link/external-link';
import {
  setInLocalStorage,
  getFromLocalStorage,
} from '@notional-finance/helpers';
import { FormattedMessage } from 'react-intl';
import { NotionalTheme } from '@notional-finance/styles';

interface PopupProps {
  theme: NotionalTheme;
  popUpStyles: boolean;
}

export const FooterPopup = () => {
  const theme = useTheme();
  const [popUpStyles, setPopupStyles] = useState<boolean>(false);
  const [hidePopup, setHidePopup] = useState<boolean>(false);
  const prevUiPopupDismissed = getFromLocalStorage('prevUiPopup').dismissed;

  const handleSubmit = () => {
    setInLocalStorage('prevUiPopup', { dismissed: true });
    setHidePopup(true);
  };

  const handleScroll = () => {
    const scrollPosition = window.innerHeight + window.scrollY + 300;
    if (scrollPosition > document.body.offsetHeight && !popUpStyles) {
      setPopupStyles(true);
    }
    if (scrollPosition < document.body.offsetHeight && popUpStyles) {
      setPopupStyles(false);
    }
  };

  window.addEventListener('scroll', handleScroll);

  useEffect(() => {
    if (prevUiPopupDismissed) {
      setHidePopup(true);
    }
  }, [prevUiPopupDismissed]);

  return (
    <div>
      {!hidePopup && !prevUiPopupDismissed && (
        <OuterWrapper popUpStyles={popUpStyles} theme={theme}>
          <ContentWrapper>
            <H3
              sx={{
                textAlign: 'left',
                marginBottom: theme.spacing(3),
                color: theme.palette.typography.contrastText,
              }}
            >
              <FormattedMessage defaultMessage={'Welcome To Notional V3'} />
            </H3>
            <Body
              sx={{
                textAlign: 'left',
                marginBottom: theme.spacing(6),
                color: theme.palette.typography.contrastText,
              }}
            >
              <FormattedMessage
                defaultMessage={
                  'You can access your V2 positions anytime with the link in the footer. <a>Learn what’s new in Notional V3.</a>'
                }
                values={{
                  a: (chunk: React.ReactNode) => (
                    <ExternalLink
                      accent
                      textDecoration
                      style={{ color: theme.palette.info.accent }}
                      href="https://blog.notional.finance/notional-v3-is-live-on-arbitrum/"
                    >
                      {chunk}
                    </ExternalLink>
                  ),
                }}
              />
            </Body>
            <Button onClick={handleSubmit} variant="contained" size="large">
              <FormattedMessage defaultMessage={'Got it'} />
            </Button>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: theme.spacing(60),
                position: popUpStyles ? 'absolute' : 'fixed',
                marginTop: theme.spacing(4),
              }}
            >
              <ArrowDown />
            </Box>
          </ContentWrapper>
        </OuterWrapper>
      )}
    </div>
  );
};

const OuterWrapper = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'popUpStyles',
})(
  ({ theme, popUpStyles }: PopupProps) => `
    position: ${popUpStyles ? 'absolute' : 'fixed'};
    background-color: ${theme.palette.primary.dark};
    border-radius: ${theme.shape.borderRadius()};
    z-index: 99;
    font-weight: bold;
    text-align: center;
    width: fit-content;
    bottom: 0;
    left: 0;
    margin: ${theme.spacing(5)};
    padding: ${theme.spacing(4)};
    margin-right: ${theme.spacing(2)};
    margin-bottom: ${popUpStyles ? theme.spacing(32.5) : theme.spacing(10)};
    box-shadow: -2px 1px 24px rgba(20, 41, 102, 0.2), 0px 4px 16px rgba(29, 116, 119, 0.4);
    `
);

const ContentWrapper = styled(Box)(
  ({ theme }) => `
    color: ${theme.palette.common.white};
    width: ${theme.spacing(50)};
    `
);

const ArrowDown = styled(Box)(
  ({ theme }) => `
    width: 0; 
    height: 0; 
    margin-right: ${theme.spacing(32)};
    border-left: ${theme.spacing(5)} solid transparent;
    border-right: ${theme.spacing(5)} solid transparent;
    border-top: ${theme.spacing(5)} solid ${theme.palette.primary.dark};
  `
);

export default FooterPopup;
