import { Box, useTheme } from '@mui/material';
import SimpleToggle from '../simple-toggle/simple-toggle';
import { TokenIcon } from '@notional-finance/icons';

interface NetworkToggleProps {
  selectedNetwork: number;
  handleNetworkToggle: (value: number) => void;
}

export const NetworkToggle = ({
  selectedNetwork,
  handleNetworkToggle,
}: NetworkToggleProps) => {
  const theme = useTheme();

  const toggleOptions = [
    <Box sx={{ fontSize: '14px', display: 'flex' }}>
      <TokenIcon
        symbol="arbnetwork"
        size="small"
        style={{ marginRight: theme.spacing(1) }}
      />
      Arbitrum
    </Box>,
    <Box sx={{ fontSize: '14px', display: 'flex' }}>
      <TokenIcon
        symbol="ethnetwork"
        size="small"
        style={{ marginRight: theme.spacing(1) }}
      />
      Mainnet
    </Box>,
  ];

  return (
    <SimpleToggle
      tabLabels={toggleOptions}
      selectedTabIndex={selectedNetwork}
      onChange={(_, v) => handleNetworkToggle(v as number)}
    />
  );
};
