import { Box, useTheme } from '@mui/material';
import { useState } from 'react';
import { TokenToggleControl } from './components/TokenToggleControl';
import { TopBanner } from './components/TopBanner';
import { VaultTable } from './components/VaultTable';

export const VaultList = () => {
  const theme = useTheme();
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);
  const selectedDepositToken =
    selectedTokenIndex === 1
      ? 'USDC'
      : selectedTokenIndex === 2
      ? 'WETH'
      : null;

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
          marginBottom: theme.spacing(1),
        }}
      >
        <TokenToggleControl
          selectedTokenIndex={selectedTokenIndex}
          onChange={setSelectedTokenIndex}
        />
        {/* <StrategyTypeControl /> */}
        {/* <ClearAllControl /> */}
      </Box>
      <VaultTable selectedDepositToken={selectedDepositToken} />
    </Box>
  );
};
