import PropTypes from 'prop-types';
import { CompatRoute } from 'react-router-dom-v5-compat';
import { Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';

const LandingPageLayoutRoute = ({ component: Component, path, routeKey }) => {
  return (
    <CompatRoute
      path={path}
      key={routeKey}
      render={(matchProps) => (
        <Wrapper>
          <Component {...matchProps} />
        </Wrapper>
      )}
    />
  );
};

const Wrapper = styled(Box)(
  `
  width: 100%;
  min-height: 100vh;
  background: ${colors.black};
`
);

LandingPageLayoutRoute.propTypes = {
  component: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
  routeKey: PropTypes.string,
};

LandingPageLayoutRoute.defaultProps = {
  routeKey: '',
};

export default LandingPageLayoutRoute;
