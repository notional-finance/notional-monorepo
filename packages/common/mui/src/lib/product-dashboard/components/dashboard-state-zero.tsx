import { Box, useTheme, styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { WarningIcon } from '@notional-finance/icons';

export const DashboardStateZero = () => {
  const theme = useTheme();
  return (
    <Wrapper>
      <WarningIcon sx={{ height: theme.spacing(8), width: theme.spacing(8) }} />
      <FormattedMessage defaultMessage={'No Profitable Opportunities'} />{' '}
    </Wrapper>
  );
};

const Wrapper = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: ${theme.spacing(57.5)};
    svg {
        margin-bottom: ${theme.spacing(3)};
    }
      `
);

export default DashboardStateZero;
