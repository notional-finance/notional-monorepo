import { Box, styled, useTheme } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { useMobileWelcomeNav, PortfolioParams } from './use-mobile-welcome-nav';
import { Caption } from '@notional-finance/mui';
import { NotionalTheme } from '@notional-finance/styles';

interface CustomLinkProps {
  sideDrawerKey?: string;
  id?: string;
  theme: NotionalTheme;
}

export function MobileWelcomeNav() {
  const theme = useTheme();
  const options = useMobileWelcomeNav();
  const { sideDrawerKey } = useParams<PortfolioParams>();

  return (
    <MobileNavContainer>
      <Box sx={{ display: 'flex', width: '100vw' }}>
        {options.map(({ title, Icon, id, link }, i) => (
          <NavOption key={i}>
            <CustomLink
              to={link}
              id={id}
              theme={theme}
              sideDrawerKey={sideDrawerKey}
            >
              <Box>{Icon}</Box>
              <Title id={id} theme={theme} sideDrawerKey={sideDrawerKey}>
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
    box-shadow: 0px 10px 20px 10px rgba(20, 42, 74, 0.20);
    background: ${theme.palette.background.paper};
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
  shouldForwardProp: (prop: string) =>
    prop !== 'sideDrawerKey' && prop !== 'id',
})(
  ({ sideDrawerKey, id, theme }: CustomLinkProps) => `
  background: ${
    sideDrawerKey === id
      ? theme.palette.background.accentDefault
      : 'transparent'
  };
  padding: ${theme.spacing(0.5, 1)};
  padding-top: ${theme.spacing(1)};
  border-radius: ${theme.shape.borderRadiusLarge};
  min-width: ${theme.spacing(9)};
`
);

const Title = styled(Caption, {
  shouldForwardProp: (prop: string) =>
    prop !== 'sideDrawerKey' && prop !== 'id',
})(
  ({ sideDrawerKey, id, theme }: CustomLinkProps) => `
  font-weight: ${
    sideDrawerKey === id
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular
  };
  color: ${
    sideDrawerKey === id
      ? theme.palette.typography.contrastText
      : theme.palette.typography.main
  };
`
);

export default MobileWelcomeNav;
