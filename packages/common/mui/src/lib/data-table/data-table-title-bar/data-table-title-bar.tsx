import { Dispatch, SetStateAction } from 'react';
import { Box, useTheme } from '@mui/material';
import { TableTitleButtonsType, TABLE_VARIANTS } from '../types';
import { ButtonBar } from '../../button-bar/button-bar';
import { TableCell, ModuleTitle } from '../../typography/typography';
import { InfoIcon } from '@notional-finance/icons';

interface DataTableTitleBarProps {
  tableTitle: JSX.Element;
  tableTitleSubText?: JSX.Element;
  tableTitleButtons?: TableTitleButtonsType[];
  tableVariant?: TABLE_VARIANTS;
  expandableTable?: boolean;
  setInfoBoxActive?: Dispatch<SetStateAction<boolean | undefined>>;
  infoBoxActive?: boolean | undefined;
}

export const DataTableTitleBar = ({
  tableTitle,
  tableVariant,
  expandableTable,
  tableTitleSubText,
  tableTitleButtons,
  setInfoBoxActive,
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
        <Box sx={{ padding: theme.spacing(2) }}>
          <ModuleTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: expandableTable
                ? theme.spacing(4)
                : theme.spacing(1),
              paddingTop: expandableTable ? theme.spacing(4) : theme.spacing(3),
            }}
          >
            {tableTitle}
            {setInfoBoxActive && (
              <InfoIcon
                fill={theme.palette.primary.light}
                onClick={() => setInfoBoxActive(true)}
                sx={{
                  height: theme.spacing(2),
                  cursor: 'pointer',
                }}
              />
            )}
          </ModuleTitle>
          {tableTitleSubText}
        </Box>
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
