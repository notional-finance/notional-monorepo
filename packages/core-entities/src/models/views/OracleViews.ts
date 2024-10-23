import {
  decodeERC1155Id,
  getNowSeconds,
  Network,
  PERCENTAGE_BASIS,
  RATE_PRECISION,
  SCALAR_PRECISION,
  SECONDS_IN_YEAR,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { fCashMarket } from '../../exchanges/index';
import { PRICE_ORACLES } from '../../Definitions';
import { Instance } from 'mobx-state-tree';
import { OracleDefinitionModel } from '../ModelTypes';
import {
  ExchangeRate,
  RiskAdjustment,
  TokenDefinition,
} from '../../Definitions';
import { BigNumber } from 'ethers';
import { assertDefined, ConfigurationViews } from './ConfigurationViews';
import { getPoolInstance_ } from './ExchangeViews';
import { NetworkModel } from '../NetworkModel';
import { TokenViews } from './TokenViews';

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
  if (maturity < currentTime) throw Error('Matured interest rate');

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
  const { getConfig } = ConfigurationViews(self);
  const { getNToken, getUnderlying } = TokenViews(self);

  const getInterestRiskAdjustment = (
    oracle: Instance<typeof OracleDefinitionModel>,
    inverted: boolean,
    riskAdjusted: RiskAdjustment
  ) => {
    if (
      (oracle.oracleType !== 'fCashOracleRate' &&
        oracle.oracleType !== 'fCashSpotRate') ||
      riskAdjusted === 'None'
    ) {
      return {
        interestAdjustment: 0,
        maxDiscountFactor: SCALAR_PRECISION,
        oracleRateLimit: undefined,
      };
    }

    const token = inverted ? oracle.base : oracle.quote;
    if (!token.currencyId) throw Error('Invalid quote currency');
    const config = getConfig(token.currencyId);

    if (riskAdjusted === 'Asset') {
      return {
        interestAdjustment: assertDefined(config.fCashHaircutBasisPoints),
        maxDiscountFactor: BigNumber.from(
          assertDefined(config.fCashMaxDiscountFactor)
        ).mul(RATE_PRECISION),
        oracleRateLimit: BigNumber.from(
          assertDefined(config.fCashMaxOracleRate)
        ),
      };
    } else {
      return {
        interestAdjustment: assertDefined(config.fCashDebtBufferBasisPoints),
        maxDiscountFactor: SCALAR_PRECISION,
        oracleRateLimit: BigNumber.from(
          assertDefined(config.fCashMinOracleRate)
        ),
      };
    }
  };

  const getExchangeRiskAdjustment = (
    oracle: Instance<typeof OracleDefinitionModel>,
    inverted: boolean,
    riskAdjusted: RiskAdjustment
  ) => {
    if (riskAdjusted === 'None') return PERCENTAGE_BASIS;
    if (oracle.id === 'UNIT_RATE') return PERCENTAGE_BASIS;

    const token = inverted ? oracle.base : oracle.quote;
    if (!token.currencyId) throw Error('Invalid quote currency');
    const config = getConfig(token.currencyId);

    if (oracle.oracleType === 'Chainlink' && riskAdjusted === 'Debt') {
      return assertDefined(config.debtBuffer);
    } else if (oracle.oracleType === 'Chainlink' && riskAdjusted === 'Asset') {
      return assertDefined(config.collateralHaircut);
    } else if (oracle.oracleType === 'nTokenToUnderlyingExchangeRate') {
      return assertDefined(config.pvHaircutPercentage);
    } else {
      return PERCENTAGE_BASIS;
    }
  };

  const convertFCashRateToExchangeRate = (
    oracle: Instance<typeof OracleDefinitionModel>,
    inverted: boolean,
    riskAdjusted: RiskAdjustment,
    timestamp: number
  ): ExchangeRate => {
    // Adjustment is set to identity values if riskAdjusted is set to None.
    const { interestAdjustment, maxDiscountFactor, oracleRateLimit } =
      getInterestRiskAdjustment(oracle, inverted, riskAdjusted);

    // The fcash asset is always the quote asset in the oracle
    const maturity = oracle.quote.maturity;
    let rate: BigNumber | undefined = oracle.latestRate.rate;
    if (!rate) throw Error('Rate is not found');
    if (!maturity) throw Error('Maturity is not found');

    // Apply oracle min or max limits after adjustments
    if (rate.lt(0)) {
      // Always floor rates at zero
      rate = BigNumber.from(0);
    } else if (oracleRateLimit && riskAdjusted === 'Asset') {
      const adjustedRate = rate.add(interestAdjustment);
      rate = adjustedRate.lt(oracleRateLimit) ? oracleRateLimit : adjustedRate;
    } else if (oracleRateLimit && riskAdjusted === 'Debt') {
      const adjustedRate = rate.lt(interestAdjustment)
        ? BigNumber.from(0)
        : rate.sub(interestAdjustment);

      rate = adjustedRate.gt(oracleRateLimit) ? oracleRateLimit : adjustedRate;
    }

    const exchangeRate = interestToExchangeRate(
      inverted ? rate : rate.mul(-1),
      maturity,
      timestamp
    );

    if (exchangeRate.gt(maxDiscountFactor) && riskAdjusted === 'Asset') {
      return {
        ...oracle.latestRate,
        // Scale the discount factor up to 18 decimals
        rate: maxDiscountFactor,
      };
    } else {
      return { ...oracle.latestRate, rate: exchangeRate };
    }
  };

  function getNTokenSpotRate(
    self: Instance<typeof NetworkModel>,
    oracle: Instance<typeof OracleDefinitionModel>
  ) {
    if (!oracle.base.currencyId) throw Error('currency id not found');
    const nToken = getNToken(oracle.base.currencyId);

    const fCashMarket = getPoolInstance_<fCashMarket>(self, nToken.address);
    const totalSupply = fCashMarket.totalSupply;
    return fCashMarket
      .getNTokenSpotValue()
      .toUnderlying()
      .scale(totalSupply.precision, totalSupply)
      .scaleTo(oracle.decimals);
  }

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
    riskAdjusted: RiskAdjustment,
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
          // When doing historical pricing, if the settlement rate is not found then switch it to
          // use the fCash oracle rate prior to maturity. The settlement rate will be in the path
          // post maturity.
          if (oracleId.endsWith('fCashSettlementRate')) {
            const [base] = oracleId.split(':');
            const { maturity, currencyId } = decodeERC1155Id(base);
            if (timestamp && timestamp < maturity) {
              const underlying = getUnderlying(currencyId);
              // FCASH_RATE_SOURCE is from underlying => fCash id, settlement rates are from
              // fCash id => prime cash
              oracle = self.oracles.get(
                `${underlying.id}:${base}:${
                  // Uses oracle rates historically
                  useHistorical ? 'fCashOracleRate' : FCASH_RATE_SOURCE
                }`
              );
            }

            // TODO: Inverted is implicitly false here...
          }

          if (!oracle)
            throw Error(
              `Update Subject for ${oracleId} not found at ${timestamp}`
            );
        }
      }

      // fCash rates are interest rates so convert them to exchange rates in SCALAR_PRECISION here
      if (oracle.id !== 'UNIT_RATE' && oracle.quote.tokenType === 'fCash') {
        return convertFCashRateToExchangeRate(
          oracle,
          inverted,
          riskAdjusted,
          timestamp
        );
      } else {
        let rate = BigNumber.from(oracle.latestRate.rate);

        if (
          oracle.oracleType === 'nTokenToUnderlyingExchangeRate' &&
          FCASH_RATE_SOURCE === 'fCashSpotRate' &&
          // Only do this for current interest rates
          !useHistorical
        ) {
          // Replaces the nToken oracle valuation with a spot rate valuation
          rate = getNTokenSpotRate(self, oracle);
        }

        const haircutOrBuffer = getExchangeRiskAdjustment(
          oracle,
          inverted,
          riskAdjusted
        );

        const scaledRate = inverted
          ? invertRate(scaleTo(rate, oracle.decimals))
          : scaleTo(rate, oracle.decimals);

        const adjusted = {
          ...oracle.latestRate,
          rate: inverted
            ? scaledRate.mul(PERCENTAGE_BASIS).div(haircutOrBuffer)
            : scaledRate.mul(haircutOrBuffer).div(PERCENTAGE_BASIS),
        };

        return adjusted;
      }
    });
  };

  const getExchangeRateBetweenTokens = (
    base: string,
    quote: string,
    riskAdjustment: RiskAdjustment,
    timestamp?: number
  ) => {
    const path = findPath(base, quote);
    const rates = getRatesFromPath(
      path,
      riskAdjustment,
      timestamp,
      timestamp !== undefined // useHistorical
    );

    if (rates.length === 0) return null;

    return rates.reduce(
      (p, er) => (er && p ? p.mul(er.rate).div(SCALAR_PRECISION) : null),
      BigNumber.from(SCALAR_PRECISION) as BigNumber | null
    );
  };

  const getNTokenOracleRate = (nToken: TokenDefinition) => {
    const oracle = self.oracles.get(
      `${nToken.underlying}:${nToken.id}:nTokenToUnderlyingExchangeRate`
    );
    if (!oracle || !oracle.latestRate.rate)
      throw Error('NToken Oracle Rate not found');
    return oracle.latestRate.rate;
  };

  return { getExchangeRateBetweenTokens, getNTokenOracleRate };
};

export const buildOracleGraph = (
  oracles: Instance<typeof OracleDefinitionModel>[]
) => {
  return Array.from(oracles.values())
    .filter((oracle) => PRICE_ORACLES.includes(oracle.oracleType))
    .reduce((adjList, oracle) => {
      if (
        oracle.oracleType === 'fCashOracleRate' ||
        oracle.oracleType === 'fCashSpotRate'
      ) {
        // Suppress historical fcash rates
        const { maturity } = decodeERC1155Id(oracle.quote.id);
        if (maturity < getNowSeconds()) return adjList;
      }

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
