import PropTypes from 'prop-types';
import { CompatRoute } from 'react-router-dom-v5-compat';
import { Footer, Header } from '@notional-finance/shared-web';
import { PreviousUiPopup } from '@notional-finance/mui';
import { WalletSelector } from '@notional-finance/wallet';
import { Box, styled } from '@mui/material';

const AppLayoutRoute = ({ component: Component, path, routeKey }) => {
  console.log({ path });
  return (
    <CompatRoute
      path={path}
      key={routeKey}
      render={(matchProps) => (
        <Box>
          <AppShell>
            {!path.includes('contest') && (
              <Header>
                <WalletSelector />
              </Header>
            )}

            <MainContent>
              <Component {...matchProps} />
            </MainContent>
            <PreviousUiPopup />
            <StyledFooter />
          </AppShell>
        </Box>
      )}
    />
  );
};

const AppShell = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding-top: 73px;

  ${theme.breakpoints.up('xs')} {
    padding-top: 57px;
  }

  ${theme.breakpoints.up('sm')} {
    padding-top: 73px;
  }
`
);

const MainContent = styled('div')(
  ({ theme }) => `
  display: flex;
  flex-grow: 1;
  &>div {
    height: 100%;
    width: 100%;
  }
`
);

const StyledFooter = styled(Footer)({});

AppLayoutRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  path: PropTypes.string.isRequired,
  routeKey: PropTypes.string,
};

AppLayoutRoute.defaultProps = {
  routeKey: '',
};

export default AppLayoutRoute;
