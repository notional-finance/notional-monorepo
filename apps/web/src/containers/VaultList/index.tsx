import { Box, useTheme } from '@mui/material';
import { useState } from 'react';
import { ClearAllControl } from './components/ClearAllControl';
import { StrategyTypeControl } from './components/StrategyTypeControl';
import { TokenToggleControl } from './components/TokenToggleControl';
import { TopBanner } from './components/TopBanner';
import { VaultTable } from './components/VaultTable';

export const VaultList = () => {
  const theme = useTheme();
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);

  return (
    <Box
      sx={{
        marginTop: theme.spacing(9),
        padding: theme.spacing(0, 9),
      }}
    >
      <TopBanner />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(3),
          marginBottom: theme.spacing(5),
        }}
      >
        <TokenToggleControl
          selectedTokenIndex={selectedTokenIndex}
          onChange={setSelectedTokenIndex}
        />
        <StrategyTypeControl />
        <ClearAllControl />
      </Box>
      <VaultTable />
    </Box>
  );
};
