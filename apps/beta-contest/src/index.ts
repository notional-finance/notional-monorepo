import {
  destroyGraphClient,
  fetchGraphPaginate,
  initializeTokenBalanceRegistry,
  loadGraphClientDeferred,
  TokenBalance,
} from '@notional-finance/core-entities';
import { getNowSeconds, Network } from '@notional-finance/util';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AllVaultAccountsQuery } from 'packages/core-entities/src/.graphclient';
import { fetchYields } from './yields';

export interface Env {
  VIEW_CACHE_R2: R2Bucket;
  NX_SUBGRAPH_API_KEY: string;
}

const POINTS_KEY = 'points/beta-contest';

interface Points {
  address: string;
  points: number;
  pointsPerDay: number;
}
interface PointsResponse {
  points: Points[];
  totalPointsIssued: number;
  totalPointsPerDay: number;
  lastUpdated: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function refreshPoints(env: Env) {
  const models = initializeTokenBalanceRegistry();
  await Promise.all(models.map((m) => m.triggerRefresh(true)));
  const { AllVaultAccountsDocument } = await loadGraphClientDeferred();

  // TODO: this removes empty positions from the points calculation, that needs to be fixed.
  const allPositions = await fetchGraphPaginate(
    Network.mainnet,
    AllVaultAccountsDocument,
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
  let previousPointsResponse: PointsResponse = {
    points: [],
    totalPointsIssued: 0,
    totalPointsPerDay: 0,
    lastUpdated: 0,
  };
  const previousPoints = await env.VIEW_CACHE_R2.get(POINTS_KEY);
  if (previousPoints) {
    previousPointsResponse = (await previousPoints.json()) as PointsResponse;
  }

  const previousPointsMap = new Map<string, number>(
    previousPointsResponse.points.map((p) => [p.address, p.points])
  );

  const pointsPerDayMap = (
    allPositions.data.balances as AllVaultAccountsQuery['balances']
  )
    .map((b) => {
      const token = mainnet.getTokenByID(b.token.id.toLowerCase());
      const balance = TokenBalance.from(b.current.currentBalance, token);
      const points = balance.toFiat('USD').toFloat();

      return {
        address: b.account.id,
        points,
      };
    })
    .reduce((acc, curr) => {
      acc.set(curr.address, (acc.get(curr.address) || 0) + curr.points);
      return acc;
    }, new Map<string, number>());

  const accountPoints = Array.from(pointsPerDayMap.entries()).map(
    ([address, pointsPerDay]) => ({
      address,
      points: (previousPointsMap.get(address) || 0) + pointsPerDay,
      pointsPerDay,
    })
  );
  const newPointsResponse = {
    points: accountPoints,
    totalPointsPerDay: accountPoints.reduce(
      (t, { pointsPerDay }) => t + pointsPerDay,
      0
    ),
    totalPointsIssued: accountPoints.reduce((t, { points }) => t + points, 0),
    lastUpdated: getNowSeconds(),
  };

  await env.VIEW_CACHE_R2.put(POINTS_KEY, JSON.stringify(newPointsResponse));
  await destroyGraphClient();
}

export default {
  async fetch(
    req: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/fetchYields') {
      const yields = await fetchYields();
      return new Response(JSON.stringify(yields), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const points = await env.VIEW_CACHE_R2.get(POINTS_KEY);
    if (!points) {
      return new Response('No points found', { status: 404 });
    }

    const pointsResponse = (await points.json()) as PointsResponse;
    return new Response(JSON.stringify(pointsResponse), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  },
};
