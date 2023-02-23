import { Box, useTheme } from '@mui/material';
import { TableTitleButtonsType, TABLE_VARIANTS } from '../types';
import { ButtonBar } from '../../button-bar/button-bar';
import { TableCell, ModuleTitle } from '../../typography/typography';

interface DataTableTitleBarProps {
  tableTitle: JSX.Element;
  tableTitleButtons?: TableTitleButtonsType[];
  tableVariant?: TABLE_VARIANTS;
}

export const DataTableTitleBar = ({
  tableTitleButtons,
  tableTitle,
  tableVariant,
}: DataTableTitleBarProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {tableVariant === TABLE_VARIANTS.MINI ? (
        <TableCell
          sx={{
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(2),
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
            width: '100%',
          }}
        >
          {tableTitle}
        </TableCell>
      ) : (
        <ModuleTitle
          sx={{
            padding: theme.spacing(2),
            paddingBottom: theme.spacing(1),
            paddingTop: theme.spacing(3),
          }}
        >
          {tableTitle}
        </ModuleTitle>
      )}
      {tableTitleButtons?.length && (
        <Box sx={{ padding: '25px 17px 7px 17px' }}>
          <ButtonBar
            buttonVariant="outlined"
            buttonOptions={tableTitleButtons}
          />
        </Box>
      )}
    </Box>
  );
};

export default DataTableTitleBar;
