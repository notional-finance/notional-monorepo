import { NotionalV3ABI } from '@notional-finance/contracts';
import {
  getNetworkModel,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  FEE_RESERVE,
  Network,
  NotionalAddress,
  padToHex256,
  SETTLEMENT_RESERVE,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BigNumber, ethers } from 'ethers';

type TransferType = 'Mint' | 'Burn' | 'Transfer';
const Markers = ['AccountContextUpdate'];
type SystemAccount =
  | 'None'
  | 'ZeroAddress'
  | 'FeeReserve'
  | 'SettlementReserve'
  | 'Vault'
  | 'nToken'
  | 'PrimeCash'
  | 'PrimeDebt'
  | 'Notional'
  | 'NOTE';
interface Marker {
  logIndex: number;
  name: string;
}

interface Transfer {
  logIndex: number;
  from: string;
  to: string;
  timestamp: number;
  transferType: TransferType;
  fromSystemAccount: SystemAccount;
  toSystemAccount: SystemAccount;
  value: TokenBalance;
  token: TokenDefinition;
  tokenType: string;
  maturity?: number;
}

const NotionalV3Interface = new ethers.utils.Interface(NotionalV3ABI);

function decodeTransferType(from: string, to: string): TransferType {
  if (from == ZERO_ADDRESS) {
    return 'Mint';
  } else if (to == ZERO_ADDRESS) {
    return 'Burn';
  } else {
    return 'Transfer';
  }
}

function decodeSystemAccount(address: string, network: Network): SystemAccount {
  if (address === FEE_RESERVE) {
    return 'FeeReserve';
  } else if (address === SETTLEMENT_RESERVE) {
    return 'SettlementReserve';
  } else if (address === NotionalAddress[network]) {
    return 'Notional';
  }

  try {
    const token = getNetworkModel(network).getTokenByAddress(address);
    if (
      token.vaultAddress !== undefined &&
      token.vaultAddress !== ZERO_ADDRESS
    ) {
      return 'Vault';
    } else if (token.symbol === 'NOTE') {
      return 'NOTE';
    }

    return 'None';
  } catch {
    return 'None';
  }
}

export function parseTransfersFromLogs(
  network: Network,
  timestamp: number,
  logs: ethers.providers.Log[]
) {
  const model = getNetworkModel(network);

  return logs.reduce(
    ({ transfers, markers }, l) => {
      let name: string;
      let args: ethers.utils.Result;
      try {
        ({ name, args } = NotionalV3Interface.parseLog(l));
      } catch (e) {
        // If parsing a single event fails then skip it
        return { transfers, markers };
      }

      if (name === 'Transfer') {
        const from = args['from'] as string;
        const to = args['to'] as string;
        try {
          // NOTE: if this throws an error the transfer will remain unparsed
          const token = model.getTokenByAddress(l.address);

          transfers.push({
            logIndex: l.logIndex,
            from,
            to,
            timestamp,
            transferType: decodeTransferType(from, to),
            fromSystemAccount: decodeSystemAccount(from, network),
            toSystemAccount: decodeSystemAccount(to, network),
            value: TokenBalance.from(args['amount'] as string, token),
            token,
            tokenType: token.tokenType,
            maturity: token.maturity,
          });
        } catch {
          return { transfers, markers };
        }
      } else if (name === 'TransferSingle') {
        const from = args['from'] as string;
        const to = args['to'] as string;
        const token = model.getTokenByID(padToHex256(args['id'] as BigNumber));
        const value = TokenBalance.from(args[4] as BigNumber, token);

        transfers.push({
          logIndex: l.logIndex,
          from,
          to,
          timestamp,
          transferType: decodeTransferType(from, to),
          fromSystemAccount: decodeSystemAccount(from, network),
          toSystemAccount: decodeSystemAccount(to, network),
          value,
          token,
          tokenType: token.tokenType,
          maturity: token.maturity,
        });
      } else if (name === 'TransferBatch') {
        const from = args['from'] as string;
        const to = args['to'] as string;
        const ids = args['ids'] as BigNumber[];
        const values = args[4] as BigNumber[];

        ids.forEach((id, i) => {
          const token = model.getTokenByID(padToHex256(id));

          const value = TokenBalance.from(values[i], token);
          transfers.push({
            logIndex: l.logIndex,
            from,
            to,
            timestamp,
            transferType: decodeTransferType(from, to),
            fromSystemAccount: decodeSystemAccount(from, network),
            toSystemAccount: decodeSystemAccount(to, network),
            value,
            token,
            tokenType: token.tokenType,
            maturity: token.maturity,
          });
        });
      } else if (Markers.includes(name)) {
        markers.push({ name: name, logIndex: l.logIndex });
      }

      return { transfers, markers };
    },
    {
      transfers: [] as Transfer[],
      markers: [] as Marker[],
    }
  );
}
