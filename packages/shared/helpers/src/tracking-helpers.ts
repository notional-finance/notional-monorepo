import { datadogRum } from '@datadog/browser-rum';
import {
  Network,
  RouteType,
  getDefaultNetworkFromHostname,
} from '@notional-finance/util';
import { AnalyticsBrowser } from '@segment/analytics-next';
import { useEffect, useState } from 'react';
import { useLocation, Location } from 'react-router';

export const analytics = AnalyticsBrowser.load(
  {
    writeKey: process.env['NX_SEGMENT_KEY'] as string,
  },
  {
    integrations: {
      'Segment.io': {
        apiHost: 'analytics.notional.finance/v1',
        protocol: 'https',
      },
    },
  }
);

export const safeDatadogRum = {
  addAction: (eventName: string, context?: Record<string, unknown>) => {
    if (
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('dev')
    ) {
      datadogRum.addAction(eventName, context);
    }
  },
  setUser: (user: Parameters<typeof datadogRum.setUser>[0]) => {
    if (
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('dev')
    ) {
      analytics.user().then((u) => {
        user['anonymousId'] = u.anonymousId();
        datadogRum.setUser(user);
      });
    }
  },
};

export type RouteState = { routeType: RouteType } | undefined;
type Route = Location<RouteState>;

export function trackEvent(category: string, props?: Record<string, unknown>) {
  analytics.track(category, props);
  safeDatadogRum.addAction(category, props);
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
  walletLabel: string,
  tokenBalances?: string
) {
  analytics.identify(account, {
    selectedNetwork,
    walletLabel,
    tokenBalances,
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

export const useDatadogNewUserTracking = () => {
  useEffect(() => {
    analytics.user().then((user) => {
      const ddUser = datadogRum.getUser();
      if (
        user.anonymousId() &&
        !user.id() &&
        Object.keys(ddUser).length === 0
      ) {
        safeDatadogRum.setUser({
          hasConnectedWallet: false,
        });
      }
    });
  }, []);
};

export const useBackStack = () => {
  const location: Route = useLocation();
  const [backStack, setBackStack] = useState<Route[]>([location]);

  useEffect(() => {
    setBackStack([...backStack, location]);
    // Backstack is only updated when the location changes and should not be in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBackStack, location]);

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
