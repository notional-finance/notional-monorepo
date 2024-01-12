import { Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

// interface ContestNftsProps {
//   hideButton?: boolean;
// }

export const ContestNfts = () => {
  return (
    <Container>
      <TitleText>
        <FormattedMessage defaultMessage={'Community partner prizes'} />
      </TitleText>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      margin-top: ${theme.spacing(6)};
  `
);

const TitleText = styled(Box)(
  ({ theme }) => `
  color: ${colors.white};
  text-align: left;
  font-family: Avenir Next;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: 10px;
  text-transform: uppercase;
  margin-bottom: ${theme.spacing(4)};
  ${theme.breakpoints.down('md')} {
    text-align: center;
    text-wrap: nowrap;
    letter-spacing: 5px;
  }
`
);

export default ContestNfts;
