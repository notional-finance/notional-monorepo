import { useState } from 'react';
import { CSVLink } from 'react-csv';
import { Box, useTheme } from '@mui/material';
import { MultiSelectDropdown } from '../../multi-select-dropdown/multi-select-dropdown';
import { Button } from '../../button/button';
import { DownloadIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';

interface DataTableFilterBarProps {
  filterBarData: any[];
  downloadCSVFormatter?: (data: any[]) => any;
  tableData?: any[];
}

export const DataTableFilterBar = ({
  filterBarData,
  downloadCSVFormatter,
  tableData,
}: DataTableFilterBarProps) => {
  const [data, setData] = useState([]);
  const theme = useTheme();
  const handleFilterReset = () => {
    filterBarData.forEach(({ setSelectedOptions }) => setSelectedOptions([]));
  };

  const handleCSVClick = () => {
    if (downloadCSVFormatter && tableData) {
      setData(downloadCSVFormatter(tableData));
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: theme.spacing(3),
      }}
    >
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
              setSelected={setSelectedOptions}
              placeHolderText={placeHolderText}
            />
          )
        )}
        <Button
          onClick={handleFilterReset}
          variant="outlined"
          sx={{ height: theme.spacing(6), padding: '0px 20px' }}
        >
          <FormattedMessage defaultMessage={'Reset'} />
        </Button>
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
    </Box>
  );
};

export default DataTableFilterBar;
