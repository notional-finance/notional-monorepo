import { CompatRoute, useLocation } from 'react-router-dom-v5-compat';
import { Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { RouteType } from '@notional-finance/util';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { usePageTrack } from '@notional-finance/helpers';

const LandingPageLayoutRoute = ({
  component: Component,
  path,
  routeType,
}: {
  component: React.ElementType;
  path: string;
  routeType: RouteType;
}) => {
  const location = useLocation();
  const selectedNetwork = useSelectedNetwork();
  usePageTrack(routeType, selectedNetwork);

  return (
    <CompatRoute
      path={path}
      key={location.hash}
      render={(matchProps: Record<string, unknown>) => (
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

export default LandingPageLayoutRoute;
