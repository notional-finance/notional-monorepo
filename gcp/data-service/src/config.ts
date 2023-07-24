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
} from './types';
import { GenericDataWriter } from './DataWriter';
import { readFileSync } from 'fs';
import { join } from 'path';
import { gql } from '@apollo/client';
import { configDefs as EthBalancerWETHwstETHConfig } from './config/EthBalancerWETHwstETH';
import { configDefs as ArbConvexUSDCFRAXConfig } from './config/ArbConvexUSDCFRAX';
import { configDefs as GenericConfig } from './config/GenericConfig';

export const SourceContracts = {};

export const defaultConfigDefs: ConfigDefinition[] = [
  ...GenericConfig,
  ...EthBalancerWETHwstETHConfig,
  ...ArbConvexUSDCFRAXConfig,
];

export const defaultGraphEndpoints: Record<string, Record<string, string>> = {
  [ProtocolName.BalancerV2]: {
    [Network.Mainnet]:
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2',
  },
  [ProtocolName.Curve]: {
    [Network.ArbitrumOne]:
      'https://api.thegraph.com/subgraphs/name/messari/curve-finance-arbitrum',
  },
};

export const defaultDataWriters: Record<string, IDataWriter> = {
  [TableName.GenericData]: new GenericDataWriter(),
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
  let transform;
  const func = abi.getFunction(config.method);

  if (!func) {
    throw Error(
      `Invalid method ${config.method} on contract ${config.contractAddress}`
    );
  }

  const outputs = func.outputs;
  if (outputs && outputs.length > 1) {
    if (!config.outputIndices) {
      throw Error(
        `Output indices not defined for method ${config.method} on contract ${config.contractAddress}`
      );
    }

    const indices = config.outputIndices;
    key += `:${getOutputName(outputs, indices)}`;

    transform = (r) => {
      let current = r;
      for (let i = 0; i < indices.length; i++) {
        current = r[indices[i]];
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
  configDefs: ConfigDefinition[]
): DataOperations {
  const aggregateCalls = new Map<Network, MulticallOperation[]>();
  const subgraphCalls = new Map<Network, SubgraphOperation[]>();
  configDefs.forEach((cfg) => {
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
        defaultGraphEndpoints[configData.protocol.toString()][
          cfg.network.toString()
        ];
      if (!endpoint) {
        throw Error(`subgraph ${endpoint} not found`);
      }
      const query = readFileSync(
        join(__dirname, '../queries', configData.query),
        'utf-8'
      );
      operations.push({
        configDef: cfg,
        subgraphQuery: gql(query),
        endpoint: endpoint,
      });
    } else {
      throw Error('Invalid source type');
    }
  });

  return {
    aggregateCalls,
    subgraphCalls,
  };
}
