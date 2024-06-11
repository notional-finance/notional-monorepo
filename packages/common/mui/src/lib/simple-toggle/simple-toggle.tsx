import React from 'react';
import { Tabs, styled, Tab, Box, useTheme, SxProps } from '@mui/material';
import { TabsUnstyledProps } from '@mui/base';
import { NotionalTheme } from '@notional-finance/styles';

export interface SimpleToggleProps extends TabsUnstyledProps {
  selectedTabIndex: number;
  tabLabels: React.ReactNode[];
  tabVariant?: 'standard' | 'scrollable' | 'fullWidth' | undefined;
  onChange?: (
    event: React.SyntheticEvent<Element, Event>,
    value: string | number | boolean
  ) => void;
  minHeight?: string;
  width?: string;
  sx?: SxProps;
}

export const SimpleToggle = ({
  selectedTabIndex = 0,
  tabVariant = 'fullWidth',
  tabLabels,
  onChange,
  sx,
}: SimpleToggleProps) => {
  const theme = useTheme() as NotionalTheme;
  return (
    <Container theme={theme}>
      <StyledTabs
        theme={theme}
        selectionFollowsFocus={true}
        variant={tabVariant}
        defaultValue={0}
        value={selectedTabIndex}
        onChange={onChange}
        sx={{ ...sx }}
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
  background: ${theme.palette.background.paper};
  border-radius: ${theme.shape.borderRadius()};
`
);

const StyledTabs = styled(Tabs)(
  ({ theme }) => `
  height: 100%;
  border-radius: ${theme.shape.borderRadius()};
  border: ${theme?.shape.borderStandard};
  padding: 2px;
  transition: background 0.3s ease;
  min-height: ${theme.spacing(4.75)};

  .MuiButtonBase-root {
    min-width: 0px;
  };
  
  .MuiTabs-indicator {
    z-index: 1;
    background: ${theme.palette.info.light};
    border-radius: ${theme.shape.borderRadius()};
    height: 100%;
  };
  .MuiTabs-flexContainer {
    height: 100%;
  };
`
);

const StyledTab = styled(Tab)(
  ({ theme }) => `
  height: 100%;
  font-family: ${theme.typography.fontFamily};
  color: ${theme.palette.typography.light};
  font-weight: 500;
  z-index: 2;
  transition-delay: 0s;
  transition-duration: 0.3s;
  transition-property: all;
  min-height: unset;
  padding: ${theme.spacing(1)};

  svg {
    fill: ${theme.palette.typography.light};
  }

  &.Mui-selected {
    svg {
      fill: ${theme.palette.typography.main};
    }
    color: ${theme.palette.typography.main};
    div {
      color: ${theme.palette.typography.main};
    }
  }
`
);

export default SimpleToggle;
