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
import { TABLE_VARIANTS } from '../types';
import { NotionalTheme } from '@notional-finance/styles';
import {
  SmallTableCell,
  TableCell as TypographyTableCell,
} from '../../typography/typography';
import { useNavigate } from 'react-router-dom';
import { flexRender, ExpandedState, Row } from '@tanstack/react-table';

interface StyledTableRowProps extends TableRowProps {
  theme: NotionalTheme;
  rowSelected?: boolean;
  styleLastRow?: boolean;
  tableVariant?: TABLE_VARIANTS;
  expandableTable?: boolean;
}

interface DataTableBodyProps {
  rows: Record<string, any>[];
  prepareRow?: any;
  CustomRowComponent?: ({ row }: { row: any }) => JSX.Element;
  setExpandedRows?: Dispatch<SetStateAction<ExpandedState>>;
  tableVariant?: TABLE_VARIANTS;
  initialState?: Record<any, any>;
  rowVirtualizer?: any;
  expandableTable?: boolean;
}

export const DataTableBody = ({
  rows,
  tableVariant,
  rowVirtualizer,
  setExpandedRows,
  CustomRowComponent,
  expandableTable,
  initialState,
}: DataTableBodyProps) => {
  const theme = useTheme() as NotionalTheme;
  const isScrollable = rowVirtualizer ? true : false;
  const tableRows = isScrollable ? rowVirtualizer.getVirtualItems() : rows;
  const navigate = useNavigate();
  return (
    <TableBody
      className="body"
      sx={{
        display: isScrollable ? 'grid' : '',
        height: isScrollable ? `${rowVirtualizer.getTotalSize()}px` : '', //tells scrollbar how big the table is
        position: isScrollable ? 'relative' : '', //needed for absolute positioning of rows
      }}
    >
      {tableRows.map((row, i) => {
        const currentRow = rows[row.index] as Row<any>;
        const cells = isScrollable
          ? currentRow.getVisibleCells()
          : row.getAllCells();

        const rowSelected = row.original?.rowSelected
          ? row.original?.rowSelected
          : false;
        const lastRow = rows[rows.length - 1];
        const styleLastRow = lastRow['id'] === row['id'];

        const isExpanded = initialState?.expanded
          ? initialState?.expanded[i]
          : false;

        const handleClick = () => {
          if (expandableTable && setExpandedRows) {
            const newState = {
              ...initialState?.expanded,
              [row.index]: !initialState?.expanded[row.index],
            };
            setExpandedRows(newState);
          }
          if (row.original?.view) {
            navigate(`/${row.original?.view}`);
          }
          if (row.original?.txLink?.href) {
            window.open(row.original?.txLink?.href, '_blank');
          }
        };

        const miniTotalRowStyles = row.original?.isTotalRow
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
              zIndex: 2,
              position: 'relative',
              '.multi-value-cell': {
                span: {
                  fontSize: row.original?.isEarningsRow ? '12px' : '14px',
                },
              },
            }
          : {};

        const scrollableStyles =
          isScrollable && row
            ? {
                display: 'flex',
                position: 'absolute',
                transform: row?.start ? `translateY(${row?.start}px)` : '',
                width: '100%',
              }
            : {};

        return (
          <Fragment key={`row-container-${i}`}>
            <StyledTableRow
              theme={theme}
              key={`row-${row.id}`}
              rowSelected={rowSelected}
              expandableTable={expandableTable}
              tableVariant={tableVariant}
              styleLastRow={styleLastRow}
              onClick={handleClick}
              sx={{
                height:
                  setExpandedRows &&
                  !row.original?.isDividerRow &&
                  !row.original?.isTotalRow
                    ? theme.spacing(15)
                    : row.original?.isTotalRow && setExpandedRows
                    ? theme.spacing(10)
                    : '',
                '&:hover': {
                  background:
                    row.original?.view || row.original?.txLink?.href
                      ? theme.palette.info.light
                      : '',
                  cursor: initialState?.clickDisabled
                    ? ''
                    : expandableTable ||
                      row.original?.view ||
                      row.original?.txLink?.href
                    ? 'pointer'
                    : '',
                },
                '&:hover #dropdown-arrow-button': {
                  transition: 'all 0.3s ease',
                  background: theme.palette.info.light,
                },
                borderTop: row.original?.isDividerRow
                  ? theme.shape.borderStandard
                  : '',
                borderBottom: row.original?.isDividerRow
                  ? theme.shape.borderStandard
                  : '',
                background:
                  row.original?.isDividerRow &&
                  `${theme.palette.secondary.dark} !important`,
                ...scrollableStyles,
              }}
            >
              {cells.map((cell: Record<string, any>, j) => {
                return (
                  <TableCell
                    key={`cell-${j}`}
                    className={cell.column.columnDef.className}
                    sx={{
                      margin: 'auto',
                      padding: expandableTable
                        ? theme.spacing(2, 3)
                        : tableVariant === TABLE_VARIANTS.MINI
                        ? theme.spacing(1)
                        : cell.column.columnDef.padding || '16px',
                      textAlign: cell.column.columnDef.textAlign || 'center',
                      borderBottom: 'none',
                      whiteSpace: 'nowrap',
                      width: cell.column.columnDef.width || 'auto',
                    }}
                  >
                    {tableVariant === TABLE_VARIANTS.MINI ? (
                      <SmallTableCell
                        sx={{
                          color: theme.palette.typography.main,
                          '.multi-value-cell': {
                            span: { fontSize: '12px', fontWeight: 600 },
                          },
                          ...miniTotalRowStyles,
                          justifyContent:
                            cell?.column.id === 'value' &&
                            row.original?.isTotalRow &&
                            'end',
                          paddingTop: row.original?.isEarningsRow ? '0px' : '',
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </SmallTableCell>
                    ) : (
                      <TypographyTableCell
                        id="inner-cell"
                        sx={{
                          color: theme.palette.typography.main,
                          fontSize:
                            row.original?.isTotalRow &&
                            tableVariant === TABLE_VARIANTS.TOTAL_ROW &&
                            expandableTable
                              ? theme.spacing(2)
                              : CustomRowComponent
                              ? theme.spacing(2)
                              : '',
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TypographyTableCell>
                    )}
                  </TableCell>
                );
              })}
            </StyledTableRow>
            {CustomRowComponent && !row.original?.isTotalRow && (
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

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop: string) =>
    prop !== 'rowSelected' &&
    prop !== 'styleLastRow' &&
    prop !== 'expandableTable' &&
    prop !== 'tableVariant',
})(
  ({
    theme,
    rowSelected,
    expandableTable,
    tableVariant,
  }: StyledTableRowProps) => `
    .MuiTableRow-root, &:nth-of-type(odd) {
      ${
        tableVariant === TABLE_VARIANTS.MINI
          ? `background: ${theme.palette.background.default};`
          : tableVariant === TABLE_VARIANTS.TOTAL_ROW
          ? `background: ${theme.palette.background.paper};`
          : expandableTable
          ? `background: ${theme.palette.background.paper};`
          : rowSelected
          ? `background: ${theme.palette.info.light};`
          : `background: ${theme.palette.background.default};`
      }
    };
    .MuiTableRow-root, &:last-of-type {
      ${
        tableVariant === TABLE_VARIANTS.TOTAL_ROW
          ? `
            border-top: ${theme.shape.borderStandard};
          `
          : ''
      } 
    }
    background: ${rowSelected ? theme.palette.info.light : 'transparent'};
    box-sizing: border-box;
    .MuiTableRow-root, td {
      .border-cell {
        height: 100%;
        padding: ${!expandableTable ? theme.spacing(2) : '0px'};
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
    ${theme.breakpoints.down('sm')} {
    .sticky-column {
      position: sticky;
      left: 0;      
      background: ${theme.palette.background.paper};      
      white-space: normal;
      padding: 0px;
      #inner-cell {
          padding: ${theme.spacing(2)};
          box-shadow: 0px 34px 50px -15px rgba(20, 42, 74, 0.80);   
        }
      }
    .MuiTableRow-root, &:nth-of-type(odd) {
      .sticky-column {
        background: ${theme.palette.background.default};
      }
    }
  }  
        

  `
);

export default DataTableBody;
