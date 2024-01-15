import {
  FiatSymbols,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { SparklesIcon } from '@notional-finance/icons';
import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { leveragedYield } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';

export const useTotalsData = (
  tokenSymbol: string,
  nTokenAmount?: TokenBalance,
  debtAPY?: number,
  leverageRatio?: number
) => {
  const { yields } = useAllMarkets();
  const baseCurrency = useFiat();

  let liquidityYieldData = nTokenAmount
    ? Registry.getYieldRegistry().getSimulatedNTokenYield(nTokenAmount)
    : yields.liquidity.find(
        ({ underlying }) => underlying.symbol === tokenSymbol
      );

  if (leverageRatio) {
    // Need to do a copy here otherwise we end up updating the parent
    // object and get weird memory reference issues.
    liquidityYieldData = Object.assign({}, liquidityYieldData);

    if (debtAPY) {
      // If using leverage apply the debt APY to the interest apy
      liquidityYieldData.interestAPY = leveragedYield(
        liquidityYieldData?.interestAPY || 0,
        debtAPY,
        leverageRatio
      );
    }

    // If using leverage apply the leverage ratio to the incentive APY directly
    if (liquidityYieldData?.noteIncentives) {
      liquidityYieldData.noteIncentives = {
        symbol: 'NOTE',
        incentiveAPY:
          leveragedYield(
            liquidityYieldData.noteIncentives.incentiveAPY,
            0,
            leverageRatio
          ) || liquidityYieldData.noteIncentives.incentiveAPY,
      };
    }

    if (liquidityYieldData?.secondaryIncentives) {
      liquidityYieldData.secondaryIncentives = {
        symbol: liquidityYieldData.secondaryIncentives.symbol,
        incentiveAPY:
          leveragedYield(
            liquidityYieldData.secondaryIncentives.incentiveAPY,
            0,
            leverageRatio
          ) || liquidityYieldData.secondaryIncentives.incentiveAPY,
      };
    }
  }

  const totalIncentives =
    (liquidityYieldData?.noteIncentives?.incentiveAPY || 0) +
    (liquidityYieldData?.secondaryIncentives?.incentiveAPY || 0);

  return {
    totalsData: [
      {
        title: <FormattedMessage defaultMessage={'TVL'} />,
        value: liquidityYieldData?.tvl?.toFiat(baseCurrency).toFloat() || '-',
        prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
      },
      {
        title: <FormattedMessage defaultMessage={'Incentive APY'} />,
        value: totalIncentives ? totalIncentives : '-',
        Icon: SparklesIcon,
        suffix: totalIncentives ? '%' : '',
      },
      {
        title: <FormattedMessage defaultMessage={'Liquidity Providers'} />,
        value: '-',
      },
    ],
    liquidityYieldData,
  };
};

export default useTotalsData;
