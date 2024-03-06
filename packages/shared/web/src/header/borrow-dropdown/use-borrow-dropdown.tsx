import { SectionLinkProps } from '@notional-finance/mui';
import { useTheme } from '@mui/material';
import { CoinsIcon, CoinsCircleIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import {
  useHeadlineRates,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
import { usePendingValues } from '../invest-and-earn/use-invest-earn-links';
import { getDefaultNetworkFromHostname } from '@notional-finance/util';

export const useBorrowDropDown = () => {
  const theme = useTheme();
  // In the dropdown menu we ensure that we always resolve to some network
  // destination
  const selectedNetwork =
    useWalletConnectedNetwork() ||
    getDefaultNetworkFromHostname(window.location.hostname);

  const { fCashBorrow, variableBorrow } = useHeadlineRates();

  const links: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Borrow'} />,
      to: `/borrow-fixed/${selectedNetwork}`,
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
      to: `/borrow-variable/${selectedNetwork}`,
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
