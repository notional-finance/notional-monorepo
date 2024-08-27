import { YieldData, FiatSymbols } from '@notional-finance/core-entities';
import { TradeState } from '@notional-finance/notionable';
import { SparklesIcon } from '@notional-finance/icons';
import { useMaxSupply, useAppStore } from '@notional-finance/notionable-hooks';
import { FormattedMessage, defineMessage } from 'react-intl';
import { InfoTooltip } from '@notional-finance/mui';
import { SxProps, useTheme } from '@mui/material';

export const useTotalsData = (
  state: TradeState,
  liquidityYieldData: YieldData | undefined
) => {
  const theme = useTheme();
  const { deposit } = state;
  const { baseCurrency } = useAppStore();
  const maxSupplyData = useMaxSupply(deposit?.network, deposit?.currencyId);
  let totalIncentives = 0;

  if (
    liquidityYieldData &&
    liquidityYieldData?.noteIncentives &&
    liquidityYieldData?.secondaryIncentives
  ) {
    totalIncentives =
      liquidityYieldData?.noteIncentives?.incentiveAPY +
      liquidityYieldData?.secondaryIncentives?.incentiveAPY;
  } else if (liquidityYieldData && liquidityYieldData?.noteIncentives) {
    totalIncentives = liquidityYieldData?.noteIncentives?.incentiveAPY;
  }

  const ToolTip = ({ sx }: { sx: SxProps }) => {
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
        title: <FormattedMessage defaultMessage={'Market Liquidity'} />,
        value: liquidityYieldData?.tvl?.toFiat(baseCurrency).toFloat() || '-',
        prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
        decimals: 0,
      },
      {
        title: <FormattedMessage defaultMessage={'Total Incentive APY'} />,
        value: totalIncentives > 0 ? totalIncentives : '-',
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
        decimals: 0,
      },
    ],
    liquidityYieldData,
  };
};

export default useTotalsData;
