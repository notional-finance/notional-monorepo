import { MARKET_TYPE } from '@notional-finance/util';
import { BarChartIcon, CoinsIcon } from '@notional-finance/icons';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export const useMarketsMobileNav = (setMarketType, marketType) => {
  const theme = useTheme();

  const options = [
    {
      title: <FormattedMessage defaultMessage={'Earn Yield'} />,
      id: MARKET_TYPE.EARN,
      Icon: (
        <BarChartIcon
          sx={{
            width: theme.spacing(2),
            fill:
              marketType === MARKET_TYPE.EARN
                ? theme.palette.typography.main
                : theme.palette.typography.light,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Borrow'} />,
      id: MARKET_TYPE.BORROW,
      Icon: (
        <CoinsIcon
          sx={{
            width: theme.spacing(2),
            fill: 'transparent',
            stroke:
              marketType === MARKET_TYPE.BORROW
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
