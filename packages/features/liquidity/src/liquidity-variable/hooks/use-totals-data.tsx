import {
  FiatSymbols,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { InfoTooltip } from '@notional-finance/mui';
import { SparklesIcon } from '@notional-finance/icons';
import {
  useAllMarkets,
  useFiat,
  useMaxSupply,
} from '@notional-finance/notionable-hooks';
import { SxProps, useTheme } from '@mui/material';
import { FormattedMessage, defineMessage } from 'react-intl';

export const useTotalsData = (
  deposit: TokenDefinition | undefined,
  nToken: TokenDefinition | undefined,
  nTokenAmount?: TokenBalance
) => {
  const theme = useTheme();
  const { yields } = useAllMarkets(deposit?.network);
  const baseCurrency = useFiat();
  const maxSupplyData = useMaxSupply(deposit?.network, deposit?.currencyId);
  const liquidityYieldData = nTokenAmount
    ? Registry.getYieldRegistry().getSimulatedNTokenYield(nTokenAmount)
    : yields.liquidity.find(({ underlying }) => underlying.id === deposit?.id);

  const totalIncentives =
    (liquidityYieldData?.noteIncentives?.incentiveAPY || 0) +
    (liquidityYieldData?.secondaryIncentives?.incentiveAPY || 0);

  interface ToolTipProps {
    sx: SxProps;
  }

  const ToolTip = ({ sx }: ToolTipProps) => {
    return (
      <InfoTooltip
        sx={{ ...sx }}
        iconSize={theme.spacing(2)}
        iconColor={theme.palette.typography.accent}
        toolTipText={defineMessage({
          defaultMessage:
            'The additional amount that can be deposited before hitting the supply cap.',
        })}
      />
    );
  };

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
        title: <FormattedMessage defaultMessage={'Capacity Remaining'} />,
        Icon: ToolTip,
        value: maxSupplyData?.capacityRemaining
          ? maxSupplyData?.capacityRemaining.toFloat()
          : '-',
        suffix: deposit?.symbol ? ' ' + deposit?.symbol : '',
      },
    ],
    liquidityYieldData,
  };
};

export default useTotalsData;
