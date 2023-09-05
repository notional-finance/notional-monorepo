import { useTheme, Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { Button, ProgressIndicator } from '@notional-finance/mui';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { SETTINGS_SIDE_DRAWERS } from '@notional-finance/shared-config';
import { useTruncatedAddress } from '@notional-finance/notionable-hooks';
import {
  useConnect,
  useNftContract,
  BETA_ACCESS,
} from '@notional-finance/wallet/hooks';
import { ContestNftPass } from '../contest-nft-pass/contest-nft-pass';

export const ContestHero = () => {
  const theme = useTheme();
  const { setWalletSideDrawer } = useSideDrawerManager();
  const { icon, currentLabel, selectedAddress } = useConnect();
  const truncatedAddress = useTruncatedAddress();
  const connected = selectedAddress ? true : false;
  const betaAccess = useNftContract();

  return (
    <Container>
      <ContentContainer>
        <ContestNftPass />
        {connected && betaAccess === BETA_ACCESS.PENDING ? (
          <TextAndButtonWrapper>
            <ProgressIndicator />
          </TextAndButtonWrapper>
        ) : (
          <TextAndButtonWrapper>
            <TitleText>
              {connected && betaAccess === BETA_ACCESS.REJECTED && (
                <FormattedMessage
                  defaultMessage={'Beta Access NFT Not Found'}
                />
              )}
              {!connected && (
                <FormattedMessage
                  defaultMessage={
                    'Connect a Wallet with a Beta Access NFT to Enter '
                  }
                />
              )}
              {connected && betaAccess === BETA_ACCESS.CONFIRMED && (
                <FormattedMessage
                  defaultMessage={
                    'Welcome to the V3 Closed Beta Contest on Arbitrum'
                  }
                />
              )}
            </TitleText>
            {connected && betaAccess === BETA_ACCESS.CONFIRMED && (
              <ButtonContainer>
                <Button
                  size="large"
                  sx={{
                    marginBottom: theme.spacing(3),
                    width: '358px',
                    fontFamily: 'Avenir Next',
                  }}
                  to="/portfolio/overview"
                >
                  <FormattedMessage defaultMessage={'Launch App'} />
                </Button>
              </ButtonContainer>
            )}
            {icon &&
              icon.length > 0 &&
              connected &&
              betaAccess !== BETA_ACCESS.CONFIRMED && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: theme.spacing(3),
                  }}
                >
                  <IconContainer>
                    <img
                      src={`data:image/svg+xml;utf8,${encodeURIComponent(
                        icon
                      )}`}
                      alt={`${currentLabel} wallet icon`}
                      height="24px"
                      width="24px"
                    />
                  </IconContainer>
                  <Address>{truncatedAddress}</Address>
                </Box>
              )}

            {betaAccess !== BETA_ACCESS.CONFIRMED && (
              <ButtonContainer>
                <Button
                  size="large"
                  sx={{
                    marginBottom: theme.spacing(3),
                    width: '358px',
                    fontFamily: 'Avenir Next',
                  }}
                  onClick={() =>
                    setWalletSideDrawer(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET)
                  }
                >
                  {connected ? (
                    <FormattedMessage defaultMessage={'Switch Wallets'} />
                  ) : (
                    <FormattedMessage defaultMessage={'Connect Wallet'} />
                  )}
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  href="https://form.jotform.com/232396345681160"
                  sx={{
                    width: '358px',
                    border: `1px solid ${colors.neonTurquoise}`,
                    ':hover': {
                      background: colors.matteGreen,
                    },
                    fontFamily: 'Avenir Next',
                  }}
                >
                  <FormattedMessage defaultMessage={'Join Waitlist'} />
                </Button>
              </ButtonContainer>
            )}
          </TextAndButtonWrapper>
        )}
      </ContentContainer>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      margin-top: ${theme.spacing(5)};
      `
);

const ContentContainer = styled(Box)(
  ({ theme }) => `
    margin-top: ${theme.spacing(15)};
    display: flex;
    justify-content: space-around;
    ${theme.breakpoints.down('md')} {
      display: block;
      margin-top: ${theme.spacing(8)};
    }
      `
);

const IconContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  align-items: center;
  width: 40px;
  height: 40px;
  padding: ${theme.spacing(1)};
  background: ${theme.gradient.aqua};
  border-radius: 4px;
  `
);

const TextAndButtonWrapper = styled(Box)(
  ({ theme }) => `
  margin-top: ${theme.spacing(5)}; 
  width: ${theme.spacing(75)};
  ${theme.breakpoints.down('md')} {
    width: 100%;
  }
  `
);

const ButtonContainer = styled(Box)(
  ({ theme }) => `
  margin-top: ${theme.spacing(5)};
  display: flex;
  flex-direction: column;
  ${theme.breakpoints.down('md')} {
    align-items: center;
  }
  `
);

const Address = styled(Box)(
  ({ theme }) => `
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  font-family: Kunst;
  line-height: 22px;
  letter-spacing: 8px;
  color: #3CC9D4;
  margin-left: ${theme.spacing(2)};
  `
);

const TitleText = styled(Box)(
  ({ theme }) => `
  color: ${colors.white};
  font-family: Avenir Next;
  font-size: 48px;
  font-style: normal;
  font-weight: 600;
  line-height: 67.2px;
  ${theme.breakpoints.down('md')} {
    font-size: 32px;
    margin: ${theme.spacing(0, 2)};
  }
      `
);

export default ContestHero;
