import { styled, Box, useTheme } from '@mui/material';
import { MultiSelectDropdown } from '../../multi-select-dropdown/multi-select-dropdown';
import { NetworkToggle } from '../../network-toggle/network-toggle';
import { FormattedMessage } from 'react-intl';
import SimpleToggle from '../../simple-toggle/simple-toggle';
import { DataTableToggleProps } from '../data-table';
import { useEffect, useState } from 'react';
import { Body } from '../../typography/typography';

interface DataTableFilterBarProps {
  filterBarData: any[];
  rightToggleData?: DataTableToggleProps;
  allNetworksToggleData?: DataTableToggleProps;
  networkToggleData?: {
    toggleKey: number;
    setToggleKey: (v: number) => void;
  };
}

export const DataTableFilterBar = ({
  filterBarData,
  rightToggleData,
  allNetworksToggleData,
  networkToggleData,
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
            sx={{
              marginRight: theme.spacing(3),
            }}
            tabVariant="standard"
            tabLabels={allNetworksToggleData.toggleOptions}
            selectedTabIndex={allNetworksToggleData.toggleKey}
            onChange={(_, v) => allNetworksToggleData.setToggleKey(v as number)}
          />
        )}
        <Body
          onClick={handleFilterReset}
          sx={{
            padding: theme.spacing(1, 2),
            border: theme.shape.borderStandard,
            borderRadius: theme.shape.borderRadius(),
            cursor: 'pointer',
            color: resetButtonDisabled
              ? theme.palette.typography.light
              : theme.palette.typography.main,
            background: theme.palette.secondary.main,
          }}
        >
          <FormattedMessage defaultMessage={'Reset'} />
        </Body>
      </Box>
      {rightToggleData && (
        <SimpleToggle
          tabLabels={rightToggleData.toggleOptions}
          selectedTabIndex={rightToggleData.toggleKey}
          onChange={(_, v) => rightToggleData.setToggleKey(v as number)}
        />
      )}
      {networkToggleData && (
        <NetworkToggle
          selectedNetwork={networkToggleData.toggleKey}
          handleNetworkToggle={networkToggleData.setToggleKey}
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
  padding: ${theme.spacing(3)};
  border-bottom: ${theme.shape.borderStandard};
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

export default DataTableFilterBar;
