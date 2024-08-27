import { SectionLinkProps } from '@notional-finance/mui';
import { useTheme } from '@mui/material';
import { CoinsIcon, CoinsCircleIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

export const useBorrowDropDown = () => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();

  const links: SectionLinkProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Borrow'} />,
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
      pillText: <FormattedMessage defaultMessage={'Variable Interest'} />,
      external: false,
    },
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
      pillText: <FormattedMessage defaultMessage={'Guaranteed Interest'} />,
      external: false,
    },
  ];

  return links;
};
