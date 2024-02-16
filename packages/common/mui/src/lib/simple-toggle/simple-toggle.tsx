import React from 'react';
import { Tabs, styled, Tab, Box, useTheme } from '@mui/material';
import { TabsUnstyledProps } from '@mui/base';
import { NotionalTheme } from '@notional-finance/styles';

export interface SimpleToggleProps extends TabsUnstyledProps {
  selectedTabIndex: number;
  tabLabels: React.ReactNode[];
  onChange?: (
    event: React.SyntheticEvent<Element, Event>,
    value: string | number | boolean
  ) => void;
  minHeight?: string;
  width?: string;
}

interface StyledTabProps {
  theme: NotionalTheme;
}

export const SimpleToggle = ({
  selectedTabIndex = 0,
  tabLabels,
  onChange,
}: SimpleToggleProps) => {
  const theme = useTheme() as NotionalTheme;
  return (
    <Container theme={theme}>
      <StyledTabs
        theme={theme}
        selectionFollowsFocus={true}
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

const Container = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'width',
})(
  ({ theme }: StyledTabProps) => `
  height: 100%;
  background: ${theme.palette.background.paper};
  border-radius: ${theme.shape.borderRadius()};
`
);

const StyledTabs = styled(Tabs)(
  ({ theme }: StyledTabProps) => `
  height: 100%;
  border-radius: ${theme.shape.borderRadius()};
  border: ${theme?.shape.borderStandard};
  padding: 2px;
  box-shadow: ${theme?.shape.shadowStandard};
  transition: background 0.3s ease;
  min-height: ${theme.spacing(4.75)};
  
  .MuiTabs-indicator {
    z-index: 1;
    background: ${theme.palette.info.light};
    border-radius: ${theme.shape.borderRadius()};
    height: 100%;
  }
  .MuiTabs-flexContainer {
    height: 100%;
  }
`
);

const StyledTab = styled(Tab)(
  ({ theme }) => `
  height: 100%;
  font-family: ${theme.typography.fontFamily};
  color: ${theme.palette.typography.main};
  font-weight: 500;
  z-index: 2;
  transition-delay: 0s;
  transition-duration: 0.3s;
  transition-property: all;
  min-height: unset;
  padding: ${theme.spacing(0.5, 2)};

  &.Mui-selected {
    color: ${theme.palette.typography.main};
  }
`
);

export default SimpleToggle;
