import { useTheme, Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { ProgressIndicator } from '@notional-finance/mui';
import {
  useAccountReady,
  useNotionalContext,
  useTruncatedAddress,
} from '@notional-finance/notionable-hooks';
import { ContestButtonStack } from '../contest-button-stack/contest-button-stack';
import { useConnect } from '@notional-finance/wallet/hooks';
import { ContestNftPass } from '../contest-nft-pass/contest-nft-pass';
import { BETA_ACCESS } from '@notional-finance/notionable';

export const ContestHero = () => {
  const theme = useTheme();
  const {
    globalState: { hasContestNFT, hasSelectedChainError },
  } = useNotionalContext();
  const { icon, currentLabel } = useConnect();
  const truncatedAddress = useTruncatedAddress();
  const connected = useAccountReady();

  return (
    <Container>
      <ContentContainer>
        <ContestNftPass />
        <TextAndButtonWrapper>
          {hasSelectedChainError && (
            <TitleText>
              <FormattedMessage
                defaultMessage={'Switch your wallet to the Arbitrum network'}
              />
            </TitleText>
          )}
          {!icon && !connected && (
            <>
              <TitleText>
                <FormattedMessage
                  defaultMessage={
                    'Connect a Wallet with a Beta Access NFT to Enter '
                  }
                />
              </TitleText>
              <ContestButtonStack
                buttonText={
                  <FormattedMessage defaultMessage={'Connect Wallet'} />
                }
              />
            </>
          )}

          {icon && !connected && !hasSelectedChainError ? (
            <Box
              sx={{
                width: '358px',
                textAlign: 'center',
                marginTop: theme.spacing(5),
              }}
            >
              <ProgressIndicator />
            </Box>
          ) : (
            <>
              <TitleText>
                {connected && hasContestNFT === BETA_ACCESS.CONFIRMED && (
                  <FormattedMessage
                    defaultMessage={
                      'Welcome to the V3 Closed Beta Contest on Arbitrum'
                    }
                  />
                )}
                {connected && hasContestNFT === BETA_ACCESS.REJECTED && (
                  <FormattedMessage
                    defaultMessage={'Beta Access NFT Not Found'}
                  />
                )}
              </TitleText>
              {connected && hasContestNFT === BETA_ACCESS.CONFIRMED && (
                <ContestButtonStack
                  to="/portfolio/overview"
                  buttonText={
                    <FormattedMessage defaultMessage={'Launch App'} />
                  }
                />
              )}
              {icon &&
                icon.length > 0 &&
                connected &&
                hasContestNFT === BETA_ACCESS.REJECTED && (
                  <AddressContainer>
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
                  </AddressContainer>
                )}
              {connected && hasContestNFT === BETA_ACCESS.REJECTED && (
                <ContestButtonStack
                  buttonText={
                    <FormattedMessage defaultMessage={'Switch Wallets'} />
                  }
                />
              )}
            </>
          )}
        </TextAndButtonWrapper>
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

const AddressContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    align-items: center;
    margin-top: ${theme.spacing(3)};
    ${theme.breakpoints.down('md')} {
      margin-left: ${theme.spacing(2)};
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
