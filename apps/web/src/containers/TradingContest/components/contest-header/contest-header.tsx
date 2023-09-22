import { Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { NotionalIcon, ArbitrumIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';

export const ContestHeader = () => {
  return (
    <Container>
      <ImgWrapper
        sx={{
          svg: {
            height: '40px',
            width: '40px',
          },
        }}
      >
        <NotionalIcon />
      </ImgWrapper>
      <InnerContainer>
        <FormattedMessage
          defaultMessage={'Notional v3 Closed Beta on Arbitrum'}
        />
      </InnerContainer>
      <ImgWrapper
        sx={{
          svg: {
            height: '40px',
            width: '40px',
          },
        }}
      >
        <ArbitrumIcon />
      </ImgWrapper>
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
    ${theme.breakpoints.down('md')} {
      min-width: 100%;
    }
`
);

const Container = styled(Box)(
  ({ theme }) => `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: ${theme.spacing(5)};
    border: 1px solid ${colors.neonTurquoise};
    ${theme.breakpoints.down('md')} {
      display: block;
      border: none;
      margin-top: 13px;
    }
    `
);

const ImgWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  ${theme.breakpoints.down('md')} {
    display: none;
  }
  ,
    `
);

export default ContestHeader;
