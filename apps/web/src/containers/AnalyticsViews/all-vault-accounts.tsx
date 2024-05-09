import { Box, useTheme } from '@mui/material';
import { Network } from '@notional-finance/util';

interface AllVaultAccountsProps {
  networkToggleData: {
    toggleKey: number;
    setToggleKey: (v: number) => void;
  };
  selectedNetwork: Network;
}

export const AllVaultAccounts = ({
  networkToggleData,
  selectedNetwork,
}: AllVaultAccountsProps) => {
  const theme = useTheme();

  console.log({ networkToggleData, selectedNetwork });

  return (
    <Box
      sx={{
        padding: theme.spacing(5),
        paddingTop: '0px',
        maxWidth: theme.spacing(180),
        margin: 'auto',
        marginTop: `-${theme.spacing(30)}`,
      }}
    >
      AllVaultAccounts
    </Box>
  );
};

export default AllVaultAccounts;
