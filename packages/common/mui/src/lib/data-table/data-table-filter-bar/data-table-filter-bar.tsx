import { styled, Box, useTheme } from '@mui/material';
import { MultiSelectDropdown } from '../../multi-select-dropdown/multi-select-dropdown';
import { FormattedMessage } from 'react-intl';
import SimpleToggle from '../../simple-toggle/simple-toggle';
import { DataTableToggleProps } from '../data-table';
import { useEffect, useState } from 'react';

interface DataTableFilterBarProps {
  filterBarData: any[];
  rightToggleData?: DataTableToggleProps;
  allNetworksToggleData?: DataTableToggleProps;
}

export const DataTableFilterBar = ({
  filterBarData,
  rightToggleData,
  allNetworksToggleData,
}: DataTableFilterBarProps) => {
  const theme = useTheme();
  const [resetButtonDisabled, setResetButtonDisabled] = useState(true);
  const handleFilterReset = () => {
    filterBarData.forEach(({ setSelectedOptions }) => setSelectedOptions([]));
    if (allNetworksToggleData?.setToggleKey) {
      allNetworksToggleData.setToggleKey(0);
    }
    if (rightToggleData?.setToggleKey) {
      rightToggleData.setToggleKey(0);
    }
  };

  useEffect(() => {
    filterBarData.forEach(({ selectedOptions }) => {
      if (
        selectedOptions.length > 0 ||
        (allNetworksToggleData && allNetworksToggleData?.toggleKey > 0)
      ) {
        setResetButtonDisabled(false);
        return;
      } else {
        setResetButtonDisabled(true);
      }
    });
  }, [filterBarData, allNetworksToggleData]);

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
              setSelected={setSelectedOptions}
              placeHolderText={placeHolderText}
            />
          )
        )}
        {allNetworksToggleData && (
          <SimpleToggle
            sx={{ marginRight: theme.spacing(3) }}
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
            padding: '8px 16px',
            border: theme.shape.borderStandard,
            borderRadius: theme.shape.borderRadius(),
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: 500,
            color: resetButtonDisabled
              ? theme.palette.typography.light
              : theme.palette.typography.main,
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
