import PropTypes from 'prop-types';
import { CompatRoute } from 'react-router-dom-v5-compat';
import { Footer, Header } from '@notional-finance/shared-web';
import { PreviousUiPopup, PageLoading } from '@notional-finance/mui';
import { WalletSelector } from '@notional-finance/wallet';
import { useNotional } from '@notional-finance/notionable-hooks';
import { Box, styled } from '@mui/material';

const AppLayoutRoute = ({ component: Component, path, routeKey }) => {
  const { loaded } = useNotional();
  return (
    <CompatRoute
      path={path}
      key={routeKey}
      render={(matchProps) => (
        <Box>
          {loaded ? (
            <AppShell>
              <Header>
                <WalletSelector />
              </Header>

              <MainContent>
                <Component {...matchProps} />
              </MainContent>
              <PreviousUiPopup />
              <StyledFooter />
            </AppShell>
          ) : (
            <PageLoading />
          )}
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
