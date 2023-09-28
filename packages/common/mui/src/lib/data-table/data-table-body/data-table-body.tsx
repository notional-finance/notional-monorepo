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
    theme,
    rowSelected,
    expandableTableActive,
    tableVariant,
  }: StyledTableRowProps) => `
    .MuiTableRow-root, &:nth-of-type(odd) {
      ${
        tableVariant === TABLE_VARIANTS.MINI
          ? `background: ${theme.palette.background.default};`
          : tableVariant === TABLE_VARIANTS.TOTAL_ROW
          ? `background: ${theme.palette.background.paper};`
          : expandableTableActive
          ? `background: ${theme.palette.background.paper};`
          : rowSelected
          ? `background: ${theme.palette.info.light};`
          : `background: ${theme.palette.background.default};`
      }
    };
    .MuiTableRow-root, &:last-of-type {
      ${
        tableVariant === TABLE_VARIANTS.TOTAL_ROW
          ? `background: ${theme.palette.background.default};`
          : ''
      }   
    }
    cursor: ${expandableTableActive ? 'pointer' : ''};
    background: ${rowSelected ? theme.palette.info.light : 'transparent'};
    box-sizing: border-box;
    box-shadow: ${
      rowSelected ? `0px 0px 6px 0px ${theme.palette.primary.light}` : 'none'
    };
    .MuiTableRow-root, td {
      .border-cell {
        height: 100%;
        padding: ${!expandableTableActive ? theme.spacing(2) : '0px'};
        border-top: 1px solid ${
          rowSelected ? theme.palette.primary.light : 'transparent'
        };
        border-bottom: 1px solid ${
          rowSelected ? theme.palette.primary.light : 'transparent'
        };
      }
    }
    .MuiTableRow-root, td:last-child {
      .border-cell {
        border-right: 1px solid ${
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

        const miniTotalRowStyles = row.original.isTotalRow
          ? {
              marginLeft: `-${theme.spacing(3)}`,
              marginRight: `-${theme.spacing(3)}`,
              marginBottom: `-${theme.spacing(3)}`,
              borderRadius: theme.shape.borderRadius,
              padding: theme.spacing(2, 3),
              height: theme.spacing(6.5),
              background: theme.palette.background.paper,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600,
              fontSize: '14px',
              '.multi-value-cell': {
                span: { fontSize: '14px' },
              },
            }
          : {};

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
              sx={{
                '&:hover #dropdown-arrow-button': {
                  transition: 'all 0.3s ease',
                  background: theme.palette.info.light,
                },
              }}
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
                      width: cell['column']['width'] || 'auto',
                    }}
                    {...cell['getCellProps']()}
                  >
                    {tableVariant === TABLE_VARIANTS.MINI ? (
                      <SmallTableCell
                        sx={{
                          color: theme.palette.typography.main,
                          '.multi-value-cell': {
                            span: { fontSize: '12px' },
                          },
                          ...miniTotalRowStyles,
                          justifyContent:
                            cell?.value?.data &&
                            row.original.isTotalRow &&
                            'end',
                        }}
                      >
                        {cell['render']('Cell')}
                      </SmallTableCell>
                    ) : (
                      <TypographyTableCell
                        sx={{
                          fontSize: CustomRowComponent ? theme.spacing(2) : '',
                        }}
                      >
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
                  sx={{
                    padding: '0px',
                    borderBottom: 'none',
                    fontSize: '16px',
                  }}
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
