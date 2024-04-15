import { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  keepPreviousData,
  useInfiniteQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { TableHead } from './table-head';
import { TableBody } from './table-body';
import { useVirtualizer } from '@tanstack/react-virtual';
import { PageLoading } from '../page-loading/page-loading';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { Network } from '@notional-finance/util';

type InfiniteScrollDataTable = {
  tableTitle?: JSX.Element;
  network?: Network;
  networkToggleData: {
    toggleKey: number;
    setToggleKey: (v: number) => void;
  };
  apiCallback: (fetchCount: number) => Promise<any>; // This hook must return a promise
  handleDataFormatting: (data: any) => Array<any>; // This is the function that formats the data from the API to be used in the table
  columns: Array<any>;
};

const fetchSize = 100;

const Table = ({
  columns,
  network,
  apiCallback,
  networkToggleData,
  handleDataFormatting,
}: InfiniteScrollDataTable) => {
  const theme = useTheme();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, isFetching, isLoading, refetch } =
    useInfiniteQuery<any>({
      queryKey: [''],
      queryFn: async ({ pageParam = 0 }) => {
        const fetchCount = (pageParam as number) * fetchSize;
        const fetchedData = await apiCallback(fetchCount);
        const formattedData = handleDataFormatting(fetchedData);
        return formattedData;
      },
      initialPageParam: 0,
      getNextPageParam: (_lastGroup, groups) => groups.length,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    });

  const flatData = useMemo(() => {
    return data?.pages?.flatMap((page) => page) ?? [];
  }, [data]);

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        if (
          scrollHeight - scrollTop - clientHeight < 200 &&
          !isFetching &&
          data?.pages[data?.pages.length - 1].length > 0
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, data?.pages]
  );

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const table = useReactTable({
    data: flatData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const { rows } = table.getRowModel();
  const headerGroups = table.getHeaderGroups();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 70, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  useEffect(() => {
    refetch();
  }, [network, refetch]);

  return (
    <div
      className="container"
      onScroll={(e) => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
      ref={tableContainerRef}
      style={{
        overflow: 'auto', //our scrollable table container
        position: 'relative', //needed for sticky header
        maxHeight: theme.spacing(75),
        height: theme.spacing(75), //should be a fixed height
        background: theme.palette.background.paper,
        border: theme.shape.borderStandard,
        borderRadius: theme.shape.borderRadius(),
      }}
    >
      <table
        style={{
          display: 'grid',
          borderRadius: theme.shape.borderRadius(),
          background: theme.palette.background.paper,
        }}
      >
        <TableHead
          headerGroups={headerGroups}
          networkToggleData={networkToggleData}
        />
        {isLoading ? (
          <Box sx={{ height: theme.spacing(75) }} component={'colgroup'}>
            <PageLoading type="notional" />
          </Box>
        ) : (
          <TableBody rows={rows} rowVirtualizer={rowVirtualizer} />
        )}
        {isFetching && (
          <Box
            sx={{
              width: '100%',
              textAlign: 'center',
              padding: theme.spacing(2),
            }}
          >
            <FormattedMessage defaultMessage={'Loading more...'} />
          </Box>
        )}
      </table>
    </div>
  );
};

export const InfiniteScrollDataTable = (props: InfiniteScrollDataTable) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Table {...props} />
    </QueryClientProvider>
  );
};

export default InfiniteScrollDataTable;
