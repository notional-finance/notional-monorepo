import { SectionLinkProps } from '@notional-finance/mui';
import { useTheme } from '@mui/material';
import { CoinsIcon, CoinsCircleIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const useBorrowDropDown = () => {
  const theme = useTheme();
  const {
    headlineRates: { fCashLend, variableLend },
  } = useAllMarkets();

  const links: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Borrow'} />,
      to: '/borrow-fixed',
      icon: (
        <CoinsIcon
          sx={{
            fontSize: theme.spacing(3),
            fill: 'transparent',
            stroke: theme.palette.common.black,
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage="Borrow with interest as low as {rate} APY"
          values={{
            rate: formatNumberAsPercent(fCashLend?.totalApy || 0),
          }}
        />
      ),
      external: false,
    },
    {
      title: <FormattedMessage defaultMessage={'Variable Rate Borrow'} />,
      to: '/borrow-variable',
      icon: (
        <CoinsCircleIcon
          sx={{
            fontSize: theme.spacing(3),
            fill: theme.palette.common.black,
            stroke: 'transparent',
          }}
        />
      ),
      description: (
        <FormattedMessage
          defaultMessage="Borrow with interest as low as {rate} variable APY"
          values={{
            rate: formatNumberAsPercent(variableLend?.totalApy || 0),
          }}
        />
      ),
      external: false,
    },
  ];

  return links;
};
