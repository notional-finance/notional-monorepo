import { Box, Divider, styled, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { Caption } from '@notional-finance/mui';
import { NotionalTheme } from '@notional-finance/styles';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { ThreeDotIcon } from '@notional-finance/icons';

interface CustomLinkProps {
  navKey?: string;
  id?: string;
  theme: NotionalTheme;
}

interface BottomMobileNavProps {
  options: {
    title: ReactNode;
    id: string;
    to: string;
    Icon: ReactNode;
    divider?: boolean;
  }[];
  navKey?: string;
  showMore?: boolean;
  callback?: () => void;
}

export function BottomMobileNav({
  options,
  navKey,
  showMore,
  callback,
}: BottomMobileNavProps) {
  const theme = useTheme();

  return (
    <MobileNavContainer>
      <Box sx={{ display: 'flex', width: '100vw' }}>
        {options.map(({ title, Icon, id, to, divider }, i) => (
          <>
            <NavOption key={i}>
              <CustomLink to={to} id={id} theme={theme} navKey={navKey}>
                <Box>{Icon}</Box>
                <Title id={id} theme={theme} navKey={navKey}>
                  {title}
                </Title>
              </CustomLink>
            </NavOption>
            {divider && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  height: '49px',
                  marginTop: '16px',
                  borderColor: theme.palette.borders.paper,
                }}
              />
            )}
          </>
        ))}
        {showMore && (
          <NavOption
            onClick={callback}
            sx={{
              height: '100%',
            }}
          >
            <CustomBox theme={theme} navKey={navKey} id={'showMore'}>
              <Box>
                <ThreeDotIcon
                  sx={{
                    width: theme.spacing(3),
                    fill: theme.palette.primary.light,
                  }}
                />
              </Box>
              <Title
                id="more"
                theme={theme}
                navKey={''}
                sx={{ color: theme.palette.primary.light }}
              >
                <FormattedMessage defaultMessage={'More'} />
              </Title>
            </CustomBox>
          </NavOption>
        )}
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
      height: ${theme.spacing(10)};
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
  shouldForwardProp: (prop: string) => prop !== 'navKey' && prop !== 'id',
})(
  ({ navKey, id, theme }: CustomLinkProps) => `
    background: ${
      navKey === id ? theme.palette.background.accentDefault : 'transparent'
    };
    padding: ${theme.spacing(0.5, 1)};
    border-radius: ${theme.shape.borderRadiusLarge};
    min-width: ${theme.spacing(9)};
    max-width: ${theme.spacing(9)};
    height: ${theme.spacing(8)};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  `
);

const CustomBox = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'navKey' && prop !== 'id',
})(
  ({ navKey, id, theme }: CustomLinkProps) => `
    background: ${
      navKey === id ? theme.palette.background.accentDefault : 'transparent'
    };
    padding: ${theme.spacing(0.5, 1)};
    border-radius: ${theme.shape.borderRadiusLarge};
    min-width: ${theme.spacing(9)};
    height: ${theme.spacing(8)};
    background: ${theme.palette.info.light};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  `
);

const Title = styled(Caption, {
  shouldForwardProp: (prop: string) => prop !== 'navKey' && prop !== 'id',
})(
  ({ navKey, id, theme }: CustomLinkProps) => `
    font-weight: ${
      navKey === id
        ? theme.typography.fontWeightMedium
        : theme.typography.fontWeightRegular
    };
    color: ${
      navKey === id
        ? theme.palette.typography.contrastText
        : theme.palette.typography.light
    };
  `
);

export default BottomMobileNav;
