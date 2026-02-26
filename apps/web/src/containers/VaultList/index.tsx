import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { TokenToggleControl } from './components/TokenToggleControl';
import { TopBanner } from './components/TopBanner';
import { VaultCardList } from './components/VaultCardList';
import { VaultTable } from './components/VaultTable';

export const VaultList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        marginTop: { xs: theme.spacing(4), md: theme.spacing(9) },
        padding: { xs: theme.spacing(0, 2), md: theme.spacing(0, 8.5) },
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
      {isMobile ? (
        <VaultCardList selectedDepositToken={selectedDepositToken} />
      ) : (
        <VaultTable selectedDepositToken={selectedDepositToken} />
      )}
    </Box>
  );
};
