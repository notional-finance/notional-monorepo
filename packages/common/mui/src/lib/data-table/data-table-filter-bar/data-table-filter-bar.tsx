import { useState } from 'react';
import { CSVLink } from 'react-csv';
import { styled, Box, useTheme } from '@mui/material';
import { MultiSelectDropdown } from '../../multi-select-dropdown/multi-select-dropdown';
import { Button } from '../../button/button';
import { DownloadIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';

interface DataTableFilterBarProps {
  filterBarData: any[];
  downloadCSVFormatter?: (data: any[]) => any;
  clearQueryAndFilters?: () => void;
  tableData?: any[];
}

export const DataTableFilterBar = ({
  filterBarData,
  clearQueryAndFilters,
  downloadCSVFormatter,
  tableData,
}: DataTableFilterBarProps) => {
  const [data, setData] = useState([]);
  const theme = useTheme();
  const handleFilterReset = () => {
    filterBarData.forEach(({ setSelectedOptions }) => setSelectedOptions([]));
    if (clearQueryAndFilters) {
      clearQueryAndFilters();
    }
  };

  const handleCSVClick = () => {
    if (downloadCSVFormatter && tableData) {
      setData(downloadCSVFormatter(tableData));
    }
  };

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {filterBarData.map(
          (
            { selectedOptions, setSelectedOptions, data, placeHolderText },
            index
          ) => (
            <MultiSelectDropdown
              key={index}
              options={data}
              selected={selectedOptions}
              clearQueryAndFilters={clearQueryAndFilters}
              setSelected={setSelectedOptions}
              placeHolderText={placeHolderText}
            />
          )
        )}
        {/* TODO: Add disabled mode to reset button */}
        <Box
          onClick={handleFilterReset}
          sx={{
            padding: '8px 16px',
            border: theme.shape.borderStandard,
            borderRadius: theme.shape.borderRadius(),
            fontSize: '14px',
            cursor: 'pointer',
            color: theme.palette.typography.main,
            background: theme.palette.secondary.main,
          }}
        >
          <FormattedMessage defaultMessage={'Reset'} />
        </Box>
      </Box>
      <CSVLink
        data={data}
        filename={'notional-market-data.csv'}
        target="_blank"
      >
        <Button
          onClick={() => handleCSVClick()}
          variant="outlined"
          sx={{ height: theme.spacing(6), padding: '0px 20px' }}
        >
          <FormattedMessage defaultMessage={'Download CSV'} />
          <DownloadIcon
            sx={{
              fill: theme.palette.typography.accent,
              height: theme.spacing(2),
              marginLeft: theme.spacing(1),
            }}
          />
        </Button>
      </CSVLink>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: ${theme.spacing(3)};
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

export default DataTableFilterBar;
