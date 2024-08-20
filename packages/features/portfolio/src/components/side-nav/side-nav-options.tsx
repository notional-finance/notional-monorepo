import { Box, styled, useTheme } from '@mui/material';
import { useSideNav } from '../../hooks';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { Link, LinkProps, useParams } from 'react-router-dom';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import { NotionalTheme } from '@notional-finance/styles';
import { H5, Caption } from '@notional-finance/mui';
import { navLabels } from './messages';

interface SideNavItemProps extends LinkProps {
  theme: NotionalTheme;
  selected?: boolean;
  open?: boolean;
}
interface DividerProps {
  theme: NotionalTheme;
  open?: boolean;
}
interface SideNavOptonsProps {
  open?: boolean;
}

export const SideNavOptons = ({ open }: SideNavOptonsProps) => {
  const theme = useTheme();
  const { sideNavOptions } = useSideNav();
  const { category } = useParams<PortfolioParams>();

  const lastNavOption = sideNavOptions[sideNavOptions.length - 1];

  return (
    <Box>
      {sideNavOptions.map(({ id, Icon, notifications, to }, index) => {
        return (
          <Box key={index}>
            {lastNavOption.id === id && (
              <Box
                sx={{
                  height: theme.spacing(8),
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Divider theme={theme} open={open} />
              </Box>
            )}
            <SideNavItem
              key={id}
              selected={
                category
                  ? category === id
                  : id === PORTFOLIO_CATEGORIES.OVERVIEW
              }
              theme={theme}
              to={to}
            >
              <Box sx={{ paddingRight: theme.spacing(4), display: 'flex' }}>
                {Icon}
                {notifications > 0 && open === false && <Dot></Dot>}
              </Box>
              <TitleWrapper>
                <H5
                  contrast={category === id}
                  msg={navLabels[id]}
                  sx={{ whiteSpace: 'nowrap' }}
                />
                <Box sx={{ paddingLeft: theme.spacing(2) }}>
                  {notifications > 0 && (
                    <NotificationNum>{notifications}</NotificationNum>
                  )}
                </Box>
              </TitleWrapper>
            </SideNavItem>
          </Box>
        );
      })}
    </Box>
  );
};

const NotificationNum = styled(Caption)(
  ({ theme }) => `
    border-radius: 50%;
    width: 1.4rem;
    height: 1.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.palette.primary.light};
    color: ${theme.palette.background.default};
  `
);

const TitleWrapper = styled(Box)(
  () => `
    display: flex;
    align-content: center;
    align-items: center;
    flex: 1;
    justify-content: space-between;
  `
);

const Dot = styled(Box)(
  ({ theme }) => `
    height: 10px;
    width: 10px;
    background-color: ${theme.palette.typography.accent};
    border-radius: 50%;
    display: none;
    margin-left: -3px;
    margin-top: -2px;
    ${theme.breakpoints.down('xxl')} {
      display: inline-block;
    }
  `
);

const SideNavItem = styled(Link, {
  shouldForwardProp: (prop: string) => prop !== 'selected',
})(
  ({ theme, selected }: SideNavItemProps) => `
    height: ${theme.spacing(8)};
    width: 100%;
    background: ${selected ? theme.palette.primary.dark : 'transparent'};
    border-radius: 0px;
    padding-left: ${theme.spacing(3.5)};
    padding-right: ${theme.spacing(3.5)};
    display: flex;
    align-items: center;
    justify-content: flex-start;
    cursor: pointer;
    color: ${
      selected ? theme.palette.common.white : theme.palette.typography.light
    };
    &:hover {
      ${
        !selected
          ? `transition: .5s ease;
          background: ${theme.palette.borders.paper};
          `
          : ''
      }
      cursor: pointer;
    }
    `
);

const Divider = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'open',
})(
  ({ theme, open }: DividerProps) => `
    height: 2px;
    width: ${open ? '89%' : theme.spacing(6)};
    margin-left: ${theme.spacing(2)};
    background: ${theme.palette.borders.paper};
    ${theme.breakpoints.up('xxl')} {
      width: 89%;
    }
    `
);

export default SideNavOptons;
