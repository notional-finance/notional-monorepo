import { useState } from 'react';
import {
  THEME_VARIANTS,
  PORTFOLIO_CATEGORIES,
} from '@notional-finance/shared-config';
import { Box, styled, useTheme } from '@mui/material';
import { Caption } from '@notional-finance/mui';
import { useSwipeable } from 'react-swipeable';
import { Link, useParams } from 'react-router-dom';
import {
  usePortfolioMobileNav,
  PortfolioParams,
  NAV_OPTIONS,
} from './use-portfolio-mobile-nav';
import { ArrowIcon } from '@notional-finance/icons';
import { NotionalTheme } from '@notional-finance/styles';

interface NavSliderProps {
  navoptions?: NAV_OPTIONS | null;
}

interface CustomLinkProps {
  category?: PORTFOLIO_CATEGORIES | null;
  id?: PORTFOLIO_CATEGORIES | null;
  theme: NotionalTheme;
}

export function PortfolioMobileNav() {
  const theme = useTheme();
  const { optionSetOne, optionSetTwo, defaultOptionSet } =
    usePortfolioMobileNav();
  const { category } = useParams<PortfolioParams>();

  const [navOptions, setNavOptions] = useState<NAV_OPTIONS | null>(
    defaultOptionSet
  );

  const handleSwipe = (currentOptions: NAV_OPTIONS) => {
    if (currentOptions !== navOptions) {
      setNavOptions(currentOptions);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe(NAV_OPTIONS.SET_TWO),
    onSwipedRight: () => handleSwipe(NAV_OPTIONS.SET_ONE),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <MobileNavContainer {...handlers}>
      <NavSlider navoptions={navOptions}>
        <Box sx={{ display: 'flex', width: '100vw' }}>
          {optionSetOne.map(({ title, Icon, to, id }) => (
            <NavOption key={id}>
              <CustomLink to={to} id={id} theme={theme} category={category}>
                <Box>{Icon}</Box>
                <Title to={to} id={id} theme={theme} category={category}>
                  {title}
                </Title>
              </CustomLink>
            </NavOption>
          ))}
          <ArrowContainer onClick={() => handleSwipe(NAV_OPTIONS.SET_TWO)}>
            <ArrowIcon
              sx={{
                transform: 'rotate(90deg)',
                fill: theme.palette.typography.contrastText,
                marginLeft: '2px',
              }}
            />
          </ArrowContainer>
        </Box>
        <Box sx={{ display: 'flex', width: '100vw' }}>
          <ArrowContainer onClick={() => handleSwipe(NAV_OPTIONS.SET_ONE)}>
            <ArrowIcon
              sx={{
                transform: 'rotate(-90deg)',
                fill: theme.palette.typography.contrastText,
                marginRight: '2px',
              }}
            />
          </ArrowContainer>
          {optionSetTwo.map(({ title, Icon, to, id }) => (
            <NavOption key={id}>
              <CustomLink to={to} id={id} theme={theme} category={category}>
                <Box>{Icon}</Box>
                <Title to={to} id={id} theme={theme} category={category}>
                  {title}
                </Title>
              </CustomLink>
            </NavOption>
          ))}
        </Box>
      </NavSlider>
    </MobileNavContainer>
  );
}

export const NavSlider = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'option',
})(
  ({ navoptions }: NavSliderProps) => `
  display: flex;
  transition: transform .5s ease;
  transform: ${
    navoptions === NAV_OPTIONS.SET_TWO ? 'translateX(-50%)' : 'translateX(0%)'
  };
`
);

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

const ArrowContainer = styled(Box)(
  ({ theme }) => `
    height: ${theme.spacing(6)};
    width: ${theme.spacing(6)};
    border-radius: 50%;
    background: ${theme.palette.background.accentPaper};
    display: flex;
    justify-self: center;
    align-self: center;
    justify-content: center;
    align-items: center;
    max-width: ${theme.spacing(6)};
    margin: ${theme.spacing(1)};
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
