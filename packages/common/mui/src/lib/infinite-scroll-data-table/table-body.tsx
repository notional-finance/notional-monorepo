// import styled from '@emotion/styled';
import { useTheme, styled } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';
import { Row, flexRender } from '@tanstack/react-table';

interface TableBodyProps {
  rows: Record<string, any>[];
  rowVirtualizer?: any;
}

interface TBodyProps {
  height: number;
  theme: NotionalTheme;
}

export const TableBody = ({ rows, rowVirtualizer }: TableBodyProps) => {
  const theme = useTheme();

  return (
    <TBody height={rowVirtualizer.getTotalSize()} theme={theme}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index] as Row<any>;
        return (
          <tr
            data-index={virtualRow.index} //needed for dynamic row height measurement
            ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
            key={row.id}
            style={{
              display: 'flex',
              position: 'absolute',
              transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
              width: '100%',
            }}
          >
            {row.getVisibleCells().map((cell) => {
              return (
                <td
                  key={cell.id}
                  style={{
                    width: '100%',
                    padding: theme.spacing(2),
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              );
            })}
          </tr>
        );
      })}
    </TBody>
  );
};

const TBody = styled('tbody', {
  shouldForwardProp: (prop: string) => prop !== 'cardSet',
})(
  ({ height, theme }: TBodyProps) => `
  display: grid;
  height: ${height}px;
  position: relative;
  tr:nth-of-type(odd) {
    background: ${theme.palette.background.default};
  };
  tr:nth-of-type(even) {
    background: ${theme.palette.background.paper};
  };
`
);
