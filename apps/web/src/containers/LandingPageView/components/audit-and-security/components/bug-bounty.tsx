import { useTheme, Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import immunifiLogoSvg from '@notional-finance/assets/images/logos/logo-immunefi.svg';
import { ButtonText, Button, H1 } from '@notional-finance/mui';

export const BugBounty = () => {
  const theme = useTheme();
  return (
    <Container>
      <ButtonText
        sx={{
          color: colors.neonTurquoise,
          textTransform: 'uppercase',
          display: 'flex',
          marginBottom: theme.spacing(3),
        }}
      >
        <FormattedMessage defaultMessage={'Bug Bounty'} />
        <img
          style={{ marginLeft: theme.spacing(3) }}
          id="immunefi-logo"
          src={immunifiLogoSvg}
          alt="Immunefi logo"
        />
      </ButtonText>
      <Block>
        <H1 sx={{ color: colors.white, marginBottom: theme.spacing(3) }}>
          $250,000
        </H1>
        <Button size="large" href="https://immunefi.com/bounty/notional/">
          <FormattedMessage defaultMessage={'View Bounty'} />
        </Button>
      </Block>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      width: 100%;
      ${theme.breakpoints.down(1220)} {
        width: ${theme.spacing(58)};
      }
      ${theme.breakpoints.down(1000)} {
        width: 100%;
    }
      `
);

const Block = styled(Box)(
  ({ theme }) => `
          display: flex;
          align-items: center;
          height: ${theme.spacing(32)};
          justify-content: center;
          flex-direction: column;
          border-radius: ${theme.shape.borderRadius()};
          background: linear-gradient(to right, rgb(17, 107, 117) 0%, rgb(29, 82, 106) 100%);
      `
);

export default BugBounty;
