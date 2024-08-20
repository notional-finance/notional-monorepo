import { DataTable } from '@notional-finance/mui';
import { THEME_VARIANTS } from '@notional-finance/util';
import { useMyBreakdownTable } from './hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { ThemeProvider } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { usePointsDashboardStore } from './init-points-dashboard';

export const MyBreakdown = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'product');
  const { arbPoints } = usePointsDashboardStore();

  const { tableColumns, tableData } = useMyBreakdownTable(arbPoints);
  return (
    <ThemeProvider theme={theme}>
      <DataTable data={tableData} columns={tableColumns} />
    </ThemeProvider>
  );
};

export default observer(MyBreakdown);
