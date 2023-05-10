import React from 'react';
import { Tabs, styled, Tab, Box, useTheme } from '@mui/material';
import { TabsUnstyledProps } from '@mui/base';
import { NotionalTheme, colors } from '@notional-finance/styles';

export interface ToggleProps extends TabsUnstyledProps {
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
  theme?: NotionalTheme;
  minHeight?: string;
  width?: string;
}

export const Toggle = ({
  selectedTabIndex = 0,
  tabLabels,
  onChange,
  minHeight,
  width,
}: ToggleProps) => {
  const theme = useTheme() as NotionalTheme;
  return (
    <Container width={width}>
      <StyledTabs
        minHeight={minHeight}
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
  ({ width }: StyledTabProps) => `
  height: 100%;
  width: ${width};
  background: ${colors.black};
  border-radius: 32px;
`
);

const StyledTabs = styled(Tabs, {
  shouldForwardProp: (prop: string) => prop !== 'minHeight',
})(
  ({ minHeight, theme }: StyledTabProps) => `
  height: 100%;
  border-radius: ${theme?.spacing(4)};
  border: 1px solid ${colors.blueGreen};
  background: transparent;
  max-height: 3rem;
  min-height: unset;
  margin-top: 0px;
  margin-bottom: 0px;
  padding: 3px;
  box-shadow: ${theme?.shape.shadowStandard};
  min-height: ${minHeight};
  transition: background 0.3s ease;

  ${theme?.gradient.hoverTransition('transparent', theme?.palette.info.light)}

  .MuiTabs-indicator {
    z-index: 1;
    background: ${theme?.gradient.landing};
    border-radius: ${theme?.spacing(4)};
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
  color: ${colors.greenGrey};
  font-weight: 500;
  background-color: transparent;
  z-index: 2;
  transition-delay: 0s;
  transition-duration: 0.3s;
  transition-property: all;
  min-height: unset;

  &.Mui-selected {
    color: ${colors.white};
  }
`
);

export default Toggle;
