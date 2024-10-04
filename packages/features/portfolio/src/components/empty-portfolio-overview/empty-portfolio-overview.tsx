import { useTheme, Box, styled } from '@mui/material';
import { H2, Subtitle, Button } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import connectImage from './connect-wallet.svg';
// import { ProductRateCards } from './product-rate-cards';
import { useSideDrawerManager } from '@notional-finance/notionable-hooks';
import { SETTINGS_SIDE_DRAWERS } from '@notional-finance/util';
// import { useEmptyPortfolioOverview } from './use-empty-portfolio-overview';

interface EmptyPortfolioOverviewProps {
  walletConnected: boolean;
}

export const EmptyPortfolioOverview = ({
  walletConnected,
}: EmptyPortfolioOverviewProps) => {
  const theme = useTheme();
  // const { earnYieldData, borrowData } = useEmptyPortfolioOverview();
  const { setWalletSideDrawer } = useSideDrawerManager();
  return (
    <Container>
      {!walletConnected && (
        <ConnectContainer>
          <ConnectWalletContainer>
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
          </ConnectWalletContainer>

          <Button
            size="medium"
            sx={{ height: theme.spacing(6), padding: '0px 20px' }}
            onClick={() =>
              setWalletSideDrawer(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET)
            }
          >
            <FormattedMessage defaultMessage={'Connect Wallet'} />
          </Button>
        </ConnectContainer>
      )}
      {/* NOTE: We should remove this old earn and borrow state zero stuff since we have the welcome page and this is out of date */}
      {/* <ProductContainer>
        <ProductRateCards
          productRateData={earnYieldData}
          title={<FormattedMessage defaultMessage={'Earn Yield'} />}
        />
      </ProductContainer>
      <ProductContainer>
        <ProductRateCards
          productRateData={borrowData}
          title={<FormattedMessage defaultMessage={'Borrow'} />}
        />
      </ProductContainer> */}
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
  ${theme.breakpoints.down('sm')} {
    flex-direction: column;
    gap: ${theme.spacing(3)};
  }
`
);

// const ProductContainer = styled(Box)(
//   ({ theme }) => `
//   margin-top: ${theme.spacing(3)};
//   background: ${theme.palette.background.paper};
//   width: 100%;
//   padding: ${theme.spacing(3)};
//   display: flex;
//   flex-wrap: wrap;
//   border-radius: ${theme.shape.borderRadius()};
//   border: ${theme.shape.borderStandard};
//   gap: 24px;
// `
// );

const Container = styled(Box)(
  `
  width: 100%;
`
);

const ConnectWalletContainer = styled(Box)(
  ({ theme }) => `
  display: flex; 
  align-items: center;
  ${theme.breakpoints.down('sm')} {
    flex-direction: column;
  }
`
);

const ConnectImage = styled('img')(
  ({ theme }) => `
  height: ${theme.spacing(8)};
  width: ${theme.spacing(8)};
  margin-right: ${theme.spacing(2)};
`
);

export default EmptyPortfolioOverview;
