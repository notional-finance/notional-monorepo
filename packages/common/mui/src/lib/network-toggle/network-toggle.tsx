import { Box, useTheme } from '@mui/material';
import SimpleToggle from '../simple-toggle/simple-toggle';
import { TokenIcon } from '@notional-finance/icons';

interface NetworkToggleProps {
  selectedNetwork: number;
  handleNetWorkToggle: (value: number) => void;
}

export const NetworkToggle = ({
  selectedNetwork,
  handleNetWorkToggle,
}: NetworkToggleProps) => {
  const theme = useTheme();

  const toggleOptions = [
    <Box sx={{ fontSize: '14px', display: 'flex' }} key={0}>
      <TokenIcon
        symbol="arbnetwork"
        size="small"
        style={{ marginRight: theme.spacing(1) }}
      />
      Arbitrum
    </Box>,
    <Box sx={{ fontSize: '14px', display: 'flex' }} key={1}>
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
      onChange={(_, v) => handleNetWorkToggle(v as number)}
    />
  );
};
