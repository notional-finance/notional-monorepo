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
  ...tabsProps
}: ToggleProps) => {
  const theme = useTheme() as NotionalTheme;
  return (
    <Container theme={theme}>
      <StyledTabs
        theme={theme}
        variant="fullWidth"
        value={selectedTabIndex}
        onChange={onChange}
        TabIndicatorProps={{ children: <IndicatorPill theme={theme} /> }}
        {...tabsProps}
      >
        {tabLabels.map((l, i) => {
          return (
            <StyledTab
              disableRipple
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
  display: inline-flex;
  align-items: center;
  height: ${theme?.spacing(5.5)};
  background: ${theme?.palette.common.white};
  border-radius: ${theme?.spacing(6.5)};
`
);

const StyledTabs = styled(Tabs)(
  ({ theme }) => `
  height: 100%;
  min-height: unset;
  border-radius: ${theme?.spacing(6.5)};
  background: transparent;
  overflow: hidden;

  .MuiTabs-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${theme?.spacing(5)};
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    z-index: 1;
  }

  .MuiTabs-flexContainer {
    height: 100%;
    align-items: center;
  }
`
);

const IndicatorPill = styled(Box)(
  ({ theme }) => `
  width: 100%;
  height: 100%;
  border-radius: ${theme?.spacing(6.5)};
  background: ${theme?.palette.info.light};
`
);

const StyledTab = styled(Tab)(
  ({ theme }) => `
  height: ${theme?.spacing(5)};
  background-color: transparent;
  min-height: unset;
  min-width: ${theme?.spacing(14)};
  z-index: 2;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600 !important;
  color: ${theme?.palette.typography.light};
  padding: ${theme?.spacing(1, 2)};
  text-transform: none;
  border-radius: ${theme?.spacing(6.5)};

  &.Mui-selected {
    font-weight: 600 !important;
    color: ${theme?.palette.typography.accent};
  }
  &:hover {
    background: transparent;
  }
`
);

export default Toggle;
