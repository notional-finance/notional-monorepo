import { useMemo } from 'react';

// third-party
import useSWR, { mutate } from 'swr';

// utils
import { fetcher } from 'utils/axios';
import { KanbanColumn, KanbanComment, KanbanItem, KanbanStateProps, KanbanUserStory } from 'types/kanban';

const initialState: KanbanStateProps = {
  selectedItem: false
};

export const endpoints = {
  key: 'api/kanban',
  master: 'master',
  list: '/backlogs', // server URL
  addColumn: '/add-column', // server URL
  editColumn: '/edit-column', // server URL
  updateColumnOrder: '/update-column-order', // server URL
  deleteColumn: '/delete-column', // server URL
  addItem: '/add-item', // server URL
  editItem: '/edit-item', // server URL
  updateColumnItemOrder: '/update-item-order', // server URL
  addItemComment: '/add-item-comment', // server URL
  deleteItem: '/delete-item', // server URL
  addStory: '/add-story', // server URL
  editStory: '/edit-story', // server URL
  updateStoryOrder: '/update-story-order', // server URL
  updateStoryItemOrder: '/update-storyitem-order', // server URL
  addStoryComment: '/add-story-comment', // server URL
  deleteStory: '/delete-story' // server URL
};

export function useGetBacklogs() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.key, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      backlogs: data?.backlogs,
      backlogsLoading: isLoading,
      backlogsError: error,
      backlogsValidating: isValidating
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function addColumn(newColumn: KanbanColumn) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;
      const columns = [...backlogs.columns, newColumn];
      const columnsOrder = [...backlogs.columnsOrder, newColumn.id];

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          columns,
          columnsOrder
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { column: newColumn };
  //   await axios.post(endpoints.key + endpoints.addColumn, data);
}

export async function editColumn(newColumn: KanbanColumn) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;

      const column = backlogs.columns.splice(
        backlogs.columns.findIndex((c: KanbanColumn) => c.id === newColumn.id),
        1,
        newColumn
      );
      const columns = [...backlogs.columns, column];

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          columns
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  // const data = { column: newColumn };
  // await axios.post(endpoints.key + endpoints.editColumn, data);
}

export async function updateColumnOrder(columnsOrder: string[]) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          columnsOrder
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { columnsOrder };
  //   await axios.post(endpoints.key + endpoints.updateColumnOrder, data);
}

export async function deleteColumn(columnId: string) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;

      const columns = backlogs.columns.filter((column: KanbanColumn) => column.id !== columnId);
      const columnsOrder = backlogs.columnsOrder.filter((id: string) => id !== columnId);

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          columns,
          columnsOrder
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { columnId };
  //   await axios.post(endpoints.key + endpoints.deleteColumn, data);
}

export async function addItem(columnId: string, item: KanbanItem, storyId: string) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;

      let columns = backlogs.columns;
      if (columnId !== '0') {
        columns = backlogs.columns.map((column: KanbanColumn) => {
          if (column.id === columnId) {
            return {
              ...column,
              itemIds: column.itemIds ? [...column.itemIds, item.id] : [item.id]
            };
          }
          return column;
        });
      }

      let userStory = backlogs.userStory;
      if (storyId !== '0') {
        userStory = backlogs.userStory.map((story: KanbanUserStory) => {
          if (story.id === storyId) {
            return {
              ...story,
              itemIds: story.itemIds ? [...story.itemIds, item.id] : [item.id]
            };
          }
          return story;
        });
      }

      const items = [...backlogs.items, item];

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          columns,
          userStory,
          items
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { columnId, item, storyId };
  //   await axios.post(endpoints.key + endpoints.addItem, data);
}

export async function editItem(columnId: string, newItem: KanbanItem, storyId: string) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;

      const item = backlogs.items.splice(
        backlogs.items.findIndex((c: KanbanItem) => c.id === newItem.id),
        1,
        newItem
      );
      const items = [...backlogs.items, item];

      let userStory = backlogs.userStory;
      if (storyId) {
        const currentStory = backlogs.userStory.filter(
          (story: KanbanUserStory) => story.itemIds.filter((itemId) => itemId === newItem.id)[0]
        )[0];
        if (currentStory !== undefined && currentStory.id !== storyId) {
          userStory = backlogs.userStory.map((story: KanbanUserStory) => {
            if (story.itemIds.filter((itemId) => itemId === newItem.id)[0]) {
              return {
                ...story,
                itemIds: story.itemIds.filter((itemId) => itemId !== newItem.id)
              };
            }
            if (story.id === storyId) {
              return {
                ...story,
                itemIds: story.itemIds ? [...story.itemIds, newItem.id] : [newItem.id]
              };
            }
            return story;
          });
        }

        if (currentStory === undefined) {
          userStory = backlogs.userStory.map((story: KanbanUserStory) => {
            if (story.id === storyId) {
              return {
                ...story,
                itemIds: story.itemIds ? [...story.itemIds, newItem.id] : [newItem.id]
              };
            }
            return story;
          });
        }
      }

      let columns = backlogs.columns;
      if (columnId) {
        const currentColumn = backlogs.columns.filter(
          (column: KanbanColumn) => column.itemIds.filter((itemId) => itemId === newItem.id)[0]
        )[0];
        if (currentColumn !== undefined && currentColumn.id !== columnId) {
          columns = backlogs.columns.map((column: KanbanColumn) => {
            if (column.itemIds.filter((itemId) => itemId === newItem.id)[0]) {
              return {
                ...column,
                itemIds: column.itemIds.filter((itemId) => itemId !== newItem.id)
              };
            }
            if (column.id === columnId) {
              return {
                ...column,
                itemIds: column.itemIds ? [...column.itemIds, newItem.id] : [newItem.id]
              };
            }
            return column;
          });
        }

        if (currentColumn === undefined) {
          columns = backlogs.columns.map((column: KanbanColumn) => {
            if (column.id === columnId) {
              return {
                ...column,
                itemIds: column.itemIds ? [...column.itemIds, newItem.id] : [newItem.id]
              };
            }
            return column;
          });
        }
      }

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          columns,
          userStory,
          items
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { columnId, item: newItem, storyId };
  //   await axios.post(endpoints.key + endpoints.editItem, data);
}

