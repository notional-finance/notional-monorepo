import { TradeState } from '@notional-finance/notionable';
import { FiatSymbols } from '@notional-finance/core-entities';
import { InfoTooltip } from '@notional-finance/mui';
import { FormattedMessage, defineMessage } from 'react-intl';
import {
  useTokenHistory,
  usePrimeCash,
  usePrimeDebt,
  useMaxSupply,
  useAppState,
} from '@notional-finance/notionable-hooks';
import { SxProps, useTheme } from '@mui/material';

const getSevenDayAvgApy = (
  apyData: ReturnType<typeof useTokenHistory>['apyData']
) => {
  const seventhToLastNum = apyData.length - 8;
  const lastSevenApys = apyData
    .slice(seventhToLastNum, -1)
    .map(({ totalAPY }) => totalAPY);

  const averageApy = lastSevenApys.length
    ? lastSevenApys.reduce((a, b) => a + b) / lastSevenApys.length
    : 0;

  return averageApy;
};

export const useVariableTotals = (state: TradeState) => {
  const theme = useTheme();
  const { deposit } = state;
  const isBorrow = state.tradeType === 'BorrowVariable';
  const { baseCurrency } = useAppState();
  const maxSupplyData = useMaxSupply(deposit?.network, deposit?.currencyId);
  const { apyData } = useTokenHistory(state.debt);

  const primeCash = usePrimeCash(deposit?.network, deposit?.currencyId);
  const primeDebt = usePrimeDebt(deposit?.network, deposit?.currencyId);

  const ToolTip = ({ sx }: { title?: string; sx: SxProps }) => {
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

  return [
    {
      title: <FormattedMessage defaultMessage={'Total Lent'} />,
      value: primeCash?.totalSupply?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
      decimals: 0,
    },
    {
      title: <FormattedMessage defaultMessage={'Total Borrowed'} />,
      value: primeDebt?.totalSupply?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
      decimals: 0,
    },
    {
      title: isBorrow ? (
        <FormattedMessage defaultMessage={'(7d) Average APY'} />
      ) : (
        <FormattedMessage defaultMessage={'Capacity Remaining'} />
      ),
      Icon: ToolTip,
      value: isBorrow
        ? getSevenDayAvgApy(apyData)
        : maxSupplyData?.capacityRemaining
        ? maxSupplyData?.capacityRemaining.toFloat()
        : '-',
      suffix: isBorrow ? '%' : deposit?.symbol ? ' ' + deposit?.symbol : '',
      decimals: 2,
    },
  ];
};

export default useVariableTotals;
