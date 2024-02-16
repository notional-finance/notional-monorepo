import { TradeState } from '@notional-finance/notionable';
import { FiatSymbols } from '@notional-finance/core-entities';
import { InfoTooltip } from '@notional-finance/mui';
import { FormattedMessage, defineMessage } from 'react-intl';
import {
  useFiat,
  useTokenHistory,
  usePrimeCash,
  usePrimeDebt,
  useMaxSupply,
} from '@notional-finance/notionable-hooks';
import { SxProps, useTheme } from '@mui/material';

export const useVariableTotals = (state: TradeState) => {
  const theme = useTheme();
  const { deposit } = state;
  const isBorrow = state.tradeType === 'BorrowVariable';
  const baseCurrency = useFiat();
  const maxSupplyData = useMaxSupply(deposit?.network, deposit?.currencyId);
  const { apyData } = useTokenHistory(state.debt);

  const primeCash = usePrimeCash(deposit?.network, deposit?.currencyId);
  const primeDebt = usePrimeDebt(deposit?.network, deposit?.currencyId);

  const getSevenDayAvgApy = () => {
    const seventhToLastNum = apyData.length - 8;
    const lastSevenApys = apyData
      .slice(seventhToLastNum, -1)
      .map(({ area }) => area);

    const averageApy = lastSevenApys.length
      ? lastSevenApys.reduce((a, b) => a + b) / lastSevenApys.length
      : 0;

    return averageApy;
  };

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

  return [
    {
      title: <FormattedMessage defaultMessage={'Total Lent'} />,
      value: primeCash?.totalSupply?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
    },
    {
      title: <FormattedMessage defaultMessage={'Total Borrowed'} />,
      value: primeDebt?.totalSupply?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
    },
    {
      title: isBorrow ? (
        <FormattedMessage defaultMessage={'(7d) Average APY'} />
      ) : (
        <FormattedMessage defaultMessage={'Capacity Remaining'} />
      ),
      Icon: ToolTip,
      value: isBorrow
        ? getSevenDayAvgApy()
        : maxSupplyData?.capacityRemaining
        ? maxSupplyData?.capacityRemaining.toFloat()
        : '-',
      suffix: isBorrow ? '%' : deposit?.symbol ? ' ' + deposit?.symbol : '',
    },
  ];
};

export default useVariableTotals;
