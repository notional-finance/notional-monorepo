import { BarChartIcon, CoinsIcon } from '@notional-finance/icons';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export const useMarketsMobileNav = (setEarnBorrowOption, earnBorrowOption) => {
  const theme = useTheme();

  const options = [
    {
      title: <FormattedMessage defaultMessage={'Earn Yield'} />,
      id: 0,
      Icon: (
        <BarChartIcon
          sx={{
            width: theme.spacing(2),
            fill:
              earnBorrowOption === 0
                ? theme.palette.typography.main
                : theme.palette.typography.light,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Borrow'} />,
      id: 1,
      Icon: (
        <CoinsIcon
          sx={{
            width: theme.spacing(2),
            fill: 'transparent',
            stroke:
              earnBorrowOption === 1
                ? theme.palette.typography.main
                : theme.palette.typography.light,
          }}
        />
      ),
    },
  ];

  return options;
};

export default useMarketsMobileNav;
