import { ReactNode } from 'react';
import { ToggleBarPropsType } from '../types';
import { ModuleTitle } from '../../typography/typography';
import { styled, Box, useTheme } from '@mui/material';
import { SimpleToggle } from '../../simple-toggle/simple-toggle';

interface DataTableToggleProps {
  toggleBarProps: ToggleBarPropsType;
  tableTitle: ReactNode;
  expandableTable?: boolean;
}

export const DataTableToggle = ({
  toggleBarProps,
  tableTitle,
  expandableTable,
}: DataTableToggleProps) => {
  const theme = useTheme();
  const { toggleOption, setToggleOption, toggleData, showToggle } =
    toggleBarProps;

  return (
    <MainContainer sx={{ padding: expandableTable ? theme.spacing(3) : '' }}>
      <ModuleTitle>{tableTitle}</ModuleTitle>
      {showToggle && (
        <SimpleToggle
          tabLabels={toggleData}
          selectedTabIndex={toggleOption}
          onChange={(_, v) => setToggleOption(v as number)}
        />
      )}
    </MainContainer>
  );
};

const MainContainer = styled(Box)(
  ({ theme }) => `
  padding: ${theme.spacing(4)};
  display: flex;
  align-items: center;
  justify-content: space-between;

`
);

export default DataTableToggle;
