import {
  Network,
  RouteType,
  getDefaultNetworkFromHostname,
} from '@notional-finance/util';
import { AnalyticsBrowser } from '@segment/analytics-next';
import { Location } from 'history';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

export const analytics = AnalyticsBrowser.load({
  writeKey: 'XZALrDl4xda9wqUZLkoZ3qKvrtLYOXO9',
});

const PROXY_HOST =
  process.env['NX_DATA_URL'] || 'https://data.notional.finance';

type RouteState = { routeType: RouteType } | undefined;
type Route = Location<RouteState>;

export function trackEvent(category: string, props?: Record<string, unknown>) {
  analytics.track(category, props);
}

export function trackOutboundLink(href: string) {
  const url = new URL(href);
  let event = 'Link';
  if (url.hostname === 'docs.notional.finance') event = 'Doc Link';
  analytics.track(event, {
    hostname: url.hostname,
    href,
  });
}

// export function trackInputInteraction() {
//   // input fields
//   // page
//   // user id
//   // confirmation

// }

export function identify(
  account: string,
  network: Network | undefined,
  walletLabel: string
) {
  analytics.identify(account, {
    network,
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
      prevPath: prevLocation?.pathname,
      prevRouteType: prevLocation?.state?.routeType,
    }
  );
}

export const usePageTracking = (selectedNetwork?: Network) => {
  const history = useHistory<RouteState>();
  const [backStack, setBackStack] = useState<Route[]>([]);

  useEffect(() => {
    const defaultNetwork = getDefaultNetworkFromHostname(
      window.location.hostname
    );
    setBackStack([history.location]);
    trackPageView(defaultNetwork, history.location);
    // NOTE: history.listen does not track the initial landing page so all of the data
    // is initialized here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return history.listen((location, action) => {
      if (selectedNetwork) {
        trackPageView(
          selectedNetwork,
          location,
          backStack[backStack.length - 1]
        );
      }

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
  }, [setBackStack, history, backStack, selectedNetwork]);
};
