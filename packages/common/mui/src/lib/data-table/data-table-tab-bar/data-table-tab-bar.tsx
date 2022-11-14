import { TabBarPropsType } from '../types';
import { InfoTooltip } from '../../info-tooltip/info-tooltip';
import { Box, Tab, Tabs, useTheme } from '@mui/material';

interface DataTableTabBarProps {
  tabBarProps: TabBarPropsType;
}

export const DataTableTabBar = ({ tabBarProps }: DataTableTabBarProps) => {
  const { palette, shape } = useTheme();
  const { currentTab, setCurrentTab, tableTabs } = tabBarProps;
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Tabs
      value={currentTab}
      onChange={handleChange}
      aria-label="data table tab bar"
      sx={{
        color: palette.common.black,
        display: 'flex',
        '.MuiTabs-flexContainer': {
          justifyContent: 'space-evenly',
        },
        borderBottom: shape.borderStandard,
        '.MuiTabs-indicator': {
          height: '4px',
          background: palette.primary.light,
        },
        flex: 1,
      }}
    >
      {tableTabs.map(({ title, toolTipText }, index) => (
        <Tab
          disableRipple
          key={`table-tab-bar-${index}`}
          sx={{
            color: `${palette.common.black} !important`,
            flex: 1,
            fontSize: '0.75rem',
            padding: '25px',
            fontWeight: 700,
          }}
          label={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  paddingRight: '5px',
                  textTransform: 'capitalize',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {title}
              </Box>
              {toolTipText && <InfoTooltip toolTipText={toolTipText} />}
            </Box>
          }
        ></Tab>
      ))}
    </Tabs>
  );
};

export default DataTableTabBar;
