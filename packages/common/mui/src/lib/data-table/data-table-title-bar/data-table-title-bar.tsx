import { Box, useTheme } from '@mui/material';
import { TableTitleButtonsType } from '../data-table';
import { ButtonBar } from '../../button-bar/button-bar';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { TABLE_VARIANTS } from '../data-table';
import { TableCell, ModuleTitle } from '../../typography/typography';

interface DataTableTitleBarProps {
  tableTitle: MessageDescriptor;
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
          }}
        >
          <FormattedMessage {...tableTitle} />
        </TableCell>
      ) : (
        <ModuleTitle
          sx={{
            padding: theme.spacing(2, 3),
            paddingBottom: theme.spacing(1),
            paddingTop: theme.spacing(3),
          }}
        >
          <FormattedMessage {...tableTitle} />
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
