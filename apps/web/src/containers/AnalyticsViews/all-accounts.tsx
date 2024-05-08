import { Box, useTheme } from '@mui/material';

export const AllAccounts = () => {
  const theme = useTheme();

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
