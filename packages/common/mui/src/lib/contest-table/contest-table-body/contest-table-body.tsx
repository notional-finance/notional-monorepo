import { Fragment } from 'react';
import {
  TableCell,
  TableBody,
  TableRow,
  TableRowProps,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CONTEST_TABLE_VARIANTS } from '../types';
import { colors, NotionalTheme } from '@notional-finance/styles';
import { TableCell as TypographyTableCell } from '../../typography/typography';
import { flexRender } from '@tanstack/react-table';

interface StyledTableRowProps extends TableRowProps {
  theme: NotionalTheme;
  rowSelected?: boolean;
  styleLastRow?: boolean;
  isCurrentUser?: boolean;
  expandableTableActive?: boolean;
  tableVariant?: CONTEST_TABLE_VARIANTS;
}

interface ContestTableBodyProps {
  rows: Record<string, any>[];
  tableVariant?: CONTEST_TABLE_VARIANTS;
  isCurrentUser?: boolean;
}

export const ContestTableBody = ({
  rows,
  tableVariant,
  isCurrentUser,
}: ContestTableBodyProps) => {
  const theme = useTheme() as NotionalTheme;

  return (
    <TableBody
      sx={{
        border: `1px solid ${colors.neonTurquoise}`,
        overflow: 'hidden',
      }}
    >
      {rows.map((row, i) => {
        const rowSelected = row['original'].rowSelected;
        const { getAllCells } = row;
        const cells = getAllCells();

        return (
          <Fragment key={`row-container-${i}`}>
            <StyledTableRow
              theme={theme}
              key={`row-${i}`}
              rowSelected={rowSelected}
              isCurrentUser={isCurrentUser}
              tableVariant={tableVariant}
            >
              {cells.map((cell: Record<string, any>, index) => {
                return (
                  <TableCell
                    key={index}
                    sx={{
                      padding: cell.column.columnDef.padding || '8px 16px',
                      textAlign: cell.column.columnDef.textAlign || 'center',
                      whiteSpace: 'nowrap',
                      width:
                        cell.column.columnDef.width || cell.column.getSize(),
                      fontWeight: cell.column.columnDef.fontWeight || 'normal',
                      color:
                        isCurrentUser ||
                        tableVariant === CONTEST_TABLE_VARIANTS.ACCENT
                          ? colors.neonTurquoise
                          : colors.white,
                      borderRight: cell.column.columnDef.isIDCell
                        ? `1px solid ${colors.neonTurquoise}`
                        : 'none',
                      borderBottom: `1px solid ${colors.neonTurquoise}`,
                      fontSize: cell.column.columnDef.fontSize || '14px',
                    }}
                  >
                    <TypographyTableCell>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TypographyTableCell>
                  </TableCell>
                );
              })}
            </StyledTableRow>
          </Fragment>
        );
      })}
    </TableBody>
  );
};

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop: string) =>
    prop !== 'rowSelected' && prop !== 'isCurrentUser',
})(
  ({
    theme,
    rowSelected,
    isCurrentUser,
    tableVariant,
  }: StyledTableRowProps) => `
    background: ${rowSelected ? theme.palette.info.light : 'transparent'};
    box-sizing: border-box;
    box-shadow: ${
      rowSelected ? `0px 0px 6px 0px ${theme.palette.primary.light}` : 'none'
    };
    .MuiTableRow-root, &:first-of-type {
      background: ${
        isCurrentUser ? `rgba(231, 232, 242, 0.25)` : `rgba(51, 248, 255, 0.10)`
      };
    };

    background: ${
      tableVariant === CONTEST_TABLE_VARIANTS.ACCENT
        ? 'rgba(51, 248, 255, 0.10)'
        : ''
    };

    .MuiTableRow-root, td {
      .border-cell {
        height: 100%;
        padding: 0px;
        border-top: 1px solid ${
          rowSelected ? theme.palette.primary.light : 'transparent'
        };
        border-bottom: 1px solid ${
          rowSelected ? theme.palette.primary.light : 'transparent'
        };
      }
    }
    .MuiTableRow-root, td:first-of-type {
      .border-cell {
        border-left: 1px solid ${
          rowSelected ? theme.palette.primary.light : 'transparent'
        };
      }
    }
  `
);

export default ContestTableBody;
