import { Tab, Tabs, TabsProps, useTheme } from '@mui/material';
import { useLocation, useHistory, Link } from 'react-router-dom';
import { InvestAndEarnDropdown } from '../invest-and-earn/invest-and-earn-dropdown/invest-and-earn-dropdown';
import { BorrowDropDown } from '../borrow-dropdown/borrow-dropdown';
import { useState, useEffect } from 'react';
import { SyntheticEvent } from 'react';
import { INavLink } from '../nav-link';

/* eslint-disable-next-line */
export interface NavigationProps extends TabsProps {
  navLinks: INavLink[];
}

export function Navigation({ navLinks, ...rest }: NavigationProps) {
  const theme = useTheme();
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useState<string | false>(false);
  const { pathname } = useLocation();

  const currentTab =
    navLinks.find(({ link }) => {
      if (pathname.includes('portfolio')) {
        return link;
      }
      if (link === pathname || pathname.includes(`${link}/`)) {
        return link;
      }
      return null;
    })?.link || false;

  useEffect(() => {
    setSelectedTab(currentTab);
  }, [currentTab]);

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    event.preventDefault();
    const item = navLinks.find((t) => t.link === newValue);
    if (item && item.external) {
      window.open(newValue, item.target);
    } else {
      history.push(newValue);
    }
  };

  return (
    <>
      <Tabs
        {...rest}
        value={selectedTab}
        onChange={handleChange}
        aria-label="Notional site navigation"
        sx={{
          '.MuiTabs-vertical': {},
          '.MuiTabs-indicator': {
            height: '4px',
            background: theme.gradient.landing,
            transition: 'none',
          },
        }}
      >
        <Tab
          key={navLinks[0].key}
          icon={navLinks[0].iconImg}
          iconPosition="start"
          label={navLinks[0].label}
          to={navLinks[0].link}
          value={navLinks[0].link}
          component={Link}
          sx={{
            '&.MuiTab-root, .MuiTab-labelIcon': {
              color: theme.palette.common.black,
              opacity: 1,
              textTransform: 'capitalize',
              fontWeight: 400,
              fontSize: '1rem',
              padding: '6px 15px',
            },
            'svg.color-stroke': {
              stroke: theme.palette.common.black,
            },
            'svg.color-fill': {
              fill: theme.palette.common.black,
            },
            '&:hover': {
              // Some of the icons need to have the stroke color set, others
              // rely on the fill color being set. Class names are set in the
              // use-nav-links hook
              'svg.color-stroke': {
                stroke: theme.palette.primary.light,
              },
              'svg.color-fill': {
                fill: theme.palette.primary.light,
              },
              color: theme.palette.primary.light,
            },
          }}
        />
      </Tabs>
      <InvestAndEarnDropdown />
      <BorrowDropDown />
      <Tabs
        {...rest}
        value={selectedTab}
        onChange={handleChange}
        aria-label="Notional site navigation"
        sx={{
          '.MuiTabs-vertical': {},
          '.MuiTabs-indicator': {
            height: '4px',
            background: theme.gradient.landing,
            transition: 'none',
          },
        }}
      >
        <Tab
          key={navLinks[1].key}
          icon={navLinks[1].iconImg}
          iconPosition="start"
          label={navLinks[1].label}
          to={navLinks[1].link}
          value={navLinks[1].link}
          component={Link}
          sx={{
            '&.MuiTab-root, .MuiTab-labelIcon': {
              color: theme.palette.common.black,
              opacity: 1,
              textTransform: 'capitalize',
              fontWeight: 400,
              fontSize: '1rem',
              padding: '6px 15px',
            },
            'svg.color-stroke': {
              stroke: theme.palette.common.black,
            },
            'svg.color-fill': {
              fill: theme.palette.common.black,
            },
            '&:hover': {
              // Some of the icons need to have the stroke color set, others
              // rely on the fill color being set. Class names are set in the
              // use-nav-links hook
              'svg.color-stroke': {
                stroke: theme.palette.primary.light,
              },
              'svg.color-fill': {
                fill: theme.palette.primary.light,
              },
              color: theme.palette.primary.light,
            },
          }}
        />
      </Tabs>
    </>
  );
}

export default Navigation;
