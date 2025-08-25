import {
  getNowSeconds,
  getProviderFromNetwork,
  getProviderURLFromNetwork,
  Network,
  NetworkId,
  padToHex256,
  stripHexLeadingZero,
} from '@notional-finance/util';
import { Contract, ethers, PopulatedTransaction } from 'ethers';
import { parseTransfersFromLogs } from './parser/transfers';
import { TokenBalance } from '@notional-finance/core-entities';

// Types taken from: https://github.com/alchemyplatform/alchemy-sdk-js/blob/main/src/types/types.ts#L2051

interface SimulateExecutionResponse {
  /**
   * An array of traces generated during simulation that represent the execution
   * of the transaction along with the decoded calls if available.
   */
  calls: SimulationCallTrace[];

  /**
   * An array of logs emitted during simulation along with the decoded logs if
   * available.
   */
  logs: SimulationDebugLog[];
}

/**
 * Debug log in a {@link SimulateExecutionResponse}.
 */
interface SimulationDebugLog {
  /** An array of topics in the log. */
  topics: string[];
  /** The address of the contract that generated the log. */
  address: string;
  /** The data included the log. */
  data: string;
  /** A decoded version of the log. Provided on a best-effort basis. */
  decoded?: DecodedLog;
}

/**
 * Decoded representation of the call trace that is part of a
 * {@link SimulationCallTrace}.
 */
interface DecodedDebugCallTrace {
  /** The smart contract method called. */
  methodName: string;
  /** Method inputs. */
  inputs: DecodedCallParam[];
  /** Method outputs. */
  outputs: DecodedCallParam[];
}

/** The type of call in a debug call trace. */
enum DebugCallType {
  CREATE = 'CREATE',
  CALL = 'CALL',
  STATICCALL = 'STATICCALL',
  DELEGATECALL = 'DELEGATECALL',
}

/**
 * Debug call trace in a {@link SimulateExecutionResponse}.
 */
export interface SimulationCallTrace
  extends Omit<DebugCallTrace, 'revertReason' | 'calls'> {
  /** The type of call. */
  type: DebugCallType;
  /** A decoded version of the call. Provided on a best-effort basis. */
  decoded?: DecodedDebugCallTrace;
}

/**
 * Debug result returned when using a {@link DebugCallTracer}.
 */
interface DebugCallTrace {
  /** The type of call: `CALL` or `CREATE` for the top-level call. */
  type: string;
  /** From address of the transaction. */
  from: string;
  /** To address of the transaction. */
  to: string;
  /** Amount of value transfer as a hex string. */
  value: string;
  /** Gas provided for call as a hex string. */
  gas: string;
  /** Gas used during the call as a hex string. */
  gasUsed: string;
  /** Call data. */
  input: string;
  /** Return data. */
  output: string;
  /** Optional error field. */
  error?: string;
  /** Solidity revert reason, if the call reverted. */
  revertReason?: string;
  /** Array of sub-calls executed as part of the original call. */
  calls?: DebugCallTrace[];
}

/**
 * Decoded representation of the debug log that is part of a
 * {@link SimulationDebugLog}.
 */
interface DecodedLog {
  /** The decoded name of the log event. */
  eventName: string;
  /** The decoded inputs to the log. */
  inputs: DecodedLogInput[];
}

/** The input or output parameters from a {@link DecodedDebugCallTrace}. */
interface DecodedCallParam {
  /** Value of the parameter. */
  value: string;
  /** The name of the parameter. */
  name: string;
  /** The type of the parameter.*/
  type: string;
}

/** The input parameters from a {@link DecodedLog}. */
interface DecodedLogInput extends DecodedCallParam {
  /** Whether the log is marked as indexed in the smart contract. */
  indexed: boolean;
}

export async function simulatePopulatedTxn(
  network: Network,
  populateTxn: PopulatedTransaction
) {
  const provider = new ethers.providers.JsonRpcProvider({
    url: getProviderURLFromNetwork(network),
    skipFetchSetup: true,
  });

  const { calls, logs: _logs } = (await provider.send(
    'alchemy_simulateExecution',
    [
      {
        from: populateTxn.from,
        to: populateTxn.to,
        value:
          populateTxn.value && !populateTxn.value.isZero()
            ? stripHexLeadingZero(populateTxn.value)
            : '0x0',
        data: populateTxn.data,
      },
    ]
  )) as SimulateExecutionResponse;

  const logs: ethers.providers.Log[] = _logs.map((s, i) => ({
    address: s.address,
    data: s.data,
    topics: s.topics.map((t) => padToHex256(t)),
    logIndex: i,
    // Values below here are unknown
    blockNumber: 0,
    blockHash: '',
    transactionIndex: 0,
    transactionHash: '',
    removed: false,
  }));

  const simulatedLogs = parseTransfersFromLogs(network, getNowSeconds(), logs);

  return { simulatedCalls: calls, simulatedLogs, rawLogs: logs };
}

export async function simulateRewardClaims(
  network: Network,
  account: string,
  vaultAddress: string,
  lendingRouter: string
) {
  const VaultRewarderInterface = new ethers.utils.Interface([
    'event VaultRewardTransfer(address rewardToken, address account, uint256 amount)',
    'function claimRewards(address account, address vault) external',
  ]);
  const contract = new Contract(
    lendingRouter,
    VaultRewarderInterface,
    getProviderFromNetwork(network)
  );
  const populatedTx = await contract.populateTransaction.claimRewards(
    account,
    vaultAddress,
    { from: account }
  );
  const { rawLogs } = await simulatePopulatedTxn(network, populatedTx);

  return rawLogs
    .map((l) => {
      try {
        const { name, args } = VaultRewarderInterface.parseLog(l);
        if (name === 'VaultRewardTransfer') {
          return new TokenBalance(args['amount'], args['rewardToken'], network);
        }
      } catch (e) {
        // No-op
      }
      return null;
    })
    .filter((t) => !!t);
}

export async function simulateOnTenderly(
  network: Network,
  populateTxn: PopulatedTransaction,
  tenderlyAPIKey: string,
  tenderlyAccount: string,
  tenderlyProjectId: string
) {
  const response = await fetch(
    `https://api.tenderly.co/api/v1/account/${tenderlyAccount}/project/${tenderlyProjectId}/simulate`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Access-Key': tenderlyAPIKey,
      },
      body: JSON.stringify({
        network_id: NetworkId[network].toString(),
        from: populateTxn.from,
        to: populateTxn.to,
        input: populateTxn.data,
        gas: populateTxn.gasLimit,
        value: populateTxn.value?.toString() || '0',
        save: true,
        save_if_fails: true,
        simulation_type: 'full',
      }),
    }
  );

  const body = await response.json();
  return body as { simulation: { id: string } };
}
