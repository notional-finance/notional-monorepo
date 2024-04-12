import { useTheme, TableRow, Box } from '@mui/material';
import { flexRender } from '@tanstack/react-table';
import { TableColumnHeading } from '../typography/typography';
import { DataTableToggleProps } from '../data-table/data-table';
import SimpleToggle from '../simple-toggle/simple-toggle';

interface TableHeadProps {
  headerGroups: any[];
  networkToggleData: DataTableToggleProps;
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
          width: '100%',
        }}
      >
        <Box sx={{ width: 'fit-content', height: 'fit-content' }}>
          <SimpleToggle
            sx={{
              marginRight: theme.spacing(3),
            }}
            tabVariant="standard"
            tabLabels={networkToggleData.toggleOptions}
            selectedTabIndex={networkToggleData.toggleKey}
            onChange={(_, v) => networkToggleData.setToggleKey(v as number)}
          />
        </Box>
      </Box>
      {headerGroups.map((headerGroup) => (
        <TableRow key={headerGroup.id} sx={{ display: 'flex', width: '100%' }}>
          {headerGroup.headers.map((header) => {
            return (
              <TableColumnHeading
                key={header.id}
                sx={{
                  display: 'flex',
                  width: '100%',
                  whiteSpace: 'nowrap',
                  padding: theme.spacing(2),
                }}
              >
                <div>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </div>
              </TableColumnHeading>
            );
          })}
        </TableRow>
      ))}
    </thead>
  );
};
