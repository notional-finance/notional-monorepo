// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

// third-party
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';

// project imports
import Columns from './Columns';
import AddColumn from './AddColumn';
import ItemDetails from './ItemDetails';
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';

import { ThemeMode } from 'config';
import { updateColumnItemOrder, updateColumnOrder, useGetBacklogs } from 'api/kanban';

// types
import { KanbanColumn } from 'types/kanban';

const getDragWrapper = () => ({
  p: 2.5,
  px: 0,
  background: 'transparent',
  display: 'flex',
  overflow: 'auto'
});

const heightOptions = [120, 100, 160, 80, 60];

// ==============================|| KANBAN - BOARD ||============================== //

export default function Board() {
  const theme = useTheme();
  const { backlogs, backlogsLoading } = useGetBacklogs();

  // handle drag & drop
  const onDragEnd = (result: DropResult) => {
    let newColumn: KanbanColumn[];
    const { source, destination, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'column') {
      const newColumnsOrder = Array.from(backlogs?.columnsOrder as string);

      newColumnsOrder.splice(source.index, 1); // remove dragged column
      newColumnsOrder.splice(destination?.index, 0, draggableId); // set column new position

      updateColumnOrder(newColumnsOrder);
      return;
    }

    // find dragged item's column
    const sourceColumn = backlogs?.columns.filter((item: KanbanColumn) => item.id === source.droppableId)[0];

    // find dropped item's column
    const destinationColumn = backlogs?.columns.filter((item: KanbanColumn) => item.id === destination.droppableId)[0];

    // if - moving items in the same list
    // else - moving items from one list to another
    if (sourceColumn === destinationColumn) {
      const newItemIds = Array.from(sourceColumn.itemIds);

      // remove the id of dragged item from its original position
      newItemIds.splice(source.index, 1);

      // insert the id of dragged item to the new position
      newItemIds.splice(destination.index, 0, draggableId);

      // updated column
      const newSourceColumn = {
        ...sourceColumn,
        itemIds: newItemIds
      };

      newColumn = backlogs?.columns.map((column: KanbanColumn) => {
        if (column.id === newSourceColumn.id) {
          return newSourceColumn;
        }
        return column;
      });
    } else {
      const newSourceItemIds = Array.from(sourceColumn.itemIds);

      // remove the id of dragged item from its original column
      newSourceItemIds.splice(source.index, 1);

      // updated dragged items's column
      const newSourceColumn = {
        ...sourceColumn,
        itemIds: newSourceItemIds
      };

      const newDestinationItemIds = Array.from(destinationColumn.itemIds);

      // insert the id of dragged item to the new position in dropped column
      newDestinationItemIds.splice(destination.index, 0, draggableId);

      // updated dropped item's column
      const newDestinationColumn = {
        ...destinationColumn,
        itemIds: newDestinationItemIds
      };

      newColumn = backlogs?.columns.map((column: KanbanColumn) => {
        if (column.id === newSourceColumn.id) {
          return newSourceColumn;
        }
        if (column.id === newDestinationColumn.id) {
          return newDestinationColumn;
        }
        return column;
      });
    }

    updateColumnItemOrder(newColumn);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <ScrollX>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="columns" direction="horizontal" type="column">
            {(provided) => (
              <MainCard
                border={false}
                ref={provided.innerRef}
                sx={{ bgcolor: 'transparent', backgroundImage: 'none' }}
                contentSX={getDragWrapper()}
                {...provided.droppableProps}
              >
                {backlogs?.columnsOrder.map((columnId: string, index: number) => {
                  const column = backlogs?.columns.filter((item: KanbanColumn) => item.id === columnId)[0];
                  return backlogsLoading ? (
                    <MainCard
                      content={false}
                      sx={{
                        p: 1.5,
                        margin: '0 16px 0 0',
                        minWidth: 250,
                        bgcolor: theme.palette.mode === ThemeMode.DARK ? 'background.paper' : 'secondary.lighter'
                      }}
                    >
                      <Stack spacing={1.25}>
                        <Skeleton variant="rounded" width="100%" height={38} />
                        <Skeleton variant="rounded" width="100%" height={heightOptions[Math.floor(Math.random() * heightOptions.length)]} />
                        <Skeleton variant="rounded" width="100%" height={heightOptions[Math.floor(Math.random() * heightOptions.length)]} />
                        <Skeleton variant="rounded" width="100%" height={heightOptions[Math.floor(Math.random() * heightOptions.length)]} />
                      </Stack>
                    </MainCard>
                  ) : (
                    <Columns key={columnId} column={column} index={index} />
                  );
                })}
                {provided.placeholder}
                <AddColumn />
              </MainCard>
            )}
          </Droppable>
        </DragDropContext>
      </ScrollX>
      <ItemDetails />
    </Box>
  );
}
