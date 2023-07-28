import { Box, useTheme } from '@mui/material';
import { TableTitleButtonsType, TABLE_VARIANTS } from '../types';
import { ButtonBar } from '../../button-bar/button-bar';
import { TableCell, ModuleTitle } from '../../typography/typography';

interface DataTableTitleBarProps {
  tableTitle: JSX.Element;
  tableTitleButtons?: TableTitleButtonsType[];
  tableVariant?: TABLE_VARIANTS;
  expandableTable?: boolean;
}

export const DataTableTitleBar = ({
  tableTitleButtons,
  tableTitle,
  tableVariant,
  expandableTable,
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
            paddingBottom: expandableTable
              ? theme.spacing(4)
              : theme.spacing(1),
            paddingTop: expandableTable ? theme.spacing(4) : theme.spacing(3),
          }}
        >
          {tableTitle}
        </ModuleTitle>
      )}
      {tableTitleButtons?.length && (
        <Box sx={{ paddingRight: theme.spacing(2) }}>
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
