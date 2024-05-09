import { Box, useTheme } from '@mui/material';
import { Network } from '@notional-finance/util';
import { useAllAccounts } from './hooks';

interface AllAccountsProps {
  networkToggleData: {
    toggleKey: number;
    setToggleKey: (v: number) => void;
  };
  selectedNetwork: Network;
}

export const AllAccounts = ({
  networkToggleData,
  selectedNetwork,
}: AllAccountsProps) => {
  const theme = useTheme();

  const { tableData } = useAllAccounts(selectedNetwork);

  console.log({ tableData });
  console.log({ networkToggleData });

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
      AllAccounts
    </Box>
  );
};

export default AllAccounts;
