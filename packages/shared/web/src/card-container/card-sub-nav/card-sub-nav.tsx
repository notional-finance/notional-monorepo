import { styled, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { colors } from '@notional-finance/styles';
import { Button } from '@notional-finance/mui';
import { useCardSubNav } from './use-card-sub-nav';

interface StyledButtonProps {
  active: boolean;
}

export const CardSubNav = () => {
  const { pathname } = useLocation();
  const { links } = useCardSubNav();

  return (
    <StyledContainer>
      {links.map(({ title, to }) => (
        <StyledButton to={to} variant="outlined" active={to === pathname}>
          {title}
        </StyledButton>
      ))}
    </StyledContainer>
  );
};

const StyledButton = styled(Button, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ active }: StyledButtonProps) => `
    color: ${active ? colors.black : colors.white};
    background: ${active ? colors.neonTurquoise : ''};
    border: 1px solid ${colors.neonTurquoise};
    font-weight: 500;

    &:hover {
        background: ${colors.neonTurquoise};
        color: ${colors.black};
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
