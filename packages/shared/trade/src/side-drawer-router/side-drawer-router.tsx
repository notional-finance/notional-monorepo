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
} from '@notional-finance/notionable';
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

type Path = TradeType | VaultTradeType | 'Manage';
type UpdateState = (args: Partial<BaseTradeState>) => void;

interface DrawerRouteProps {
  tradeType: Path;
  Component: React.ComponentType;
  initialState?: Partial<BaseTradeState>;
  onBack?: () => void;
}

interface SideDrawerRouterProps {
  currentTradeType: TradeType | VaultTradeType | undefined;
  hasPosition: boolean;
  rootPath: string;
  defaultHasPosition: Path;
  defaultNoPosition: Path;
  routes: DrawerRouteProps[];
  updateState: UpdateState;
}

export const SideDrawerRouter = ({
  hasPosition,
  defaultHasPosition,
  defaultNoPosition,
  routes,
  rootPath,
  currentTradeType,
  updateState,
}: SideDrawerRouterProps) => {
  const history = useHistory();
  const { pathname } = useLocation();

  useEffect(() => {
    const match = matchPath<{ path: string }>(pathname, {
      path: `${rootPath}/:path`,
    });
    const noPath = !match || match.params.path === undefined;
    const incorrectDefault =
      match &&
      (hasPosition
        ? match.params.path === defaultNoPosition
        : match.params.path !== defaultNoPosition);

    if (noPath || incorrectDefault) {
      const defaultPath = `${rootPath}/${
        hasPosition ? defaultHasPosition : defaultNoPosition
      }`;
      history.push(defaultPath);
    }
  }, [
    pathname,
    hasPosition,
    defaultHasPosition,
    defaultNoPosition,
    history,
    rootPath,
  ]);

  const { clearSideDrawer } = useSideDrawerManager();

  useEffect(() => {
    clearSideDrawer();
  }, [clearSideDrawer]);

  return (
    <Drawer
      size="large"
      // TODO: can we get away without this padding...
      // sx={{
      //   paddingTop: tradeType ? theme.spacing(4, 2) : '',
      // }}
    >
      <Switch>
        {routes.map((r, i) => (
          <DrawerRoute
            key={i}
            path={`${rootPath}/${r.tradeType}`}
            currentTradeType={currentTradeType}
            isRootDrawer={
              r.tradeType === defaultHasPosition ||
              r.tradeType === defaultNoPosition
            }
            updateState={updateState}
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
  tradeType,
  currentTradeType,
  initialState,
  updateState,
}: DrawerRouteProps & {
  isRootDrawer: boolean;
  path: string;
  updateState: UpdateState;
  currentTradeType: TradeType | VaultTradeType | undefined;
}) => {
  const history = useHistory();
  const theme = useTheme();

  useEffect(() => {
    if (
      currentTradeType === tradeType ||
      (initialState?.tradeType !== undefined &&
        currentTradeType === initialState.tradeType)
    )
      return;

    updateState({
      // If "Manage" is defined then the initial state must supply a trade
      // type if required.
      tradeType: tradeType === 'Manage' ? undefined : tradeType,
      ...(initialState || {}),
    });
  }, [updateState, currentTradeType, tradeType, initialState]);

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
