import { colors } from '@notional-finance/styles';
import { BodySecondary } from '@notional-finance/mui';
import { Box, styled } from '@mui/material';

export const TitleText = styled(Box)(
  ({ theme }) => `
      color: ${colors.white};
      font-family: Avenir Next;
      font-size: 48px;
      font-style: normal;
      font-weight: 600;
      line-height: 67.2px;
      ${theme.breakpoints.down('md')} {
        font-size: 32px;
        margin: ${theme.spacing(0, 2)};
      }
          `
);

export const ContestBodyText = styled(BodySecondary)(
  `
    color: ${colors.greenGrey};
    max-width: 700px;
    margin: auto;
    font-family: Avenir Next;
`
);

export const SectionTitle = styled(Box)(
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
