import { Box, useTheme } from '@mui/material';
import { TableTitleButtonsType } from '../data-table';
import { ButtonBar } from '../../button-bar/button-bar';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { TABLE_VARIANTS } from '../data-table';

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
  const { palette } = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {tableTitle && (
        <Box
          sx={{
            padding: tableVariant === TABLE_VARIANTS.MINI ? '16px' : '16px 24px',
            color: palette.common.black,
            paddingBottom: tableVariant === TABLE_VARIANTS.SPARSE ? '0px' : '7px',
            paddingTop: tableVariant === TABLE_VARIANTS.SPARSE ? '0.625rem' : '27px',
            fontWeight: '600',
            fontSize: tableVariant === TABLE_VARIANTS.MINI ? '12px' : '16px',
            textTransform: tableVariant === TABLE_VARIANTS.SPARSE ? 'uppercase' : '',
          }}
        >
          <FormattedMessage {...tableTitle} />
        </Box>
      )}
      {tableTitleButtons?.length && (
        <Box sx={{ padding: '25px 17px 7px 17px' }}>
          <ButtonBar buttonVariant="outlined" buttonOptions={tableTitleButtons} />
        </Box>
      )}
    </Box>
  );
};

export default DataTableTitleBar;
