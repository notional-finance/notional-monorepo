import { styled, Box, useTheme } from '@mui/material';
import { MultiSelectDropdown } from '../../multi-select-dropdown/multi-select-dropdown';
import { FormattedMessage } from 'react-intl';
import SimpleToggle from '../../simple-toggle/simple-toggle';
import { DataTableToggleProps } from '../data-table';

interface DataTableFilterBarProps {
  filterBarData: any[];
  rightToggleData?: DataTableToggleProps;
  allNetworksToggleData?: DataTableToggleProps;
  clearQueryAndFilters?: () => void;
}

export const DataTableFilterBar = ({
  filterBarData,
  rightToggleData,
  allNetworksToggleData,
  clearQueryAndFilters,
}: DataTableFilterBarProps) => {
  const theme = useTheme();
  const handleFilterReset = () => {
    filterBarData.forEach(({ setSelectedOptions }) => setSelectedOptions([]));
    if (clearQueryAndFilters) {
      clearQueryAndFilters();
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
        {allNetworksToggleData && (
          <SimpleToggle
            tabVariant="standard"
            tabLabels={allNetworksToggleData.toggleOptions}
            selectedTabIndex={allNetworksToggleData.toggleKey}
            onChange={(_, v) => allNetworksToggleData.setToggleKey(v as number)}
          />
        )}
        {/* TODO: Add disabled mode to reset button */}
        <Box
          onClick={handleFilterReset}
          sx={{
            marginLeft: theme.spacing(3),
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
      {rightToggleData && (
        <SimpleToggle
          tabLabels={rightToggleData.toggleOptions}
          selectedTabIndex={rightToggleData.toggleKey}
          onChange={(_, v) => rightToggleData.setToggleKey(v as number)}
        />
      )}
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
