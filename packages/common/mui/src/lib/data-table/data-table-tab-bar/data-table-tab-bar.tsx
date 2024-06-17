import { TabBarPropsType, ToggleBarPropsType } from '../types';
import { InfoTooltip } from '../../info-tooltip/info-tooltip';
import { Subtitle } from '../../typography/typography';
import { Box, Tab, Tabs, useTheme } from '@mui/material';
import { SimpleToggle } from '../../simple-toggle/simple-toggle';

interface DataTableTabBarProps {
  tabBarProps: TabBarPropsType;
  tabsThatIncludeToggle?: number[];
  toggleBarProps?: ToggleBarPropsType;
}

export const DataTableTabBar = ({
  tabBarProps,
  toggleBarProps,
  tabsThatIncludeToggle,
}: DataTableTabBarProps) => {
  const theme = useTheme();
  const { currentTab, setCurrentTab, tableTabs } = tabBarProps;
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: theme.spacing(3),
      }}
    >
      <Tabs
        value={currentTab}
        onChange={handleChange}
        aria-label="data table tab bar"
        sx={{
          maxWidth: '500px',
          color: theme.palette.common.black,
          display: 'flex',
          '.MuiTabs-flexContainer': {
            justifyContent: 'start',
          },
          '.MuiTabs-indicator': {
            height: '2px',
            background: theme.palette.primary.light,
          },
          flex: 1,
        }}
      >
        {tableTabs.map(({ title, toolTipText }, index) => (
          <Tab
            disableRipple
            key={`table-tab-bar-${index}`}
            sx={{
              flex: 1,
              width: 'fit-content',
              maxWidth: 'fit-content',
              padding: theme.spacing(3),
              fontWeight: 700,
              '&:hover': {
                background: theme.palette.info.light,
              },
            }}
            label={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Subtitle
                  sx={{
                    whiteSpace: 'nowrap',
                    fontWeight: currentTab === index ? 600 : '',
                    color:
                      currentTab === index
                        ? theme.palette.primary.light
                        : theme.palette.typography.light,
                  }}
                >
                  {title}
                </Subtitle>
                {toolTipText && <InfoTooltip toolTipText={toolTipText} />}
              </Box>
            }
          ></Tab>
        ))}
      </Tabs>
      {toggleBarProps &&
        toggleBarProps.showToggle &&
        tabsThatIncludeToggle?.includes(currentTab) && (
          <SimpleToggle
            tabLabels={toggleBarProps.toggleData}
            selectedTabIndex={toggleBarProps.toggleOption}
            onChange={(_, v) => toggleBarProps.setToggleOption(v as number)}
          />
        )}
    </Box>
  );
};

export default DataTableTabBar;
