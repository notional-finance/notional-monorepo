import { useTheme } from '@mui/material';
import arbNetworkIcon from '@notional-finance/mui/src/assets/icons/arb-network-selector.svg';
import ethNetworkIcon from '@notional-finance/mui/src/assets/icons/eth-network-selector.svg';
import { useState } from 'react';
import { Body } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const useAllNetworksToggle = () => {
  const theme = useTheme();
  const [networkToggleOption, setNetworkToggleOption] = useState(0);

  const allMarketsOptions = [
    <Body
      sx={{
        display: 'flex',
        width: theme.spacing(13.75),
        alignContent: 'center',
        justifyContent: 'center',
      }}
    >
      <FormattedMessage defaultMessage={'All Networks'} />
    </Body>,
    <img
      src={arbNetworkIcon}
      style={{
        width: theme.spacing(3),
        height: theme.spacing(2),
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
      }}
      alt="arb network icon"
    />,
    <img
      src={ethNetworkIcon}
      style={{
        width: theme.spacing(3),
        height: theme.spacing(2),
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
      }}
      alt="arb network icon"
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
