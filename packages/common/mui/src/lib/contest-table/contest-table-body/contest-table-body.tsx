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

interface StyledTableRowProps extends TableRowProps {
  theme: NotionalTheme;
  rowSelected?: boolean;
  styleLastRow?: boolean;
  tableVariant?: CONTEST_TABLE_VARIANTS;
  expandableTableActive?: boolean;
}

interface ContestTableBodyProps {
  rows: Record<string, any>[];
  prepareRow: any;
  tableVariant?: CONTEST_TABLE_VARIANTS;
}

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop: string) => prop !== 'rowSelected',
})(
  ({ theme, rowSelected }: StyledTableRowProps) => `
    background: ${rowSelected ? theme.palette.info.light : 'transparent'};
    box-sizing: border-box;
    box-shadow: ${
      rowSelected ? `0px 0px 6px 0px ${theme.palette.primary.light}` : 'none'
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

export const ContestTableBody = ({
  rows,
  prepareRow,
}: ContestTableBodyProps) => {
  const theme = useTheme() as NotionalTheme;
  return (
    <TableBody>
      {rows.map((row, i) => {
        prepareRow(row);
        const rowSelected = row['original'].rowSelected;
        const lastRow = rows[rows.length - 1];
        const styleLastRow = lastRow['id'] === row['id'];
        return (
          <Fragment key={`row-container-${i}`}>
            <StyledTableRow
              theme={theme}
              key={`row-${i}`}
              rowSelected={rowSelected}
              tableVariant={CONTEST_TABLE_VARIANTS.DEFAULT}
              styleLastRow={styleLastRow}
              {...row['getRowProps']()}
            >
              {row['cells'].map((cell: Record<string, any>) => {
                return (
                  <TableCell
                    sx={{
                      padding: cell['column'].padding || '16px',
                      textAlign: cell['column'].textAlign || 'center',
                      borderBottom: 'none',
                      whiteSpace: 'nowrap',
                      width: cell['column']['width'] || 'auto',
                      color: colors.white,
                    }}
                    {...cell['getCellProps']()}
                  >
                    <TypographyTableCell>
                      {cell['render']('Cell')}
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

export default ContestTableBody;
