import { DataTable } from '@notional-finance/mui';
import { THEME_VARIANTS } from '@notional-finance/util';
import { useMyBreakdownTable } from './hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { ThemeProvider } from '@mui/material';
import { observer } from 'mobx-react-lite';

const MyBreakdown = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'product');

  const { tableColumns, tableData } = useMyBreakdownTable();
  return (
    <ThemeProvider theme={theme}>
      <DataTable data={tableData} columns={tableColumns} />
    </ThemeProvider>
  );
};

export default observer(MyBreakdown);
