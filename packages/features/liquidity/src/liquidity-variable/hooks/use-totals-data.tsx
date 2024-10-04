import {
  FiatKeys,
  FiatSymbols,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { InfoTooltip } from '@notional-finance/mui';
import { SparklesIcon } from '@notional-finance/icons';
import { SxProps, useTheme } from '@mui/material';
import { FormattedMessage, defineMessage } from 'react-intl';
import { useCurrentNetworkStore } from '@notional-finance/notionable';

export const useTotalsData = (
  deposit: TokenDefinition | undefined,
  baseCurrency: FiatKeys,
  nTokenAmount?: TokenBalance
) => {
  const theme = useTheme();
  const currentNetworkStore = useCurrentNetworkStore();
  const nTokenTotalsData = currentNetworkStore.getNTokenTotalsData(
    deposit,
    nTokenAmount,
    false
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
        value: nTokenTotalsData?.tvl?.toFiat(baseCurrency).toFloat() || '-',
        prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
        decimals: 0,
      },
      {
        title: <FormattedMessage defaultMessage={'Incentive APY'} />,
        value: nTokenTotalsData?.totalIncentives
          ? nTokenTotalsData?.totalIncentives
          : 'None',
        Icon: SparklesIcon,
        suffix: nTokenTotalsData?.totalIncentives ? '%' : '',
      },
      {
        title: <FormattedMessage defaultMessage={'Capacity Remaining'} />,
        Icon: ToolTip,
        value: nTokenTotalsData?.capacityRemaining
          ? nTokenTotalsData?.capacityRemaining.toFloat()
          : '-',
        suffix: deposit?.symbol ? ' ' + deposit?.symbol : '',
        decimals: 0,
      },
    ],
    liquidityYieldData: nTokenTotalsData?.liquidityYieldData,
  };
};

export default useTotalsData;
