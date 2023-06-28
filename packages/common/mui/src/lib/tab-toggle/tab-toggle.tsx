import React from 'react';
import { Tabs, styled, Tab, Box, useTheme, BoxProps } from '@mui/material';
import { TabsUnstyledProps } from '@mui/base';
import { NotionalTheme } from '@notional-finance/styles';

export interface TabToggleProps extends TabsUnstyledProps {
  selectedTabIndex: number;
  tabLabels: React.ReactNode[];
  tabPanels: React.ReactNode[];
  onChange?: (
    event: React.SyntheticEvent<Element, Event>,
    value: string | number | boolean
  ) => void;
}

interface TabPanelProps extends BoxProps {
  children: React.ReactNode;
  index: number;
  selectedIndex: number;
}

const TabPanel = ({ children, index, selectedIndex }: TabPanelProps) => {
  return <Box hidden={index !== selectedIndex}> {children} </Box>;
};

export const TabToggle = ({
  selectedTabIndex = 0,
  tabLabels,
  tabPanels,
  onChange,
}: TabToggleProps) => {
  const theme = useTheme() as NotionalTheme;
  return (
    <Container>
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
      <Box id="tab-panels">
        {tabPanels.map((p, i) => {
          return (
            <TabPanel
              index={i}
              selectedIndex={selectedTabIndex}
              key={`tab-panel-${i}`}
            >
              {p}
            </TabPanel>
          );
        })}
      </Box>
    </Container>
  );
};

const Container = styled(Box)``;

const StyledTabs = styled(Tabs)(
  ({ theme }) => `
  border-radius: 100px;
  background-color: ${theme.palette.background.default};
  min-height: unset;
  padding: ${theme.spacing(1, 2)};
  margin-top: ;
  margin-bottom: 2rem;
  box-shadow: ${theme.shape.shadowStandard};

  .MuiTabs-indicator {
    z-index: 1;
    background-color: ${theme.palette.primary.light};
    border-radius: 20px;
    height: 100%;
  }
`
);

const StyledTab = styled(Tab)(
  ({ theme }) => `
  font-family: ${theme.typography.fontFamily};
  color: ${theme.palette.background.accentDefault};
  font-weight: 500;
  background-color: transparent;
  z-index: 2;
  transition-delay: 0s;
  transition-duration: 0.3s;
  transition-property: color;
  min-height: unset;

  &.Mui-selected {
    color: ${theme.palette.common.white};
  }
`
);

export default TabToggle;
