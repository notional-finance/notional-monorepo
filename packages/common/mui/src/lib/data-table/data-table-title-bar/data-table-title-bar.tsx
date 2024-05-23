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
  showInfoIcon?: boolean;
}

export const DataTableTitleBar = ({
  tableTitle,
  tableVariant,
  expandableTable,
  tableTitleSubText,
  tableTitleButtons,
  setInfoBoxActive,
  showInfoIcon = false,
}: DataTableTitleBarProps) => {
  const theme = useTheme();

  return (
    <Box
      className="title-bar"
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
            color: theme.palette.typography.main,
            fontWeight: 600,
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
              paddingBottom: theme.spacing(1),
              paddingTop: theme.spacing(1),
              padding: expandableTable ? theme.spacing(1) : '',
            }}
          >
            {tableTitle}
            {setInfoBoxActive && showInfoIcon && (
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
