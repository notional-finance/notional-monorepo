import { useTheme, TableRow, Box } from '@mui/material';
import { flexRender } from '@tanstack/react-table';
import { TableColumnHeading } from '../typography/typography';
import { NetworkToggle } from '../network-toggle/network-toggle';

interface TableHeadProps {
  headerGroups: any[];
  networkToggleData: {
    toggleKey: number;
    setToggleKey: (v: number) => void;
  };
}

export const TableHead = ({
  headerGroups,
  networkToggleData,
}: TableHeadProps) => {
  const theme = useTheme();
  return (
    <thead
      style={{
        display: 'grid',
        position: 'sticky',
        background: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius(),
        top: 0,
        zIndex: 3,
      }}
    >
      <Box
        sx={{
          padding: theme.spacing(3, 2),
          borderBottom: theme.shape.borderStandard,
          width: '100%',
        }}
      >
        <Box sx={{ width: 'fit-content', height: 'fit-content' }}>
          <NetworkToggle
            selectedNetwork={networkToggleData.toggleKey}
            handleNetworkToggle={networkToggleData.setToggleKey}
          />
        </Box>
      </Box>
      {headerGroups.map((headerGroup) => (
        <TableRow key={headerGroup.id} sx={{ display: 'flex', width: '100%' }}>
          {headerGroup.headers.map((header, i) => {
            return (
              <TableColumnHeading
                key={i}
                sx={{
                  display: 'flex',
                  justifyContent: header.column.columnDef.textAlign || '',
                  width: '100%',
                  minWidth: header.column.columnDef.minWidth || 'auto',
                  whiteSpace: 'nowrap',
                  padding: theme.spacing(2),
                }}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </TableColumnHeading>
            );
          })}
        </TableRow>
      ))}
    </thead>
  );
};
