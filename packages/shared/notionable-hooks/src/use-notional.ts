import { Network } from '@notional-finance/util';
import { useAppStore, useCurrentNetworkStore } from './context/use-root-store';
import { getNetworkModel } from '@notional-finance/core-entities';
import { useObserver } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { PostOrPage } from '@tryghost/content-api';

export function useAppReady() {
  const appStore = useAppStore();
  return appStore.isAppReady;
}

export function useLastUpdateBlockNumber() {
  const currentNetworkStore = useCurrentNetworkStore();
  return currentNetworkStore.lastUpdatedBlock;
}

export function useNOTE(network: Network | undefined) {
  return useObserver(() =>
    network ? getNetworkModel(network).getTokenBySymbol('NOTE') : undefined
  );
}

export function useLandingPageStats() {
  const [kpiData, setKpiData] = useState<
    | {
        totalTVL: string;
        highestUSDC: string;
        highestETH: string;
      }
    | undefined
  >(undefined);

  useEffect(() => {
    const fetchKpiData = async () => {
      const response = await fetch(`${window.location.origin}/kpi`);
      const data: {
        totalTVL: string;
        highestUSDC: string;
        highestETH: string;
      } = await response.json();
      setKpiData(data);
    };

    fetchKpiData();
  }, []);

  return kpiData;
}

export function useLatestBlogPosts() {
  const [blogPosts, setBlogPosts] = useState<PostOrPage[] | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchBlogPosts = async () => {
      const response = await fetch(
        `${window.location.origin}/latest-blog-posts`
      );
      const data: PostOrPage[] = await response.json();
      setBlogPosts(data);
    };
    fetchBlogPosts();
  }, []);

  return blogPosts;
}
