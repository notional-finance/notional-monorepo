import { useTheme } from '@mui/material';
import {
  Drawer,
  SideBarSubHeader,
  DrawerTransition,
} from '@notional-finance/mui';
import {
  BaseTradeState,
  TradeType,
  VaultTradeType,
  isHashable,
} from '@notional-finance/notionable';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { useEffect } from 'react';
import { defineMessage } from 'react-intl';
import {
  Route,
  Switch,
  matchPath,
  useHistory,
  useLocation,
} from 'react-router';

interface DrawerRouteProps {
  slug: string;
  isRootDrawer?: boolean;
  Component: React.ComponentType;
  requiredState: Partial<BaseTradeState> & {
    tradeType: TradeType | VaultTradeType;
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
  const history = useHistory();
  const { pathname } = useLocation();

  useEffect(() => {
    const match = matchPath<{ path: string }>(pathname, { path: routeMatch });
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
      history.push(defaultPath);
    }
  }, [
    routeMatch,
    pathname,
    hasPosition,
    defaultHasPosition,
    defaultNoPosition,
    history,
  ]);

  const { clearSideDrawer } = useSideDrawerManager();

  useEffect(() => {
    clearSideDrawer();
  }, [clearSideDrawer]);

  return (
    <Drawer size="large">
      <Switch>
        {routes.map((r, i) => (
          <DrawerRoute
            key={i}
            path={routeMatch.replace(':path', r.slug)}
            context={context}
            {...r}
          />
        ))}
      </Switch>
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
  const history = useHistory();
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
    if (allStateMatches) return;

    updateState(requiredState);
  }, [updateState, requiredState, state]);

  return (
    <Route path={path} exact={false}>
      <DrawerTransition fade={isRootDrawer}>
        {!isRootDrawer && (
          // Root drawer does not have a back button
          <SideBarSubHeader
            paddingTop={theme.spacing(18)}
            callback={onBack || history.goBack}
            titleText={defineMessage({ defaultMessage: 'Back' })}
          />
        )}
        <Component />
      </DrawerTransition>
    </Route>
  );
};
