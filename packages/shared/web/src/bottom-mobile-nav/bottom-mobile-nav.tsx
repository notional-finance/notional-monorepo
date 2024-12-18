import { Box, styled, useTheme } from '@mui/material';
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
      <Box
        sx={{
          display: 'flex',
          width: '100vw',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {options.map(({ title, Icon, id, to }, i) => (
          <NavOption key={i}>
            <CustomLink to={to} id={id} theme={theme} navKey={navKey}>
              <Box>{Icon}</Box>
              <Title id={id} theme={theme} navKey={navKey}>
                {title}
              </Title>
            </CustomLink>
          </NavOption>
        ))}
        {showMore && (
          <NavOption
            onClick={callback}
            sx={{
              borderRadius: '10px',
              background: theme.palette.info.light,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'column',
              height: '100%',
              maxWidth: '64px',
              padding: '8px',
            }}
          >
            <ThreeDotIcon
              sx={{
                width: theme.spacing(2),
                fill: theme.palette.primary.light,
              }}
            />
            <Title
              id="more"
              theme={theme}
              navKey={''}
              sx={{ color: theme.palette.primary.light }}
            >
              <FormattedMessage defaultMessage={'More'} />
            </Title>
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
      height: fit-content;
      padding: ${theme.spacing(1)};
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
    max-width: 84px;
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
    padding-top: ${theme.spacing(1)};
    border-radius: ${theme.shape.borderRadiusLarge};
    min-width: ${theme.spacing(9)};
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
        : theme.palette.typography.main
    };
  `
);

export default BottomMobileNav;
