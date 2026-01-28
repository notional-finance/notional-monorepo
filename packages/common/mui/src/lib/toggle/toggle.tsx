import React from 'react';
import { Tabs, styled, Tab, Box, useTheme, TabsProps } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';

export interface ToggleProps extends TabsProps {
  selectedTabIndex: number;
  tabLabels: React.ReactNode[];
  onChange?: (
    event: React.SyntheticEvent<Element, Event>,
    value: string | number | boolean
  ) => void;
}

export const Toggle = ({
  selectedTabIndex = 0,
  tabLabels,
  onChange,
}: ToggleProps) => {
  const theme = useTheme() as NotionalTheme;
  return (
    <Container theme={theme}>
      <StyledTabs
        theme={theme}
        variant="fullWidth"
        defaultValue={0}
        value={selectedTabIndex}
        onChange={onChange}
      >
        {tabLabels.map((l, i) => {
          return (
            <StyledTab
              disableRipple={true}
              theme={theme}
              key={`tab-label-${i}`}
              label={l}
            />
          );
        })}
      </StyledTabs>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
  height: 100%;
  background: ${theme?.palette.common.white};
  border-radius: 32px;
`
);

const StyledTabs = styled(Tabs)(
  ({ theme }) => `
  height: 100%;
  border-radius: ${theme?.spacing(4)};
  border: ${theme?.shape.borderStandard};
  background: transparent;
  margin-top: 0px;
  margin-bottom: 0px;
  transition: background 0.3s ease;

  .MuiTabs-indicator {
    z-index: 1;
    background: ${theme?.palette.info.light};
    border-radius: ${theme?.spacing(4)};
    height: 100%;
  }
  .MuiTabs-flexContainer {
    display: inline;
    height: 100%;
  }
`
);

const StyledTab = styled(Tab)(
  ({ theme }) => `
  height: 100%;
  background-color: transparent;
  z-index: 2;
  transition-delay: 0s;
  transition-duration: 0.3s;
  transition-property: all;
  min-height: unset;
  font-weight: 500 !important;
  color: ${theme?.palette.typography.light};
  padding: ${theme?.spacing(1, 3)};

  &.Mui-selected {
    font-weight: 600 !important;
    color: ${theme?.palette.typography.accent};
  }
  &:hover {
    background: ${theme.palette.info.light};
    border-radius: 50px;
  }
`
);

export default Toggle;
