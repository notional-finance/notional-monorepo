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
  isCurrentUser?: boolean;
  expandableTableActive?: boolean;
}

interface ContestTableBodyProps {
  rows: Record<string, any>[];
  prepareRow: any;
  isCurrentUser?: boolean;
}

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop: string) =>
    prop !== 'rowSelected' && prop !== 'isCurrentUser',
})(
  ({ theme, rowSelected, isCurrentUser }: StyledTableRowProps) => `
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
        prepareRow(row);
        const rowSelected = row['original'].rowSelected;

        return (
          <Fragment key={`row-container-${i}`}>
            <StyledTableRow
              theme={theme}
              key={`row-${i}`}
              rowSelected={rowSelected}
              isCurrentUser={isCurrentUser}
              {...row['getRowProps']()}
            >
              {row['cells'].map((cell: Record<string, any>) => {
                return (
                  <TableCell
                    sx={{
                      padding: cell['column'].padding || '8px 16px',
                      textAlign: cell['column'].textAlign || 'center',
                      whiteSpace: 'nowrap',
                      width: cell['column']['width'] || 'auto',
                      color: isCurrentUser
                        ? colors.neonTurquoise
                        : colors.white,
                      borderRight: cell['column']['isIDCell']
                        ? `1px solid ${colors.neonTurquoise}`
                        : 'none',
                      borderBottom: `1px solid ${colors.neonTurquoise}`,

                      fontSize: cell['column']['fontSize'] || '14px',
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