export async function updateColumnItemOrder(columns: KanbanColumn[]) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          columns
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { columns };
  //   await axios.post(endpoints.key + endpoints.updateColumnItemOrder, data);
}

export async function addItemComment(itemId: string | false, comment: KanbanComment) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;

      const items = backlogs.items.map((item: KanbanItem) => {
        if (item.id === itemId) {
          return {
            ...item,
            commentIds: item.commentIds ? [...item.commentIds, comment.id] : [comment.id]
          };
        }
        return item;
      });

      const comments = [...backlogs.comments, comment];

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          items,
          comments
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { itemId, comment };
  //   await axios.post(endpoints.key + endpoints.addItemComment, data);
}

export async function deleteItem(itemId: string | false) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;

      const items = backlogs.items.filter((item: KanbanItem) => item.id !== itemId);
      const columns = backlogs.columns.map((column: KanbanColumn) => {
        const itemIds = column.itemIds.filter((id) => id !== itemId);
        return {
          ...column,
          itemIds
        };
      });

      const userStory = backlogs.userStory.map((story: KanbanUserStory) => {
        const itemIds = story.itemIds.filter((id) => id !== itemId);
        return {
          ...story,
          itemIds
        };
      });

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          items,
          columns,
          userStory
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { itemId };
  //   await axios.post(endpoints.key + endpoints.deleteItem, data);
}

export async function addStory(newStory: any) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;
      const userStory = [...backlogs.userStory, newStory];
      const userStoryOrder = [...backlogs.userStoryOrder, newStory.id];

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          userStory,
          userStoryOrder
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { story: newStory };
  //   await axios.post(endpoints.key + endpoints.addStory, data);
}

export async function editStory(newStory: KanbanUserStory) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;

      backlogs.userStory.splice(
        backlogs.userStory.findIndex((c: KanbanUserStory) => c.id === newStory.id),
        1,
        newStory
      );

      const userStory = [...backlogs.userStory];

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          userStory
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { story: newStory };
  //   await axios.post(endpoints.key + endpoints.editStory, data);
}

export async function updateStoryOrder(userStoryOrder: string[]) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          userStoryOrder
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { userStoryOrder };
  //   await axios.post(endpoints.key + endpoints.updateStoryOrder, data);
}

export async function updateStoryItemOrder(userStory: KanbanUserStory[]) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          userStory
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { userStory };
  //   await axios.post(endpoints.key + endpoints.updateStoryItemOrder, data);
}

export async function addStoryComment(storyId: string, comment: KanbanComment) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;

      const userStory = backlogs.userStory.map((story: KanbanUserStory) => {
        if (story.id === storyId) {
          return {
            ...story,
            commentIds: story.commentIds ? [...story.commentIds, comment.id] : [comment.id]
          };
        }
        return story;
      });

      const comments = [...backlogs.comments, comment];

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          userStory,
          comments
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { storyId, comment };
  //   await axios.post(endpoints.key + endpoints.addStoryComment, data);
}

export async function deleteStory(storyId: string) {
  // to update local state based on key
  mutate(
    endpoints.key,
    (currentBacklog: any) => {
      const backlogs = currentBacklog.backlogs;

      const userStory = backlogs.userStory.filter((column: KanbanUserStory) => column.id !== storyId);
      const userStoryOrder = backlogs.userStoryOrder.filter((id: string) => id !== storyId);

      return {
        ...currentBacklog,
        backlogs: {
          ...backlogs,
          userStory,
          userStoryOrder
        }
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { storyId };
  //   await axios.post(endpoints.key + endpoints.deleteStory, data);
}

export function useGetKanbanMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.master, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      kanbanMaster: data,
      kanbanMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerKanbanDialog(selectedItem: string | boolean) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.master,
    (currentKanbanMaster: any) => {
      return { ...currentKanbanMaster, selectedItem };
    },
    false
  );
}
