import { Box, styled, useTheme } from '@mui/material';
import { Button } from '@notional-finance/mui';
import { colors } from '@notional-finance/styles';
import { Link } from 'react-scroll';

const navData = [
  {
    label: 'NOTE Summary',
    key: 'note-summary',
  },
  {
    label: 'Staked NOTE',
    key: 'staked-note',
  },
  {
    label: 'NOTE Supply',
    key: 'note-supply',
  },
  {
    label: 'Governance',
    key: 'governance',
  },
  {
    label: 'Delegate',
    key: 'delegate',
  },
];

export const NoteViewSubNav = () => {
  const theme = useTheme();
  return (
    <Container>
      {navData.map(({ label, key }, index) => (
        <Link
          id="ANCHOR LINK"
          key={key}
          to={key}
          smooth={true}
          spy={true}
          duration={600}
          isDynamic={true}
          offset={-130}
        >
          <Button
            key={index}
            size="large"
            variant="outlined"
            sx={{
              width: theme.spacing(19),
              height: theme.spacing(5),
              borderRadius: theme.spacing(5),
              border: `1px solid ${colors.neonTurquoise}`,
              ':hover': {
                background: colors.matteGreen,
              },
              fontFamily: 'Avenir Next',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {label}
          </Button>
        </Link>
      ))}
    </Container>
  );
};

export const Container = styled(Box)(
  ({ theme }) => `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing(3)};
    padding-bottom: ${theme.spacing(16)};
    ${theme.breakpoints.down('sm')} {
      display: none;
    }
      `
);

export default NoteViewSubNav;
