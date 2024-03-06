import { Box, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

export const useAllNetworksToggle = () => {
  const theme = useTheme();
  const [networkToggleOption, setNetworkToggleOption] = useState(0);

  const allMarketsOptions = [
    <Box
      sx={{
        fontSize: '14px',
        display: 'flex',
        width: '110px',
        alignContent: 'center',
        justifyContent: 'center',
      }}
    >
      <FormattedMessage defaultMessage={'All Networks'} />
    </Box>,
    <TokenIcon
      symbol="arb"
      size="small"
      style={{
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        width: theme.spacing(3),
      }}
    />,
    <TokenIcon
      symbol="eth"
      size="small"
      style={{
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        width: theme.spacing(3),
      }}
    />,
  ];

  // NOTE: the toggleKey is used in the other hooks as earnBorrowOption which is 0 or 1 for Earn or Borrow
  // This is done because the SimpleToggle component uses numbers as keys

  return {
    toggleOptions: allMarketsOptions,
    toggleKey: networkToggleOption,
    setToggleKey: setNetworkToggleOption,
  };
};

export default useAllNetworksToggle;
