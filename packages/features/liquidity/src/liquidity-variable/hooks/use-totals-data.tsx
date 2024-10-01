import {
  FiatKeys,
  FiatSymbols,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { InfoTooltip } from '@notional-finance/mui';
import { SparklesIcon } from '@notional-finance/icons';
import { useMaxSupply } from '@notional-finance/notionable-hooks';
import { SxProps, useTheme } from '@mui/material';
import { FormattedMessage, defineMessage } from 'react-intl';
import { useCurrentNetworkStore } from '@notional-finance/notionable';

export const useTotalsData = (
  deposit: TokenDefinition | undefined,
  baseCurrency: FiatKeys,
  nTokenAmount?: TokenBalance
) => {
  const theme = useTheme();
  const maxSupplyData = useMaxSupply(deposit?.network, deposit?.currencyId);
  const currentNetworkStore = useCurrentNetworkStore();
  const liquidity = currentNetworkStore.getAllNTokenYields();
  const allLiquidityYieldData = liquidity.find(
    (data) => data?.underlying?.id === deposit?.id
  );
  const liquidityYieldData = nTokenAmount
    ? currentNetworkStore.getSimulatedAPY(nTokenAmount)
    : allLiquidityYieldData?.apy;

  const totalIncentives = liquidityYieldData?.incentives?.reduce(
    (acc, curr) => acc + curr.incentiveAPY,
    0
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
          allLiquidityYieldData?.tvl?.toFiat(baseCurrency).toFloat() || '-',
        prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
        decimals: 0,
      },
      {
        title: <FormattedMessage defaultMessage={'Incentive APY'} />,
        value: totalIncentives ? totalIncentives : 'None',
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
