import { useTheme } from '@mui/material';
import {
  Drawer,
  SideBarSubHeader,
  // DrawerTransition,
} from '@notional-finance/mui';
import {
  AllTradeTypes,
  BaseTradeState,
  getComparisonKey,
} from '@notional-finance/notionable';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
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
  context: BaseTradeContext;
  routeMatch: string;
  action?: string;
}

export const SideDrawerRouter = ({
  hasPosition,
  defaultHasPosition,
  defaultNoPosition,
  routes,
  context,
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

  console.log('route.slug: ', route?.slug);
  console.log(
    'routeMatch.replace(:path, route.slug): ',
    routeMatch.replace(':path', route?.slug || '')
  );
  console.log('route: ', route);

  return (
    <Drawer size="large">
      {route && (
        <DrawerRoute
          key={route.slug}
          path={routeMatch.replace(':path', route.slug)}
          context={context}
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

const DrawerRoute = ({
  Component,
  isRootDrawer,
  onBack,
  path,
  requiredState,
  context,
}: DrawerRouteProps & {
  isRootDrawer?: boolean;
  path: string;
  context: BaseTradeContext;
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { state, updateState } = context;

  useEffect(() => {
    const allStateMatches = Object.keys(requiredState)
      // NOTE: this means that required state cannot clear previously set state
      .filter((k) => requiredState[k] !== undefined)
      .every((k) => {
        const s = getComparisonKey(k, state);
        const r = getComparisonKey(k, requiredState);
        return s === r;
      });

    if (
      allStateMatches ||
      // Use a "startsWith" here to support potential suffix to the path
      // such as in roll debt
      (state['pathname'] && !state['pathname'].startsWith(path))
    )
      return;

    updateState(requiredState);
  }, [updateState, requiredState, state, path]);

  return (
    <div>
      {!isRootDrawer && (
        // Root drawer does not have a back button
        <SideBarSubHeader
          paddingTop={theme.spacing(5)}
          callback={onBack || (() => navigate(-1))}
          titleText={defineMessage({ defaultMessage: 'Back' })}
        />
      )}
      <Component />
      {/* <DrawerTransition fade={isRootDrawer}></DrawerTransition> */}
    </div>
  );
};
