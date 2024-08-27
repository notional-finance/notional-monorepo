import { decodeERC1155Id, getNowSeconds } from '@notional-finance/util';
import { PRICE_ORACLES } from '../../client/oracle-registry-client';
import { Instance } from 'mobx-state-tree';
import { OracleDefinitionModel } from '../ModelTypes';

interface Node {
  id: string;
  inverted: boolean;
}

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
        id: oracle.id,
        inverted: true,
      };

      const baseToQuote = adjList[oracle.base.id] || {};
      baseToQuote[oracle.quote.id] = {
        id: oracle.id,
        inverted: false,
      };

      adjList[oracle.quote.id] = quoteToBase;
      adjList[oracle.base.id] = baseToQuote;
      return adjList;
    }, {} as Record<string, Record<string, Node>>);
};
