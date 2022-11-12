import { Link, LinkProps, useParams } from 'react-router-dom';
import { Box, styled, useTheme, Divider } from '@mui/material';
import { defineMessages, FormattedMessage } from 'react-intl';
import { NotionalTheme } from '@notional-finance/styles';
import { useSideNav } from '../../hooks';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/shared-config';
import { H5, Label } from '@notional-finance/mui';

interface SideNavItemProps extends LinkProps {
  theme: NotionalTheme;
  selected: boolean;
  firstItem?: boolean;
}

const TOP_NAV_CATEGORIES = [
  PORTFOLIO_CATEGORIES.OVERVIEW,
  PORTFOLIO_CATEGORIES.LENDS,
  PORTFOLIO_CATEGORIES.BORROWS,
  PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY,
];

const ADV_NAV_CATEGORIES = [
  PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS,
  PORTFOLIO_CATEGORIES.LIQUIDITY,
  PORTFOLIO_CATEGORIES.STAKED_NOTE,
  PORTFOLIO_CATEGORIES.MONEY_MARKET,
];

export const navLabels = defineMessages({
  [PORTFOLIO_CATEGORIES.OVERVIEW]: {
    defaultMessage: 'Overview',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.LENDS]: {
    defaultMessage: 'Lends',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.BORROWS]: {
    defaultMessage: 'Borrows',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY]: {
    defaultMessage: 'Transaction History',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS]: {
    defaultMessage: 'Leveraged Vaults',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.LIQUIDITY]: {
    defaultMessage: 'Liquidity',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.STAKED_NOTE]: {
    defaultMessage: 'Staked NOTE',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.MONEY_MARKET]: {
    defaultMessage: 'Idle Assets',
    description: 'navigation link',
  },
});

export const SideNav = () => {
  const navData = useSideNav();
  const { category } = useParams<PortfolioParams>();
  const theme = useTheme();

  return (
    <Box>
      <Box>
        {TOP_NAV_CATEGORIES.map((id, index) => {
          const { notifications, Icon } = navData[id];

          return (
            <SideNavItem
              key={id}
              selected={category === id}
              firstItem={index === 0}
              theme={theme}
              to={`/portfolio/${id}`}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ paddingRight: '20px', display: 'flex' }}>{Icon}</Box>
                <H5
                  contrast={category === id}
                  msg={navLabels[id]}
                  sx={{ whiteSpace: 'nowrap' }}
                />
              </Box>
              {notifications > 0 && (
                <NotificationNum>{notifications}</NotificationNum>
              )}
            </SideNavItem>
          );
        })}
      </Box>
      <Divider
        sx={{
          margin: theme.spacing(4, 2, 4, 3),
          borderColor: theme.palette.borders.default,
        }}
      />
      <Box sx={{ marginBottom: '64px' }}>
        <Label padding={theme.spacing(1.5, 3)}>
          <FormattedMessage defaultMessage="Other Yield Strategies" />
        </Label>
        {ADV_NAV_CATEGORIES.map((id) => {
          const { notifications, Icon } = navData[id];
          // CHANGEME: special override for staked note
          const to =
            id === PORTFOLIO_CATEGORIES.STAKED_NOTE
              ? '/stake'
              : `/portfolio/${id}`;

          return (
            <SideNavItem
              key={id}
              selected={category === id}
              theme={theme}
              to={to}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ paddingRight: '20px', display: 'flex' }}>{Icon}</Box>
                <H5 contrast={category === id} msg={navLabels[id]} />
              </Box>
              {notifications > 0 && (
                <NotificationNum>{notifications}</NotificationNum>
              )}
            </SideNavItem>
          );
        })}
      </Box>
    </Box>
  );
};

const NotificationNum = styled(Box)(
  ({ theme }) => `
  border-radius: 50%;
  width: 1.4rem;
  height: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.palette.primary.light};
  color: ${theme.palette.background.default};
  font-size: 0.75rem;
`
);

const SideNavItem = styled(Link, {
  shouldForwardProp: (prop: string) =>
    prop !== 'selected' && prop !== 'firstItem',
})(
  ({ theme, selected, firstItem }: SideNavItemProps) => `
  background: ${selected ? theme.palette.primary.dark : 'transparent'};
  border-radius: ${selected ? '60px' : '0px'};
  padding: ${theme.spacing(1.5, 3)};
  padding-right: ${theme.spacing(1.5)};
  margin-top: ${!firstItem ? theme.spacing(1.5) : '0px'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${
    selected ? theme.palette.common.white : theme.palette.typography.light
  };
  cursor: pointer;
  &:hover {
    ${
      !selected
        ? `transition: .5s ease;
    background: ${theme.palette.borders.paper};
    border-radius: 60px;`
        : ''
    }
  }
  `
);

export default SideNav;
