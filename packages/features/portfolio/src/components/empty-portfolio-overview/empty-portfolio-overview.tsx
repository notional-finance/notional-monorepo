import { useTheme, Box, styled } from '@mui/material';
import { H2, Subtitle, Button } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import connectImage from './connect-image.svg';

export const EmptyPortfolioOverview = () => {
  const theme = useTheme();
  return (
    <Container>
      <ConnectContainer>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ConnectImage src={connectImage} alt="connect wallet" />
          <Box>
            <H2>
              <FormattedMessage defaultMessage={'Connect your wallet'} />
            </H2>
            <Subtitle>
              <FormattedMessage
                defaultMessage={'Connect your wallet to see your positions.'}
              />
            </Subtitle>
          </Box>
        </Box>

        <Button
          size="medium"
          sx={{ height: theme.spacing(6), padding: '0px 20px' }}
        >
          <FormattedMessage defaultMessage={'Connect Wallet'} />
        </Button>
      </ConnectContainer>
    </Container>
  );
};

const ConnectContainer = styled(Box)(
  ({ theme }) => `
  background: ${theme.palette.background.paper};
  width: 100%;
  padding: ${theme.spacing(5, 3)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: ${theme.shape.borderRadius()};
  border: ${theme.shape.borderStandard};
`
);

const Container = styled(Box)(`
  width: 80%;
`);

const ConnectImage = styled('img')(
  ({ theme }) => `
  height: ${theme.spacing(8)};
  width: ${theme.spacing(8)};
  margin-right: ${theme.spacing(2)};
`
);

export default EmptyPortfolioOverview;
