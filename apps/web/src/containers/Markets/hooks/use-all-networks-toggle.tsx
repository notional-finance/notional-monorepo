import { useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { useState } from 'react';
import { Body } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const useAllNetworksToggle = () => {
  const theme = useTheme();
  const [networkToggleOption, setNetworkToggleOption] = useState(0);

  const allMarketsOptions = [
    <Body
      key="all"
      sx={{
        display: 'flex',
        width: theme.spacing(13.75),
        alignContent: 'center',
        justifyContent: 'center',
      }}
    >
      <FormattedMessage defaultMessage={'All Networks'} />
    </Body>,
    <TokenIcon
      key="arbnetwork"
      symbol="arbnetwork"
      size="small"
      style={{
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        width: theme.spacing(3),
      }}
    />,
    <TokenIcon
      key="ethnetwork"
      symbol="ethnetwork"
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
