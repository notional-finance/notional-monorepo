import { ReactNode } from 'react';
import { ToggleBarPropsType } from '../types';
import { ModuleTitle } from '../../typography/typography';
import { NotionalTheme, colors } from '@notional-finance/styles';
import { Tabs, styled, Tab, Box, useTheme } from '@mui/material';

interface DataTableToggleProps {
  toggleBarProps: ToggleBarPropsType;
  tableTitle: ReactNode;
}

interface StyledTabProps {
  theme?: NotionalTheme;
  minHeight?: string;
  width?: string;
}

export const DataTableToggle = ({
  toggleBarProps,
  tableTitle,
}: DataTableToggleProps) => {
  const theme = useTheme();
  const { toggleOption, setToggleOption, toggleData, showToggle } =
    toggleBarProps;

  return (
    <MainContainer>
      <ModuleTitle>{tableTitle}</ModuleTitle>
      {showToggle && (
        <StyledTabs
          theme={theme}
          selectionFollowsFocus={true}
          variant="fullWidth"
          defaultValue={0}
          value={toggleOption}
          onChange={(_, v) => setToggleOption(v as number)}
        >
          {toggleData.map(({ label }, i) => (
            <StyledTab
              disableRipple={true}
              theme={theme}
              key={`tab-label-${i}`}
              label={label}
            />
          ))}
        </StyledTabs>
      )}
    </MainContainer>
  );
};

const StyledTabs = styled(Tabs, {
  shouldForwardProp: (prop: string) => prop !== 'minHeight',
})(
  ({ minHeight, theme }: StyledTabProps) => `
  height: 100%;
  border-radius: ${theme?.shape.borderRadius()};
  border: ${theme?.shape.borderStandard};
  max-height: 3rem;
  min-height: unset;
  margin-top: 0px;
  margin-bottom: 0px;
  padding: 3px;
  box-shadow: ${theme?.shape.shadowStandard};
  min-height: ${minHeight};
  transition: background 0.3s ease;
  background: ${theme?.palette.background.default};
  
  .MuiTabs-indicator {
    z-index: 1;
    background: ${theme?.palette.background.paper};
    border-radius: ${theme?.shape.borderRadius()};
    height: 100%;
  }
  .MuiTabs-flexContainer {
    background: ${theme?.palette.background.default};
    height: 100%;
  }
`
);

const StyledTab = styled(Tab)(
  ({ theme }) => `
  height: 100%;
  font-family: ${theme.typography.fontFamily};
  color: ${colors.greenGrey};
  font-weight: 500;
  padding: ${theme.spacing(1)};
  z-index: 2;
  transition-delay: 0s;
  transition-duration: 0.3s;
  transition-property: all;
  min-height: unset;

  &.Mui-selected {
    color: ${theme.palette.typography.main};
  }
`
);

const MainContainer = styled(Box)(
  ({ theme }) => `
  padding: ${theme.spacing(4)};
  display: flex;
  align-items: center;
  justify-content: space-between;

`
);

export default DataTableToggle;
