import { Box, useTheme } from '@mui/material';
import { TotalBox, TotalBoxProps } from './total-box';

export const TotalRow = ({ totalsData }: { totalsData: TotalBoxProps[] }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        gap: theme.spacing(5),
        marginBottom: theme.spacing(3),
        marginTop: theme.spacing(3),
      }}
    >
      {totalsData.map(
        ({ title, value, Icon, prefix, suffix, decimals }, index) => (
          <TotalBox
            title={title}
            value={value}
            key={index}
            Icon={Icon}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
        )
      )}
    </Box>
  );
};
