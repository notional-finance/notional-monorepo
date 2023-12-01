import { useState } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { MobileNav } from '@notional-finance/mui';
import { useSwipeable } from 'react-swipeable';
import { Link, useLocation } from 'react-router-dom';
import { useCardMobileNav, NAV_OPTIONS } from './use-card-mobile-nav';
import { ArrowIcon } from '@notional-finance/icons';
import { NotionalTheme } from '@notional-finance/styles';

interface CustomLinkProps {
  active: boolean;
  theme: NotionalTheme;
}

export function CardMobileNav() {
  const theme = useTheme();
  const { optionSetOne, optionSetTwo, optionSetThree, defaultOptionSet } =
    useCardMobileNav();
  const { pathname } = useLocation();

  const [currentScreen, setCurrentScreen] =
    useState<NAV_OPTIONS>(defaultOptionSet);

  const screens = {
    [NAV_OPTIONS.SET_ONE]: optionSetOne,
    [NAV_OPTIONS.SET_TWO]: optionSetTwo,
    [NAV_OPTIONS.SET_THREE]: optionSetThree,
  };

  const screenOrder = [
    NAV_OPTIONS.SET_ONE,
    NAV_OPTIONS.SET_TWO,
    NAV_OPTIONS.SET_THREE,
  ];

  const getNextScreen = (direction: 'left' | 'right') => {
    const currentIndex = screenOrder.indexOf(currentScreen);
    if (direction === 'left' && currentIndex < screenOrder.length - 1) {
      return screenOrder[currentIndex + 1];
    } else if (direction === 'right' && currentIndex > 0) {
      return screenOrder[currentIndex - 1];
    }
    return currentScreen;
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentScreen(getNextScreen('left')),
    onSwipedRight: () => setCurrentScreen(getNextScreen('right')),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <MobileNavContainer {...handlers}>
      <Box
        sx={{
          display: 'flex',
          width: '100vw',
        }}
      >
        {currentScreen !== NAV_OPTIONS.SET_ONE && (
          <ArrowContainer
            onClick={() => setCurrentScreen(getNextScreen('right'))}
          >
            <ArrowIcon
              sx={{
                transform: 'rotate(-90deg)',
                fill: theme.palette.typography.contrastText,
                marginLeft: '2px',
              }}
            />
          </ArrowContainer>
        )}
        {screens[currentScreen].map(({ title, Icon, to, id }) => (
          <NavOption key={id}>
            <CustomLink to={to} theme={theme} active={pathname === to}>
              <Box sx={{ height: theme.spacing(3) }}>{Icon}</Box>
              <Title theme={theme} active={pathname === to}>
                {title}
              </Title>
            </CustomLink>
          </NavOption>
        ))}
        {currentScreen !== NAV_OPTIONS.SET_THREE && (
          <ArrowContainer
            onClick={() => setCurrentScreen(getNextScreen('left'))}
          >
            <ArrowIcon
              sx={{
                transform: 'rotate(90deg)',
                fill: theme.palette.typography.contrastText,
                marginLeft: '2px',
              }}
            />
          </ArrowContainer>
        )}
      </Box>
    </MobileNavContainer>
  );
}

const MobileNavContainer = styled(Box)(
  ({ theme }) => `
  display: none;
  ${theme.breakpoints.down('sm')} {
    background: ${theme.palette.background.accentDefault};
    height: fit-content;
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
  width: 60px;
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
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ active, theme }: CustomLinkProps) => `
  background: ${active ? theme.palette.background.paper : 'transparent'};
  padding: ${theme.spacing(0.5, 1)};
  margin: ${theme.spacing(1)};
  border-radius: ${theme.shape.borderRadiusLarge};
  min-width: ${theme.spacing(9)};
`
);

const Title = styled(MobileNav, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ active, theme }: CustomLinkProps) => `
  width: 60px;
  font-weight: ${
    active
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular
  };
  color: ${
    active ? theme.palette.typography.main : theme.palette.typography.light
  };
`
);
export default CardMobileNav;
