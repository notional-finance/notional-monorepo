import { FiatSymbols } from '@notional-finance/core-entities';
import {
  useAppStore,
  useCurrentNetworkStore,
  useCurrentTradeContext,
} from '@notional-finance/notionable-hooks';
import { SparklesIcon } from '@notional-finance/icons';
import { FormattedMessage, defineMessage } from 'react-intl';
import { InfoTooltip } from '@notional-finance/mui';
import { SxProps, useTheme } from '@mui/material';

export const useTotalsData = () => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const trade = useCurrentTradeContext();
  const deposit = trade?.selectedTokens?.deposit;
  const currentNetworkStore = useCurrentNetworkStore();
  const totalsData = currentNetworkStore.getNTokenTotalsData(deposit);

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
        value: totalsData?.tvl?.toFiat(baseCurrency).toFloat() || '-',
        prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
        decimals: 0,
      },
      {
        title: <FormattedMessage defaultMessage={'Total Incentive APY'} />,
        value:
          totalsData?.totalIncentives && totalsData?.totalIncentives > 0
            ? totalsData?.totalIncentives
            : '-',
        Icon: SparklesIcon,
        suffix: totalsData?.totalIncentives ? '%' : '',
      },
      {
        title: <FormattedMessage defaultMessage={'Capacity Remaining'} />,
        Icon: ToolTip,
        value: totalsData?.capacityRemaining
          ? totalsData?.capacityRemaining.toFloat()
          : '-',
        suffix: deposit?.symbol ? ' ' + deposit?.symbol : '',
        decimals: 0,
      },
    ],
  };
};

export default useTotalsData;
