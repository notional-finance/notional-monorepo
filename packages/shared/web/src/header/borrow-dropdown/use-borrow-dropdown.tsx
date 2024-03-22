import { SectionLinkProps } from '@notional-finance/mui';
import { useTheme } from '@mui/material';
import { CoinsIcon, CoinsCircleIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { usePendingValues } from '../invest-and-earn/use-invest-earn-links';
import { Network } from '@notional-finance/util';

export const useBorrowDropDown = () => {
  const theme = useTheme();

  const {
    headlineRates: { fCashBorrow, variableBorrow },
  } = useAllMarkets(Network.arbitrum);

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
            rate: usePendingValues(fCashBorrow?.totalAPY),
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
            rate: usePendingValues(variableBorrow?.totalAPY),
          }}
        />
      ),
      external: false,
    },
  ];

  return links;
};
