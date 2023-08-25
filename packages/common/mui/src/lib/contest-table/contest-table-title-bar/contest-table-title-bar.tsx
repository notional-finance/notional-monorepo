import { Box, useTheme } from '@mui/material';
import { ModuleTitle } from '../../typography/typography';

interface ContestTableTitleBarProps {
  tableTitle: JSX.Element;
  tableTitleSubText?: JSX.Element;
}

export const ContestTableTitleBar = ({
  tableTitle,
  tableTitleSubText,
}: ContestTableTitleBarProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ padding: theme.spacing(2) }}>
        <ModuleTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingBottom: theme.spacing(1),
            paddingTop: theme.spacing(1),
          }}
        >
          {tableTitle}
        </ModuleTitle>
        {tableTitleSubText}
      </Box>
    </Box>
  );
};

export default ContestTableTitleBar;
