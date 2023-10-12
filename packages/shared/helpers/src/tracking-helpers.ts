import {
  Network,
  RouteType,
  getDefaultNetworkFromHostname,
} from '@notional-finance/util';
import { AnalyticsBrowser } from '@segment/analytics-next';
import { Location } from 'history';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

const PROXY_HOST =
  process.env['NX_DATA_URL'] || 'https://data.notional.finance';

export const analytics = AnalyticsBrowser.load({
  writeKey: process.env['NX_SEGMENT_KEY'] as string,
});

export type RouteState = { routeType: RouteType } | undefined;
type Route = Location<RouteState>;

export function trackEvent(category: string, props?: Record<string, unknown>) {
  analytics.track(category, props);
}

export function trackOutboundLink(href: string) {
  const url = new URL(href);
  analytics.track('Link', {
    hostname: url.hostname,
    href,
  });
}

export function identify(
  account: string,
  selectedNetwork: Network | undefined,
  walletLabel: string
) {
  analytics.identify(account, {
    selectedNetwork,
    walletLabel,
  });
}

export function trackPageView(
  selectedNetwork: Network,
  currentLocation: Route,
  prevLocation?: Route
) {
  analytics.page(
    currentLocation.state?.routeType ||
      (currentLocation.pathname === '/' ? 'Landing' : 'unknown'),
    currentLocation.pathname,
    {
      selectedNetwork,
      isEntry: prevLocation === undefined,
      prevPath: prevLocation?.pathname,
      prevRouteType: prevLocation?.state?.routeType,
    }
  );
}

export const useBackStack = () => {
  const history = useHistory<RouteState>();
  const [backStack, setBackStack] = useState<Route[]>([history.location]);

  useEffect(() => {
    return history.listen((location, action) => {
      setBackStack((backStack) => {
        switch (action) {
          case 'POP':
            return backStack.slice(0, backStack.length - 1);
          case 'PUSH':
            return [...backStack, location];
          case 'REPLACE':
            return [...backStack.slice(0, backStack.length - 1), location];
        }
      });
    });
  }, [setBackStack, history, backStack]);

  return backStack;
};

export const usePageTrack = (
  routeType: RouteType,
  selectedNetwork?: Network
) => {
  const location = useLocation();
  const backStack = useBackStack();

  useEffect(() => {
    location.state = {
      ...(location['state'] as Record<string, unknown>),
      routeType,
    };
    trackPageView(
      selectedNetwork ||
        getDefaultNetworkFromHostname(window.location.hostname),
      location as Location<RouteState>,
      backStack[backStack.length - 2]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
};
