import { Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { NotionalIcon, ArbitrumIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';

export const ContestHeader = () => {
  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px',
          svg: {
            height: '40px',
            width: '40px',
          },
        }}
      >
        <NotionalIcon />
      </Box>

      <InnerContainer>
        <FormattedMessage
          defaultMessage={'Notional v3 Closed Beta on Arbitrum'}
        />
      </InnerContainer>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px',
          svg: {
            height: '45px',
            width: '45px',
          },
        }}
      >
        <ArbitrumIcon />
      </Box>
    </Container>
  );
};

const InnerContainer = styled(Box)(
  ({ theme }) => `
    width: 100%;
    min-height: 100%;
    background: rgba(50, 90, 122, 0.50);
    padding: ${theme.spacing(2)};
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Avenir Next;
    font-size: 24px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 10px;
    color: ${colors.white};
`
);

const Container = styled(Box)(
  ({ theme }) => `
    display: flex;
    max-width: ${theme.spacing(138)};
    width: 100%;
    margin: auto;
    margin-top: ${theme.spacing(5)};
    border: 1px solid ${colors.neonTurquoise};
    `
);

export default ContestHeader;
