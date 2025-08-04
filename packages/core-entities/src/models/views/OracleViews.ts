import {
  getNowSeconds,
  Network,
  RATE_PRECISION,
  SCALAR_PRECISION,
  SECONDS_IN_YEAR,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { PRICE_ORACLES } from '../../Definitions';
import { Instance } from 'mobx-state-tree';
import { OracleDefinitionModel } from '../ModelTypes';
import { ExchangeRate, TokenDefinition } from '../../Definitions';
import { BigNumber } from 'ethers';
import { NetworkModel } from '../NetworkModel';

interface Node {
  oracle: string;
  inverted: boolean;
}

const UNIT_RATE = 'UNIT_RATE';

// Can change this to fCashOracleRate to use oracle rates
const FCASH_RATE_SOURCE = 'fCashSpotRate';

function getUnitRate(
  network: Network,
  baseId: string,
  quoteId?: string
): Instance<typeof OracleDefinitionModel> {
  return OracleDefinitionModel.create({
    id: UNIT_RATE,
    base: baseId,
    quote: quoteId || baseId,
    network,
    oracleType: 'Chainlink',
    decimals: 18,
    oracleAddress: ZERO_ADDRESS,
    latestRate: {
      rate: SCALAR_PRECISION,
      timestamp: 2 ** 32,
      blockNumber: 2 ** 32,
    },
  });
}

function scaleTo(
  rate: BigNumber,
  oracleDecimals: number,
  decimals = 18
): BigNumber {
  if (oracleDecimals < decimals) {
    // Scale to 18 decimals:
    // mul 10 ^ (18 - r.decimals)
    return rate.mul(BigNumber.from(10).pow(decimals - oracleDecimals));
  } else if (oracleDecimals > decimals) {
    // Scale to 18 decimals:
    return rate.div(BigNumber.from(10).pow(oracleDecimals - decimals));
  } else {
    return rate;
  }
}

function invertRate(rate: BigNumber) {
  return rate.isZero()
    ? SCALAR_PRECISION
    : SCALAR_PRECISION.mul(SCALAR_PRECISION).div(rate);
}

export function interestToExchangeRate(
  interestRate: BigNumber,
  maturity: number,
  currentTime = getNowSeconds()
) {
  if (maturity < currentTime) return SCALAR_PRECISION;

  // exchange rate = e ^ (rt)
  return BigNumber.from(
    Math.floor(
      Math.exp(
        (interestRate.toNumber() * (maturity - currentTime)) /
          (SECONDS_IN_YEAR * RATE_PRECISION)
      ) * RATE_PRECISION
    )
  ).mul(RATE_PRECISION);
}

export const OracleViews = (self: Instance<typeof NetworkModel>) => {
  const findPath = (base: string, quote: string) => {
    const adjList = self.oracleGraph.adjList;
    // Will return a unit oracle rate so that risk adjustments still work
    if (base === quote) return [base];

    let path = [base];
    const queue = [path];

    while (queue.length > 0) {
      const currentPath = queue.shift();
      if (!currentPath || currentPath.length === 0) continue;

      const lastID = currentPath[currentPath.length - 1];
      // If the last symbol of the path is the base then quit
      if (lastID === quote) {
        path = currentPath;
        break;
      }

      // Loop into nodes linked to the last symbol
      Array.from(adjList.get(lastID)?.keys() || []).forEach((id) => {
        // Check if the current path includes the symbol, if it does then skip adding it
        if (!currentPath.includes(id)) queue.push([...currentPath, id]);
      });
    }

    // This ensures there are at least 2 entries in the path since base !== quote
    if (path[path.length - 1] !== quote)
      throw Error(`Path from ${base} to ${quote} not found`);

    return path;
  };

  const getRatesFromPath = (
    path: string[],
    timestamp = getNowSeconds(),
    useHistorical = false
  ): ExchangeRate[] => {
    const adjList = self.oracleGraph.adjList;

    return path.map((token, i) => {
      let oracle: Instance<typeof OracleDefinitionModel> | undefined;
      let inverted = false;

      if (i === 0) {
        oracle = getUnitRate(self.network, token);
      } else {
        let oracleId = path[i - 1];
        if (useHistorical) {
          // Uses oracle rates historically
          oracleId = oracleId.replace(FCASH_RATE_SOURCE, 'fCashOracleRate');
        }
        const n = adjList.get(token)?.get(oracleId);

        if (n) {
          inverted = n.inverted;
          oracle = n.oracle;
        } else {
          if (!oracle)
            throw Error(
              `Update Subject for ${oracleId} not found at ${timestamp}`
            );
        }
      }

      const rate = BigNumber.from(oracle.latestRate.rate);

      const scaledRate = inverted
        ? invertRate(scaleTo(rate, oracle.decimals))
        : scaleTo(rate, oracle.decimals);

      const adjusted = {
        ...oracle.latestRate,
        rate: scaledRate,
      };

      return adjusted;
    });
  };

  const getExchangeRateBetweenTokens = (
    base: string,
    quote: string,
    timestamp?: number
  ) => {
    const path = findPath(base, quote);
    const rates = getRatesFromPath(
      path,
      timestamp,
      timestamp !== undefined // useHistorical
    );

    if (rates.length === 0) return null;

    return rates.reduce(
      (p, er) => (er && p ? p.mul(er.rate).div(SCALAR_PRECISION) : null),
      BigNumber.from(SCALAR_PRECISION) as BigNumber | null
    );
  };

  const getInterestAccrualRate = (token: TokenDefinition) => {
    const oracle = self.oracles.get(
      `${token.underlying}:${token.id}:${
        token.tokenType === 'VaultShare'
          ? 'VaultShareInterestAccrued'
          : 'nTokenInterestAccrued'
      }`
    );
    // TODO: PendlePT vaults don't have interest accrual rates
    if (!oracle || !oracle.latestRate.rate) return undefined;
    return oracle.latestRate;
  };

  return {
    getExchangeRateBetweenTokens,
    getInterestAccrualRate,
  };
};

export const buildOracleGraph = (
  oracles: Instance<typeof OracleDefinitionModel>[]
) => {
  return Array.from(oracles.values())
    .filter((oracle) => PRICE_ORACLES.includes(oracle.oracleType))
    .reduce((adjList, oracle) => {
      const quoteToBase = adjList[oracle.quote.id] || {};
      quoteToBase[oracle.base.id] = {
        oracle: oracle.id,
        inverted: true,
      };

      const baseToQuote = adjList[oracle.base.id] || {};
      baseToQuote[oracle.quote.id] = {
        oracle: oracle.id,
        inverted: false,
      };

      adjList[oracle.quote.id] = quoteToBase;
      adjList[oracle.base.id] = baseToQuote;
      return adjList;
    }, {} as Record<string, Record<string, Node>>);
};
