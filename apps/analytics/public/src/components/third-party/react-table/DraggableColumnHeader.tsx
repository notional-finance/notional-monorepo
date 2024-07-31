import { ReactElement } from 'react';

// material-ui
import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';

// third-party
import { useDrag, useDrop } from 'react-dnd';
import { Column, ColumnOrderState, Header, Table } from '@tanstack/react-table';

// types
import { TableDataProps } from 'types/table';

const reorderColumn = (draggedColumnId: string, targetColumnId: string, columnOrder: string[]): ColumnOrderState => {
  columnOrder.splice(columnOrder.indexOf(targetColumnId), 0, columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0] as string);
  return [...columnOrder];
};

// ==============================|| DRAGGABLE COLUMN ||============================== //

export default function DraggableColumnHeader({
  header,
  table,
  children
}: {
  header: Header<TableDataProps, unknown>;
  table: Table<TableDataProps>;
  children: ReactElement;
}) {
  const { getState, setColumnOrder } = table;
  const { columnOrder } = getState();
  const { column } = header;

  const [{ isOverCurrent }, dropRef] = useDrop({
    accept: 'column',
    drop: (draggedColumn: Column<TableDataProps>) => {
      const newColumnOrder = reorderColumn(draggedColumn.id, column.id, columnOrder);
      setColumnOrder(newColumnOrder);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true })
    })
  });

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    item: () => column,
    type: 'column'
  });

  return (
    <TableCell ref={dropRef} colSpan={header.colSpan} sx={{ cursor: 'move' }} {...header.column.columnDef.meta}>
      <Box component="span" ref={previewRef}>
        <Box ref={dragRef} sx={{ color: isOverCurrent ? 'primary.main' : 'text.primary', opacity: isDragging ? 0.9 : 1 }}>
          {children}
        </Box>
      </Box>
    </TableCell>
  );
}
