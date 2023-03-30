import { styled, Box, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { colors, NotionalTheme } from '@notional-finance/styles';
import { Button } from '@notional-finance/mui';
import { useCardSubNav } from './use-card-sub-nav';

interface StyledButtonProps {
  active: boolean;
  theme: NotionalTheme;
}

export const CardSubNav = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const { links } = useCardSubNav();

  return (
    <StyledContainer>
      {links.map(({ title, to }, i) => (
        <StyledButton
          key={i}
          to={to}
          variant="outlined"
          active={to === pathname}
          theme={theme}
        >
          {title}
        </StyledButton>
      ))}
    </StyledContainer>
  );
};

const StyledButton = styled(Button, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ active, theme }: StyledButtonProps) => `
    color: ${active ? colors.black : colors.white};
    background: ${active ? colors.neonTurquoise : ''};
    border: 1px solid ${colors.neonTurquoise};
    font-weight: 500;
    

    &:hover {
      transition: all .3s ease;
        background: ${active ? colors.neonTurquoise : theme.palette.info.light};
        color: ${active ? colors.black : colors.white};
        border: 1px solid ${colors.neonTurquoise};
    }
`
);

const StyledContainer = styled(Box)(
  ({ theme }) => `
    grid-gap: ${theme.spacing(2)};
    display: flex;
    margin-bottom: ${theme.spacing(6)}; 
    ${theme.breakpoints.down('sm')} {
      display: none;
    }
`
);

export default CardSubNav;
