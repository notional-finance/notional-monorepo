import {
  fetchGraphPaginate,
  initializeTokenBalanceRegistry,
  loadGraphClientDeferred,
  TokenBalance,
} from '@notional-finance/core-entities';
import { getNowSeconds, Network } from '@notional-finance/util';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AccountPositionsQuery } from 'packages/core-entities/src/.graphclient';

export interface Env {
  VIEW_CACHE_R2: R2Bucket;
  NX_SUBGRAPH_API_KEY: string;
}

const POINTS_KEY = 'points/beta-contest';

interface Points {
  address: string;
  points: number;
}
interface PointsResponse {
  points: Points[];
  lastUpdated: number;
}

export default {
  async fetch(
    _request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const points = await env.VIEW_CACHE_R2.get(POINTS_KEY);
    if (!points) {
      return new Response('No points found', { status: 404 });
    }

    const pointsResponse = (await points.json()) as PointsResponse;
    return new Response(JSON.stringify(pointsResponse), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    const models = initializeTokenBalanceRegistry();
    await Promise.all(models.map((m) => m.triggerRefresh(true)));
    const { AccountPositionsDocument } = await loadGraphClientDeferred();

    const allPositions = await fetchGraphPaginate(
      Network.mainnet,
      AccountPositionsDocument,
      'balances',
      env.NX_SUBGRAPH_API_KEY
    );
    const mainnet = models.find((m) => m.network === Network.mainnet);
    if (!mainnet) {
      throw new Error('Mainnet model not found');
    }
    if (!allPositions.data) {
      throw new Error('No positions found');
    }
    const previousPoints = await env.VIEW_CACHE_R2.get(POINTS_KEY);
    if (!previousPoints) {
      throw new Error('No previous points found');
    }
    const previousPointsResponse =
      (await previousPoints?.json()) as PointsResponse;
    const previousPointsMap = new Map<string, number>(
      previousPointsResponse.points.map((p) => [p.address, p.points])
    );

    const newPointsMap = (
      allPositions.data.balances as AccountPositionsQuery['balances']
    )
      .map((b) => {
        const token = mainnet.getTokenByID(b.token.id.toLowerCase());
        const balance = TokenBalance.from(b.current.currentBalance, token);
        let points = balance.toFiat('USD').toFloat();
        // Cap the points at 25_000
        if (points > 25_000) points = 25_000;

        return {
          address: b.id,
          points,
        };
      })
      .reduce((acc, curr) => {
        acc.set(curr.address, (acc.get(curr.address) || 0) + curr.points);
        return acc;
      }, previousPointsMap);

    const newPointsResponse = {
      points: Array.from(newPointsMap.entries()).map(([address, points]) => ({
        address,
        points,
      })),
      lastUpdated: getNowSeconds(),
    };

    env.VIEW_CACHE_R2.put(POINTS_KEY, JSON.stringify(newPointsResponse));
  },
};
