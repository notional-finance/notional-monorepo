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
import { useHistory } from 'react-router';

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
          ? `
            border-top: ${theme.shape.borderStandard};
          `
          : ''
      } 
    }
    cursor: ${expandableTableActive ? 'pointer' : ''};
    background: ${rowSelected ? theme.palette.info.light : 'transparent'};
    box-sizing: border-box;
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

export const DataTableBody = ({
  rows,
  prepareRow,
  tableVariant,
  CustomRowComponent,
  setExpandedRows,
  initialState,
}: DataTableBodyProps) => {
  const theme = useTheme() as NotionalTheme;
  const history = useHistory();
  return (
    <TableBody className="body">
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
          if (row.original.view) {
            history.push(row.original.view);
          }
          if (row.original?.txLink?.href) {
            window.open(row.original.txLink.href, '_blank');
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

        const rowHoverStyles =
          row.original.view || row.original?.txLink?.href
            ? {
                '&:hover': {
                  background: theme.palette.info.light,
                  cursor: 'pointer',
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
                ...rowHoverStyles,
              }}
              {...row['getRowProps']()}
            >
              {row['cells'].map((cell: Record<string, any>) => {
                return (
                  <TableCell
                    className={cell['column'].className}
                    sx={{
                      margin: 'auto',
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
                        id="inner-cell"
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
            {CustomRowComponent && !row.original.isTotalRow && (
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
