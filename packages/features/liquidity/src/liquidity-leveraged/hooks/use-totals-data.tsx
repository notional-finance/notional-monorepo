import {
  FiatSymbols,
  FiatKeys,
  TokenBalance,
} from '@notional-finance/core-entities';
import {
  TradeState,
  useCurrentNetworkStore,
} from '@notional-finance/notionable';
import { SparklesIcon } from '@notional-finance/icons';
import { FormattedMessage, defineMessage } from 'react-intl';
import { InfoTooltip } from '@notional-finance/mui';
import { SxProps, useTheme } from '@mui/material';

export const useTotalsData = (
  state: TradeState,
  baseCurrency: FiatKeys,
  nTokenAmount?: TokenBalance
) => {
  const theme = useTheme();
  const { deposit } = state;
  const currentNetworkStore = useCurrentNetworkStore();
  const leveragedNTokenTotalsData = currentNetworkStore.getNTokenTotalsData(
    deposit,
    nTokenAmount,
    true
  );

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
        value:
          leveragedNTokenTotalsData?.tvl?.toFiat(baseCurrency).toFloat() || '-',
        prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
        decimals: 0,
      },
      {
        title: <FormattedMessage defaultMessage={'Total Incentive APY'} />,
        value:
          leveragedNTokenTotalsData?.totalIncentives &&
          leveragedNTokenTotalsData?.totalIncentives > 0
            ? leveragedNTokenTotalsData?.totalIncentives
            : '-',
        Icon: SparklesIcon,
        suffix: leveragedNTokenTotalsData?.totalIncentives ? '%' : '',
      },
      {
        title: <FormattedMessage defaultMessage={'Capacity Remaining'} />,
        Icon: ToolTip,
        value: leveragedNTokenTotalsData?.capacityRemaining
          ? leveragedNTokenTotalsData?.capacityRemaining.toFloat()
          : '-',
        suffix: deposit?.symbol ? ' ' + deposit?.symbol : '',
        decimals: 0,
      },
    ],
    liquidityYieldData: leveragedNTokenTotalsData?.liquidityYieldData,
  };
};

export default useTotalsData;
