import { Box, useTheme } from '@mui/material';

export const TxnHistoryRow = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        background: theme.palette.background.default,
      }}
    >
      Test
    </Box>
  );
};
