import { BalancerBoostedPoolABI, wstETHABI } from '@notional-finance/contracts';
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
} from './types';
import { GenericDataWriter } from './DataWriter';

export const SourceContracts = {};

export const defaultConfigDefs: ConfigDefinition[] = [
  {
    id: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0:getStETHByWstETH',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
      contractABI: wstETHABI,
      method: 'getStETHByWstETH',
      args: [ethers.utils.parseEther('1')],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    networkOverride: Network.Mainnet,
  },
  {
    id: '0x7c82a23b4c48d796dee36a9ca215b641c6a8709d:getRate',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x7c82a23b4c48d796dee36a9ca215b641c6a8709d',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
  },
];

export const defaultDataWriters: Record<TableName, IDataWriter> = {
  [TableName.GenericData]: new GenericDataWriter(),
};

export function buildOperations(
  configDefs: ConfigDefinition[],
  network: Network
): DataOperations {
  const aggregateCalls = new Map<Network, MulticallOperation[]>();
  configDefs.forEach((cfg) => {
    if (cfg.sourceType === SourceType.Multicall) {
      const configData = cfg.sourceConfig as MulticallConfig;
      const contractNetwork = cfg.networkOverride || network;
      let operations = aggregateCalls.get(contractNetwork);
      if (!operations) {
        operations = [];
        aggregateCalls.set(contractNetwork, operations);
      }
      operations.push({
        configDef: cfg,
        aggregateCall: {
          stage: 0,
          target: new ethers.Contract(
            configData.contractAddress,
            configData.contractABI,
            getProviderFromNetwork(contractNetwork, true)
          ),
          method: configData.method,
          key: cfg.id,
          args: configData.args,
        },
      });
    } else if (cfg.sourceType === SourceType.Subgraph) {
      // TODO: implement this
    } else {
      throw Error('Invalid source type');
    }
  });

  return {
    aggregateCalls,
  };
}
