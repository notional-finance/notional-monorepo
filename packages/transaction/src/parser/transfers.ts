import { NotionalV3ABI } from '@notional-finance/contracts';
import { getNetworkModel, TokenBalance } from '@notional-finance/core-entities';
import {
  FEE_RESERVE,
  Network,
  NotionalAddress,
  padToHex256,
  SETTLEMENT_RESERVE,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BigNumber, ethers } from 'ethers';
import { Bundle, Marker, Transfer } from '.';
import { SystemAccount, TransferType } from '../.graphclient';
import { BundleCriteria } from './bundle';
import { parseTransactionType, Markers } from './transaction';

const NotionalV3Interface = new ethers.utils.Interface(NotionalV3ABI);

export function parseTransactionLogs(
  network: Network,
  timestamp: number,
  logs: ethers.providers.Log[]
) {
  const { transfers, markers } = parseTransfersFromLogs(
    network,
    timestamp,
    logs
  );
  const bundles = parseBundles(transfers);
  const transaction = parseTransactionType(bundles, markers);

  return { transfers, bundles, transaction };
}

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
      token.tokenType === 'PrimeCash' ||
      token.tokenType === 'PrimeDebt' ||
      token.tokenType === 'nToken'
    ) {
      return token.tokenType;
    } else if (
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
          value: token.isFCashDebt ? value.neg() : value,
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

function parseBundles(transfers: Transfer[]) {
  const bundles: Bundle[] = [];

  // Scan unbundled transfers
  let nextStartIndex = 0;
  transfers.forEach((_, i) => {
    nextStartIndex = scanTransferBundle(
      nextStartIndex,
      transfers.slice(0, i + 1),
      bundles
    );
  });

  return bundles;
}

function scanTransferBundle(
  startIndex: number,
  transferArray: Transfer[],
  bundleArray: Bundle[]
) {
  for (const criteria of BundleCriteria) {
    // Go to the next criteria if the window size does not match
    if (transferArray.length - startIndex < criteria.windowSize) continue;

    let lookBehind = criteria.lookBehind;
    // Check if the lookbehind is satisfied
    if (startIndex < lookBehind) {
      if (criteria.canStart && startIndex == 0) {
        // If the criteria can start, then set the look behind to zero
        lookBehind = 0;
      } else {
        // Have not satisfied the lookbehind, go to the next criteria
        continue;
      }
    }

    const window = transferArray.slice(
      startIndex - lookBehind,
      startIndex + criteria.windowSize
    );

    if (criteria.func(window)) {
      const windowStartIndex = criteria.rewrite ? 0 : lookBehind;
      const windowEndIndex = lookBehind + criteria.bundleSize - 1;
      const startLogIndex = window[windowStartIndex].logIndex;
      const endLogIndex = window[windowEndIndex].logIndex;

      const bundle: Bundle = {
        bundleName: criteria.bundleName,
        startLogIndex,
        endLogIndex,
        transfers: [],
      };

      for (let i = windowStartIndex; i <= windowEndIndex; i++) {
        // Update the bundle id on all the transfers
        bundle.transfers.push(window[i]);
      }

      if (criteria.rewrite) bundleArray.pop();
      bundleArray.push(bundle);

      // Marks the next start index in the transaction level transfer array
      return startIndex + criteria.bundleSize;
    }
  }

  return startIndex;
}
