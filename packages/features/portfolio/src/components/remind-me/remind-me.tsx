import { Box, styled, Typography, useTheme } from '@mui/material';
import { CalAddIcon } from '@notional-finance/icons';
import { useParams } from 'react-router-dom';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { Button, CountdownCards } from '@notional-finance/mui';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { FormattedMessage } from 'react-intl';

interface RemindMeProps {
  futureDate: string | Date;
}

export const RemindMe = ({ futureDate }: RemindMeProps) => {
  const theme = useTheme();
  const { category } = useParams<PortfolioParams>();

  return (
    <CalContainer>
      <Label sx={{ margin: '20px 0px 10px 0px' }}>
        <FormattedMessage defaultMessage={'Remind Me'} />
      </Label>
      <CountdownCards futureDate={futureDate} variant="small" />
      <CalButton
        variant="outlined"
        to={`/portfolio/${category}/${PORTFOLIO_ACTIONS.ADD_TO_CALENDAR}?date=${futureDate}`}
      >
        <CalAddIcon fill={theme.palette.primary.light} />
        <FormattedMessage defaultMessage={'Add to Calendar'} />
      </CalButton>
    </CalContainer>
  );
};

const CalContainer = styled(Box)(
  ({ theme }) => `
  width: 224px;
  padding: 0px 30px 20px 30px;
  background: ${theme.palette.background.default};
  border-radius: 6px 0px 0px 6px;
`
);

const Label = styled(Typography)(
  () => `
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 20px 0px 30px 0px;
  display: flex;
`
);

const CalButton = styled(Button)(
  ({ theme }) => `
  white-space: nowrap;
  width: 100%;
  margin-top: 10px;
  text-transform: capitalize;
  font-weight: 700;
  font-size: 12px;
  color: ${theme.palette.primary.light};
  border-color: ${theme.palette.primary.light};
  background: ${theme.palette.common.white};
  font-weight: 500;
  padding: 5px 72px;
  svg {
    height: 20px;
    width: 20px;
    margin-right: 10px;
  }
`
);
