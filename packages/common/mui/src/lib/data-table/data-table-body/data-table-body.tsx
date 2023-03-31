import { Fragment, SetStateAction, Dispatch } from 'react';
import {
  TableCell,
  TableBody,
  TableRow,
  TableRowProps,
  useTheme,
  Collapse,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExpandedRows, TABLE_VARIANTS } from '../types';
import { NotionalTheme } from '@notional-finance/styles';
import {
  SmallTableCell,
  TableCell as TypographyTableCell,
} from '../../typography/typography';
import { THEME_VARIANTS } from '@notional-finance/shared-config';

interface StyledTableRowProps extends TableRowProps {
  theme: NotionalTheme;
  rowSelected?: boolean;
  styleLastRow?: boolean;
  tableVariant?: TABLE_VARIANTS;
  expandableTableActive?: boolean;
}

interface DataTableBodyProps {
  rows: Record<string, any>[];
  prepareRow: any;
  CustomRowComponent?: ({ row }: { row: any }) => JSX.Element;
  tableVariant?: TABLE_VARIANTS;
  setExpandedRows?: Dispatch<SetStateAction<ExpandedRows | null>>;
  initialState?: Record<any, any>;
}

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop: string) =>
    prop !== 'rowSelected' &&
    prop !== 'styleLastRow' &&
    prop !== 'expandableTableActive' &&
    prop !== 'tableVariant',
})(
  ({
    theme: { palette },
    rowSelected,
    expandableTableActive,
    tableVariant,
  }: StyledTableRowProps) => `
    .MuiTableRow-root, &:nth-of-type(odd) {
      ${
        tableVariant === TABLE_VARIANTS.MINI
          ? `background: ${palette.background.default};`
          : tableVariant === TABLE_VARIANTS.TOTAL_ROW
          ? `background: ${palette.background.paper};`
          : expandableTableActive
          ? `background: ${palette.background.paper};`
          : rowSelected
          ? `background: ${palette.info.light};`
          : `background: ${palette.background.default};`
      }
    };
    .MuiTableRow-root, &:last-of-type {
      ${
        tableVariant === TABLE_VARIANTS.TOTAL_ROW
          ? `background: ${palette.background.default};`
          : ''
      }   
    }
    cursor: ${expandableTableActive ? 'pointer' : ''};
    background: ${rowSelected ? palette.info.light : 'transparent'};
    box-sizing: border-box;
    box-shadow: ${
      rowSelected ? `0px 0px 6px 0px ${palette.primary.light}` : 'none'
    };
    .MuiTableRow-root, td {
      .border-cell {
        height: 100%;
        padding: ${!expandableTableActive ? '16px' : '0px'};
        border-top: 1px solid ${
          rowSelected ? palette.primary.light : 'transparent'
        };
        border-bottom: 1px solid ${
          rowSelected ? palette.primary.light : 'transparent'
        };
      }
    }
    .MuiTableRow-root, td:last-child {
      .border-cell {
        border-right: 1px solid ${
          rowSelected ? palette.primary.light : 'transparent'
        };
      }
    }
    .MuiTableRow-root, td:first-of-type {
      .border-cell {
        border-left: 1px solid ${
          rowSelected ? palette.primary.light : 'transparent'
        };
      }
    }
  `
);

export const DataTableBody = ({
  rows,
  prepareRow,
  tableVariant,
  CustomRowComponent,
  setExpandedRows,
  initialState,
}: DataTableBodyProps) => {
  const theme = useTheme() as NotionalTheme;

  return (
    <TableBody>
      {rows.map((row, i) => {
        prepareRow(row);
        const rowSelected = row['original'].rowSelected;
        const lastRow = rows[rows.length - 1];
        const styleLastRow = lastRow['id'] === row['id'];
        const { cells } = row;
        const expandableTableActive = CustomRowComponent ? true : false;
        const isExpanded = initialState?.expanded
          ? initialState?.expanded[i]
          : false;

        const handleClick = () => {
          if (expandableTableActive && setExpandedRows) {
            const newState = {
              ...initialState?.expanded,
              [row.index]: !initialState?.expanded[row.index],
            };
            setExpandedRows(newState);
          }
        };
        return (
          <Fragment key={`row-container-${i}`}>
            <StyledTableRow
              theme={theme}
              key={`row-${i}`}
              rowSelected={rowSelected}
              expandableTableActive={expandableTableActive}
              tableVariant={tableVariant}
              styleLastRow={styleLastRow}
              onClick={handleClick}
              {...row['getRowProps']()}
            >
              {row['cells'].map((cell: Record<string, any>) => {
                return (
                  <TableCell
                    sx={{
                      padding:
                        tableVariant === TABLE_VARIANTS.MINI
                          ? theme.spacing(1)
                          : cell['column'].padding || '16px',
                      textAlign: cell['column'].textAlign || 'center',
                      borderBottom: 'none',
                      whiteSpace: 'nowrap',
                    }}
                    {...cell['getCellProps']()}
                  >
                    {tableVariant === TABLE_VARIANTS.MINI ? (
                      <SmallTableCell
                        sx={{ color: theme.palette.typography.main }}
                      >
                        {cell['render']('Cell')}
                      </SmallTableCell>
                    ) : (
                      <TypographyTableCell>
                        {cell['render']('Cell')}
                      </TypographyTableCell>
                    )}
                  </TableCell>
                );
              })}
            </StyledTableRow>
            {CustomRowComponent && (
              <TableRow key={`sub-row-${i}`}>
                <TableCell
                  sx={{ padding: '0px', borderBottom: 'none' }}
                  colSpan={cells.length}
                >
                  <Collapse in={isExpanded} sx={{ margin: '0px' }}>
                    <CustomRowComponent row={row} />
                  </Collapse>
                </TableCell>
              </TableRow>
            )}
          </Fragment>
        );
      })}
    </TableBody>
  );
};

export default DataTableBody;
