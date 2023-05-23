import { Registry, TokenDefinition } from '@notional-finance/core-entities';
import { depositAndMintNToken } from '@notional-finance/transaction';
import { Network } from '@notional-finance/util';

export function getAllNTokens(selectedNetwork: Network) {
  // Returns all the available tokens when the network is ready
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

  const nToken = tokens.getNToken(selectedNetwork, underlying.currencyId);

  // TODO: return other selected data here...
  return { nTokenSymbol: nToken.symbol, nToken, underlying };
}

export function getNTokenClaims({
  inputAmount,
  nToken,
  underlying,
}: {
  inputAmount: string;
  nToken: TokenDefinition;
  underlying: TokenDefinition;
}) {
  try {
    const tokens = Registry.getTokenRegistry();
    const exchanges = Registry.getExchangeRegistry();
    const depositBalance = tokens
      .parseInputToTokenBalance(inputAmount, underlying.id, underlying.network)
      .toToken(tokens.getPrimeCash(underlying.network, underlying.currencyId));
    const nTokenPool = exchanges.getPoolInstance(
      nToken.network,
      nToken.address
    );
    const tokensIn = nTokenPool.zeroTokenArray();
    tokensIn[0] = depositBalance;

    // TODO: return lp claims
    const { lpTokens: nTokensMinted } =
      nTokenPool.getLPTokensGivenTokens(tokensIn);

    // TODO: calculate all the transaction properties
    return { canSubmit: true, nTokensMinted };
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
