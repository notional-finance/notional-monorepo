import {
  DataTable,
  TABLE_VARIANTS,
  MobileNavWithFilter,
} from '@notional-finance/mui';
import { THEME_VARIANTS } from '@notional-finance/util';
import {
  useQualifyingProductsTableDropdowns,
  useQualifyingProductsTable,
} from './hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { ThemeProvider } from '@mui/material';

export const QualifyingProducts = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'product');
  const { dropdownsData, currencyOptions, productOptions } =
    useQualifyingProductsTableDropdowns();
  const { productsTableColumns, productsTableData } =
    useQualifyingProductsTable(currencyOptions, productOptions);

  return (
    <ThemeProvider theme={theme}>
      <DataTable
        accentCSV
        data={productsTableData}
        columns={productsTableColumns}
        tableVariant={TABLE_VARIANTS.SORTABLE}
        filterBarData={dropdownsData}
      />
      <MobileNavWithFilter filterData={dropdownsData.reverse()} />
    </ThemeProvider>
  );
};

export default QualifyingProducts;
