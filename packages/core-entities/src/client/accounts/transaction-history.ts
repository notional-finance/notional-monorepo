import { Network, RATE_PRECISION, ZERO_ADDRESS } from '@notional-finance/util';
import { Registry } from '../../Registry';
import { TokenBalance } from '../../token-balance';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ProfitLossLineItem } from '../../.graphclient';

export function parseTransactionHistory(
  p: ProfitLossLineItem,
  network: Network
) {
  const tokenId = p.token.id;
  const underlyingId = p.underlyingToken.id;
  const token = Registry.getTokenRegistry().getTokenByID(network, tokenId);
  const vaultName =
    !!token.vaultAddress && token.vaultAddress !== ZERO_ADDRESS
      ? Registry.getConfigurationRegistry().getVaultName(
          token.network,
          token.vaultAddress
        )
      : undefined;

  let tokenAmount = TokenBalance.fromID(p.tokenAmount, tokenId, network);
  let underlyingAmountRealized = TokenBalance.fromID(
    p.underlyingAmountRealized,
    underlyingId,
    network
  );
  let underlyingAmountSpot = TokenBalance.fromID(
    p.underlyingAmountSpot,
    underlyingId,
    network
  );

  if (tokenAmount.tokenType === 'PrimeDebt') {
    tokenAmount = tokenAmount.neg();
    underlyingAmountRealized = underlyingAmountRealized.neg();
    underlyingAmountSpot = underlyingAmountSpot.neg();
  } else if (tokenAmount.tokenType === 'fCash' && token.isFCashDebt) {
    underlyingAmountRealized = underlyingAmountRealized.neg();
    underlyingAmountSpot = underlyingAmountSpot.neg();
  }

  return {
    timestamp: p.timestamp,
    blockNumber: p.blockNumber,
    token,
    vaultName,
    underlying: Registry.getTokenRegistry().getTokenByID(network, underlyingId),
    bundleName: p.bundle?.bundleName,
    transactionHash: p.transactionHash.id,
    tokenAmount,
    underlyingAmountRealized,
    underlyingAmountSpot,
    realizedPrice: TokenBalance.fromID(p.realizedPrice, underlyingId, network),
    spotPrice: TokenBalance.fromID(p.spotPrice, underlyingId, network),
    impliedFixedRate: p.impliedFixedRate
      ? (p.impliedFixedRate * 100) / RATE_PRECISION
      : undefined,
    isTransientLineItem: p.isTransientLineItem,
  };
}
