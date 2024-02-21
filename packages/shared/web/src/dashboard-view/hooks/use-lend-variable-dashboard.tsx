import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { Network } from '@notional-finance/util';

export const useLendVariableDashboard = (network: Network) => {
  const {
    yields: { liquidity },
  } = useAllMarkets(network);

  console.log({ liquidity });

  //   const allData = liquidity
  //     .filter((y) => y.leveraged?.debtToken.tokenType === 'PrimeDebt')
  //     .map((y) => {
  //       console.log({ y });
  //       return {
  //         ...y,
  //         symbol: y.underlying.symbol,
  //         title: y.underlying.symbol,
  //         subTitle: `TVL: ${y.tvl ? formatNumberAsAbbr(y.tvl.toFloat(), 0) : 0}`,
  //         hasPosition: depositTokensWithPositions.includes(y.underlying.symbol),
  //         bottomValue: ``,
  //         incentiveValue: '12.00%',
  //         incentiveSymbol: 'ARB',
  //         apy:
  //           allMaxAPYs.find((m) => m.token.currencyId === y.token.currencyId)
  //             ?.totalAPY || 0,
  //         routeCallback: () =>
  //           history.push(
  //             depositTokensWithPositions.includes(y.underlying.symbol)
  //               ? `/liquidity-leveraged/${network}/IncreaseLeveragedNToken/${y.underlying.symbol}`
  //               : `/liquidity-leveraged/${network}/CreateLeveragedNToken/${y.underlying.symbol}`
  //           ),
  //       };
  //     })
  //     .sort((a, b) => b.apy - a.apy);
};
