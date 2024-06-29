import { ethers } from 'ethers';
import { getProviderFromNetwork, Network } from '@notional-finance/util';
import {
  ConfigDefinition,
  SourceType,
  MulticallConfig,
  DataOperations,
  MulticallOperation,
  TableName,
  IDataWriter,
  SubgraphOperation,
  SubgraphConfig,
  ProtocolName,
  ConfigFilter,
  GenericDataConfig,
} from './types';
import { GenericDataWriter, TokenBalanceDataWriter } from './DataWriter';
import { gql } from '@apollo/client/core';
import { configDefs as GenericConfig } from './config/GenericConfig';
import { Balancer_Config } from './config/balancer';
import { Curve_Config } from './config/convex';

export const SourceContracts = {};

const SUBGRAPH_API_KEY = process.env['SUBGRAPH_API_KEY'] as string;

export const defaultConfigDefs: ConfigDefinition[] = [
  ...GenericConfig,
  ...Balancer_Config,
  ...Curve_Config,
];

export const defaultGraphEndpoints: () => Record<
  string,
  Record<string, string>
> = () => {
  const SUBGRAPH_API_KEY = process.env['SUBGRAPH_API_KEY'] as string;

  return {
    [ProtocolName.NotionalV3]: {
      [Network.mainnet]: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/4oVxkMtN4cFepbiYrSKz1u6HWnJym435k5DQRAFt2vHW`,
      [Network.arbitrum]: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/7q9wQYD8VB5dLWZxtuBZ8b2i8DySCK25V6XqpbdYbDep`,
    },
    [ProtocolName.BalancerV2]: {
      [Network.mainnet]: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/C4ayEZP2yTXRAB8vSaTrgN4m9anTe9Mdm2ViyiAuV9TV`,
      [Network.arbitrum]: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/98cQDy6tufTJtshDCuhh9z2kWXsQWBHVh2bqnLHsGAeS`,
    },
    [ProtocolName.Curve]: {
      [Network.mainnet]: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/3fy93eAT56UJsRCEht8iFhfi6wjHWXtZ9dnnbQmvFopF`,
      [Network.arbitrum]: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/Gv6NJRut2zrm79ef4QHyKAm41YHqaLF392sM3cz9wywc`,
    },
  };
};

export const defaultDataWriters: Record<string, IDataWriter> = {
  [TableName.GenericData]: new GenericDataWriter(),
  [TableName.TokenData]: new TokenBalanceDataWriter(),
};

export function getOutputName(
  outputs: ethers.utils.ParamType[],
  indices: number[]
) {
  let name = '';
  let current = outputs;
  for (let i = 0; i < indices.length; i++) {
    if (current.length === 0) break;

    const comp = current[indices[i]];
    if (comp.name && comp.name !== '') {
      name += comp.name;
    } else {
      name += i.toString();
    }
    if (comp.components && comp.components.length > 0) {
      current = comp.components;
    } else {
      current = [];
    }
  }

  return name;
}

export function getMulticallParams(config: MulticallConfig) {
  const abi = new ethers.utils.Interface(config.contractABI);

  let key = `${config.contractAddress}:${config.method}`;

  if (config.args) {
    for (let i = 0; i < config.args.length; i++) {
      key += `:${config.args[i]}`;
    }
  }

  let transform = config.transform;
  const func = abi.getFunction(config.method);

  if (!func) {
    throw Error(
      `Invalid method ${config.method} on contract ${config.contractAddress}`
    );
  }

  const outputs = func.outputs;
  if (transform === undefined && outputs && outputs.length > 1) {
    if (!config.outputIndices) {
      throw Error(
        `Output indices not defined for method ${config.method} on contract ${config.contractAddress}`
      );
    }

    const indices = config.outputIndices;
    key += `:${getOutputName(outputs, indices)}`;

    transform = (r) => {
      let current = r as any;
      for (let i = 0; i < indices.length; i++) {
        current = current[indices[i]];
      }
      return current;
    };
  }

  return {
    key,
    transform,
  };
}

export function buildOperations(
  configDefs: ConfigDefinition[],
  filter?: ConfigFilter
): DataOperations {
  let filteredDefs: ConfigDefinition[] = [];
  if (!filter) {
    filteredDefs = configDefs;
  } else {
    filteredDefs = configDefs.filter((cfg) => {
      if (cfg.tableName === TableName.GenericData) {
        const dataConfig = cfg.dataConfig as GenericDataConfig;
        if (
          filter.include.find(
            (f) =>
              dataConfig.strategyId === f.strategyId &&
              dataConfig.variable === f.variable &&
              dataConfig.decimals === f.decimals
          )
        ) {
          return true;
        }
      }
      return false;
    });
  }

  const aggregateCalls = new Map<Network, MulticallOperation[]>();
  const subgraphCalls = new Map<Network, SubgraphOperation[]>();
  filteredDefs.forEach((cfg) => {
    if (cfg.sourceType === SourceType.Multicall) {
      const configData = cfg.sourceConfig as MulticallConfig;
      const params = getMulticallParams(configData);
      let operations = aggregateCalls.get(cfg.network);
      if (!operations) {
        operations = [];
        aggregateCalls.set(cfg.network, operations);
      }
      operations.push({
        configDef: cfg,
        aggregateCall: {
          stage: 0,
          target: new ethers.Contract(
            configData.contractAddress,
            configData.contractABI,
            getProviderFromNetwork(cfg.network, true)
          ),
          method: configData.method,
          key: params.key,
          transform: params.transform,
          args: configData.args,
        },
      });
    } else if (cfg.sourceType === SourceType.Subgraph) {
      const configData = cfg.sourceConfig as SubgraphConfig;
      let operations = subgraphCalls.get(cfg.network);
      if (!operations) {
        operations = [];
        subgraphCalls.set(cfg.network, operations);
      }
      const endpoint =
        defaultGraphEndpoints()[configData.protocol.toString()][
          cfg.network.toString()
        ];

      if (endpoint) {
        operations.push({
          configDef: cfg,
          subgraphQuery: gql(configData.query),
          endpoint: endpoint,
        });
      }
    } else {
      throw Error('Invalid source type');
    }
  });

  return {
    aggregateCalls,
    subgraphCalls,
  };
}
