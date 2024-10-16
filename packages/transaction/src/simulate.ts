import {
  getNowSeconds,
  getProviderFromNetwork,
  getProviderURLFromNetwork,
  Network,
  padToHex256,
  stripHexLeadingZero,
} from '@notional-finance/util';
import { Contract, ethers, PopulatedTransaction } from 'ethers';
import { parseTransfersFromLogs } from './parser/transfers';
import {
  AccountDefinition,
  TokenBalance,
} from '@notional-finance/core-entities';
import { AccountRiskProfile } from '@notional-finance/risk-engine';
import {
  ISingleSidedLPStrategyVaultABI,
  ISingleSidedLPStrategyVault,
} from '@notional-finance/contracts';

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

export async function applySimulationToAccount(
  network: Network,
  populateTxn: PopulatedTransaction,
  priorAccount: AccountDefinition
) {
  const {
    simulatedLogs: { transfers },
  } = await simulatePopulatedTxn(network, populateTxn);
  const balancesAfter = [...priorAccount.balances];

  const accountTransfers = transfers.filter(
    (t) =>
      t.from.toLowerCase() === priorAccount.address.toLowerCase() ||
      t.to.toLowerCase() === priorAccount.address.toLowerCase()
  );

  accountTransfers.forEach((t) => {
    // NOTE: need to flip the sign on debt values since all transfer signs are positive
    const value =
      t.value.tokenType === 'PrimeDebt' ||
      t.token.isFCashDebt ||
      t.value.tokenType === 'VaultDebt'
        ? t.value.neg()
        : t.value;
    const netValue =
      t.from.toLowerCase() === priorAccount.address.toLowerCase()
        ? value.neg()
        : value;

    const i = balancesAfter.findIndex((b) => b.tokenId === t.value.tokenId);
    if (i < 0) {
      balancesAfter.push(netValue);
    } else {
      balancesAfter[i] = balancesAfter[i].add(netValue);
    }
  });

  return {
    balancesAfter: AccountRiskProfile.merge(balancesAfter),
    accountTransfers,
  };
}

export async function simulateRewardClaims(
  network: Network,
  account: string,
  vaultAddress: string
) {
  const VaultRewarderInterface = new ethers.utils.Interface([
    'event VaultRewardTransfer(address rewardToken, address account, uint256 amount)',
  ]);
  const contract = new Contract(
    vaultAddress,
    ISingleSidedLPStrategyVaultABI,
    getProviderFromNetwork(network)
  ) as ISingleSidedLPStrategyVault;
  const populatedTx = await contract.populateTransaction.claimAccountRewards(
    account,
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
