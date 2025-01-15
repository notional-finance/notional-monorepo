import { useTheme } from '@mui/material';
import { Drawer, SideBarSubHeader } from '@notional-finance/mui';
import { AllTradeTypes, BaseTradeState } from '@notional-finance/notionable';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';
import { isAlive } from 'mobx-state-tree';
import { useEffect } from 'react';
import { defineMessage } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';

interface DrawerRouteProps {
  slug: string;
  isRootDrawer?: boolean;
  Component: React.ComponentType;
  requiredState: Partial<BaseTradeState> & {
    tradeType: AllTradeTypes;
  };
  onBack?: () => void;
}

interface SideDrawerRouterProps {
  hasPosition: boolean;
  defaultHasPosition: string;
  defaultNoPosition: string;
  routes: DrawerRouteProps[];
  routeMatch: string;
  action?: string;
}

export const SideDrawerRouter = ({
  hasPosition,
  defaultHasPosition,
  defaultNoPosition,
  routes,
  routeMatch,
  action,
}: SideDrawerRouterProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    const incorrectDefault = hasPosition
      ? action === defaultNoPosition
      : action !== defaultNoPosition;

    if (action === undefined || incorrectDefault) {
      const defaultPath = routeMatch.replace(
        ':path',
        hasPosition ? defaultHasPosition : defaultNoPosition
      );
      // Use replace here to avoid breaking the back button
      navigate(defaultPath, { replace: true });
    }
  }, [
    routeMatch,
    pathname,
    hasPosition,
    defaultHasPosition,
    defaultNoPosition,
    navigate,
    action,
  ]);
  const route = routes.find((r) => r.slug === action);

  return (
    <Drawer size="large">
      {route && (
        <DrawerRoute
          key={route.slug}
          path={routeMatch.replace(':path', route.slug)}
          Component={route.Component}
          isRootDrawer={route.isRootDrawer}
          onBack={route.onBack}
          slug={route.slug}
          requiredState={route.requiredState}
        />
      )}
    </Drawer>
  );
};

const DrawerRoute = observer(
  ({
    Component,
    isRootDrawer,
    onBack,
    path,
    requiredState,
  }: DrawerRouteProps & {
    isRootDrawer?: boolean;
    path: string;
  }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const trade = useCurrentTradeContext();

    useEffect(() => {
      if (trade && isAlive(trade)) {
        trade.setRequiredSideDrawerState(requiredState, path);
      }
    }, [requiredState, path, trade]);

    return (
      <div>
        {!isRootDrawer && (
          <SideBarSubHeader
            paddingTop={theme.spacing(5)}
            callback={onBack || (() => navigate(-1))}
            titleText={defineMessage({ defaultMessage: 'Back' })}
          />
        )}
        <Component />
      </div>
    );
  }
);
