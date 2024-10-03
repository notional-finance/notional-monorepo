import { Tab, TabsProps, useTheme, Box } from '@mui/material';
import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { INavLink } from '../nav-link';

 
export interface NavigationProps extends TabsProps {
  navLinks: INavLink[];
}

export function Navigation({ navLinks }: NavigationProps) {
  const theme = useTheme();
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
  const leftNavLinks = navLinks.filter((navLink) => navLink.key !== 'note');
  const rightNavLinks = navLinks.filter((navLink) => navLink.key === 'note');

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
    >
      <Box sx={{ display: 'flex' }}>
        {leftNavLinks.map((navLink: INavLink, index) => {
          return navLink.CustomComponent ? (
            <navLink.CustomComponent key={index} />
          ) : (
            <Box key={index}>
              <Tab
                key={navLink?.key}
                icon={navLink?.iconImg}
                iconPosition="start"
                label={navLink?.label}
                to={navLink?.link || ''}
                value={navLink?.link}
                component={Link}
                disableRipple
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
              <Box
                sx={{
                  display: navLink?.link === selectedTab ? 'block' : 'none',
                  marginTop: '-3px',
                  width: '100%',
                  height: '4px',
                  background: theme.palette.primary.light,
                }}
              />
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex' }}>
        {rightNavLinks.map((navLink: INavLink, index) => (
          <Box key={index}>
            <Tab
              key={navLink?.key}
              icon={navLink?.iconImg}
              iconPosition="start"
              label={navLink?.label}
              to={navLink?.link || ''}
              value={navLink?.link}
              component={Link}
              disableRipple
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
                  '.note-hover-color': {
                    fill: theme.palette.primary.light,
                  },
                  '.note-hover-color-stroke': {
                    stroke: theme.palette.primary.light,
                  },
                  color: theme.palette.primary.light,
                },
              }}
            />
            <Box
              sx={{
                display: navLink?.link === selectedTab ? 'block' : 'none',
                marginTop: '-3px',
                width: '100%',
                height: '4px',
                background: theme.palette.primary.light,
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default Navigation;
