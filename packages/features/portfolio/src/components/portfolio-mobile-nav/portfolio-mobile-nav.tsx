import { PORTFOLIO_CATEGORIES } from '@notional-finance/shared-config';
import { Box, styled, useTheme } from '@mui/material';
import { Caption } from '@notional-finance/mui';
import { Link, useParams } from 'react-router-dom';
import {
  usePortfolioMobileNav,
  PortfolioParams,
} from './use-portfolio-mobile-nav';
import { NotionalTheme } from '@notional-finance/styles';

interface CustomLinkProps {
  category?: PORTFOLIO_CATEGORIES | null;
  id?: PORTFOLIO_CATEGORIES | null;
  theme: NotionalTheme;
}

export function PortfolioMobileNav() {
  const theme = useTheme();
  const options = usePortfolioMobileNav();
  const { category } = useParams<PortfolioParams>();

  return (
    <MobileNavContainer>
      <Box sx={{ display: 'flex', width: '100vw' }}>
        {options.map(({ title, Icon, to, id }) => (
          <NavOption key={id}>
            <CustomLink to={to} id={id} theme={theme} category={category}>
              <Box>{Icon}</Box>
              <Title id={id} theme={theme} category={category}>
                {title}
              </Title>
            </CustomLink>
          </NavOption>
        ))}
      </Box>
    </MobileNavContainer>
  );
}

const MobileNavContainer = styled(Box)(
  ({ theme }) => `
  display: none;
  ${theme.breakpoints.down('sm')} {
    background: ${theme.palette.background.accentDefault};
    height: ${theme.spacing(9)};
    display: flex;
    width: 100%;    
    z-index: 2;
    position: fixed;
    bottom: 0;
    left: 0;
  }
`
);

const NavOption = styled(Box)(
  () => `
  flex: 1;
  justify-content: center;
  text-align: center;
  display: flex;
  align-items: center;
`
);

const CustomLink = styled(Link, {
  shouldForwardProp: (prop: string) => prop !== 'category' && prop !== 'id',
})(
  ({ category, id, theme }: CustomLinkProps) => `
  background: ${
    category === id ? theme.palette.background.paper : 'transparent'
  };
  padding: ${theme.spacing(0.5, 1)};
  border-radius: ${theme.shape.borderRadiusLarge};
  min-width: ${theme.spacing(9)};
`
);

const Title = styled(Caption, {
  shouldForwardProp: (prop: string) => prop !== 'category' && prop !== 'id',
})(
  ({ category, id, theme }: CustomLinkProps) => `
  font-weight: ${
    category === id
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular
  };
  color: ${
    category === id
      ? theme.palette.typography.main
      : theme.palette.typography.light
  };
`
);

export default PortfolioMobileNav;
