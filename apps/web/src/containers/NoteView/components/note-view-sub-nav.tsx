import { Box, styled } from '@mui/material';
import { Button } from '@notional-finance/mui';
import { colors } from '@notional-finance/styles';

const navData = [
  {
    label: 'NOTE Summary',
    link: '/note-view/summary',
  },
  {
    label: 'Staked NOTE',
    link: '/staked-note',
  },
  {
    label: 'NOTE Supply',
    link: '/note-supply',
  },
  {
    label: 'Governance',
    link: '/governance',
  },
  {
    label: 'Delegate',
    link: '/delegate',
  },
];

export const NoteViewSubNav = () => {
  return (
    <Container>
      {navData.map(({ label, link }) => (
        <Button
          size="large"
          variant="outlined"
          onClick={() => console.log(link)}
          sx={{
            width: '151px',
            height: '40px',
            borderRadius: '40px',
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
      `
);

export default NoteViewSubNav;
