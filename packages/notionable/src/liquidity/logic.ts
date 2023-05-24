import { Registry, TokenDefinition } from '@notional-finance/core-entities';
import { depositAndMintNToken } from '@notional-finance/transaction';
import { Network } from '@notional-finance/util';
import { fCashMarket } from '@notional-finance/core-entities';
import { convertRateToFloat } from '@notional-finance/helpers';

export function getAllNTokens(selectedNetwork: Network) {
  // TODO: all tokens should be an observable input
  const allTokens = Registry.getTokenRegistry().getAllTokens(selectedNetwork);
  const availableNTokens = allTokens.filter((t) => t.tokenType === 'nToken');
  const availableDepositTokens = availableNTokens.map((n) => {
    const underlying = allTokens.find(
      (t) => t.currencyId === n.currencyId && t.tokenType === 'Underlying'
    );
    if (!underlying) throw Error('Cannot find underlying for nToken');
    return underlying;
  });

  return {
    isReady: true,
    availableDepositTokens,
    availableNTokens,
    availableTokens: availableDepositTokens.map((t) => t.symbol),
  };
}

export function getSelectedNToken({
  selectedNetwork,
  currency,
}: {
  selectedNetwork: Network;
  currency: string;
}) {
  const tokens = Registry.getTokenRegistry();

  const underlying = tokens.getTokenBySymbol(selectedNetwork, currency);
  if (!underlying.currencyId) return undefined;

  const selectedNToken = tokens.getNToken(
    selectedNetwork,
    underlying.currencyId
  );

  return {
    nTokenSymbol: selectedNToken.symbol,
    selectedNToken,
    underlying,
  };
}

export function getNTokenData(nTokenPool: fCashMarket) {
  const totalValueLocked = nTokenPool?.totalValueLocked(0).toUnderlying();
  const returnDrivers = nTokenPool?.balances.map((b) => {
    const value = b.toUnderlying();
    const apy = 0; // TODO: maybe some way to get currenty apy from a balance obj?
    return { token: b.token, value, apy };
  });

  const poolComposition = nTokenPool?.balances.slice(1).map((t, i) => {
    const totalPrimeCash =
      nTokenPool.poolParams.perMarketCash[i].toUnderlying();
    const totalfCash = nTokenPool.poolParams.perMarketfCash[i];
    const utilization = convertRateToFloat(
      nTokenPool.getfCashUtilization(
        totalfCash.copy(0),
        totalfCash,
        totalPrimeCash
      )
    );

    return {
      token: t.token,
      totalPrimeCash,
      totalfCash,
      utilization,
    };
  });

  // TODO: historical tvl, apy, ntoken price
  // TODO: token yields

  return {
    totalValueLocked,
    returnDrivers,
    poolComposition,
  };
}

export function getNTokenClaims({
  inputAmount,
  underlying,
  nTokenPool,
}: {
  inputAmount: string;
  underlying: TokenDefinition;
  nTokenPool: fCashMarket;
}) {
  try {
    const tokens = Registry.getTokenRegistry();
    const depositBalance = tokens
      .parseInputToTokenBalance(inputAmount, underlying.id, underlying.network)
      .toToken(tokens.getPrimeCash(underlying.network, underlying.currencyId));

    const tokensIn = nTokenPool.zeroTokenArray();
    tokensIn[0] = depositBalance;

    const { lpTokens: nTokensMinted, lpClaims: nTokenClaims } =
      nTokenPool.getLPTokensGivenTokens(tokensIn);

    return { canSubmit: true, nTokensMinted, nTokenClaims };
  } catch (e) {
    console.log('error', e);
    return { hasError: true, canSubmit: false };
  }
}

export function getMintNTokenTxn({
  account,
  inputAmount,
  underlying,
}: {
  account: string;
  inputAmount: string;
  underlying: TokenDefinition;
}) {
  const tokens = Registry.getTokenRegistry();
  const depositBalance = tokens.parseInputToTokenBalance(
    inputAmount,
    underlying.id,
    underlying.network
  );

  return {
    buildTransactionCall: {
      transactionFn: depositAndMintNToken,
      transactionArgs: [account, depositBalance],
    },
    canSubmit: true,
  };
}
