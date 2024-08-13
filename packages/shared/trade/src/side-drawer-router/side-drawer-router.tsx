import { useTheme } from '@mui/material';
import {
  Drawer,
  SideBarSubHeader,
  DrawerTransition,
} from '@notional-finance/mui';
import {
  AllTradeTypes,
  BaseTradeState,
  getComparisonKey,
} from '@notional-finance/notionable';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { useEffect } from 'react';
import { defineMessage } from 'react-intl';
import {
  Route,
  Routes,
  matchPath,
  useLocation,
  useNavigate,
} from 'react-router-dom';

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
}

export const SideDrawerRouter = ({
  hasPosition,
  defaultHasPosition,
  defaultNoPosition,
  routes,
  context,
  routeMatch,
}: SideDrawerRouterProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    const match = matchPath<'path', string>({ path: routeMatch }, pathname);
    const noPath = !match || match.params.path === undefined;
    const incorrectDefault =
      match &&
      (hasPosition
        ? match.params.path === defaultNoPosition
        : match.params.path !== defaultNoPosition);

    if (noPath || incorrectDefault) {
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
  ]);

  const { clearSideDrawer } = useSideDrawerManager();

  useEffect(() => {
    clearSideDrawer();
  }, [clearSideDrawer]);

  return (
    <Drawer size="large">
      <Routes>
        {routes.map((r, i) => (
          <DrawerRoute
            key={i}
            path={routeMatch.replace(':path', r.slug)}
            context={context}
            {...r}
          />
        ))}
      </Routes>
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
    <Route path={path}>
      <DrawerTransition fade={isRootDrawer}>
        {!isRootDrawer && (
          // Root drawer does not have a back button
          <SideBarSubHeader
            paddingTop={theme.spacing(5)}
            callback={onBack || (() => navigate(-1))}
            titleText={defineMessage({ defaultMessage: 'Back' })}
          />
        )}
        <Component />
      </DrawerTransition>
    </Route>
  );
};
