import { Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { ArrowIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

export const ContestBackButton = () => {
  const history = useHistory();

  return (
    <Button onClick={() => history.goBack()}>
      <ArrowIcon sx={{ transform: 'rotate(-90deg)' }} />
      <FormattedMessage defaultMessage={'Back'} />
    </Button>
  );
};

const Button = styled(Box)(
  ({ theme }) => `
  display: flex;
  padding: 4px 13px 4px 8px;
  align-items: center;
  gap: 8px;
  color: ${colors.neonTurquoise};
  border-radius: ${theme.shape.borderRadius()};
  background: rgba(51, 248, 255, 0.20);
  text-align: center;
  font-family: Avenir Next;
  font-size: 24px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: 2.4px;
  width: fit-content;
  margin-bottom: ${theme.spacing(5)};
  margin-top: ${theme.spacing(15)};
  cursor: pointer;
  ${theme.breakpoints.down('md')} {
      margin-left: ${theme.spacing(5)};
  }
`
);

export default ContestBackButton;
