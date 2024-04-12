import { useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { useState } from 'react';
import { Body } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const useNetworkToggle = () => {
  const theme = useTheme();
  const [networkToggleOption, setNetworkToggleOption] = useState(0);

  const networkOptions = [
    <Body
      sx={{
        display: 'flex',
        width: theme.spacing(10),
        alignContent: 'center',
        justifyContent: 'center',
      }}
    >
      <TokenIcon
        symbol="arbnetwork"
        size="small"
        style={{
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center',
          width: theme.spacing(3),
          marginRight: theme.spacing(1),
        }}
      />
      <FormattedMessage defaultMessage={'Arbitrum'} />
    </Body>,
    <Body
      sx={{
        display: 'flex',
        width: theme.spacing(10),
        alignContent: 'center',
        justifyContent: 'center',
      }}
    >
      <TokenIcon
        symbol="ethnetwork"
        size="small"
        style={{
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center',
          width: theme.spacing(3),
          marginRight: theme.spacing(1),
        }}
      />
      <FormattedMessage defaultMessage={'Mainnet'} />
    </Body>,
  ];

  return {
    toggleOptions: networkOptions,
    toggleKey: networkToggleOption,
    setToggleKey: setNetworkToggleOption,
  };
};

export default useNetworkToggle;
