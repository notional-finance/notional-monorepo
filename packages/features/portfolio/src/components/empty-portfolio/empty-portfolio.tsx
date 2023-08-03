import { Link } from 'react-router-dom';
import { Box, styled } from '@mui/material';
import { Button, Paragraph } from '@notional-finance/mui';
import { useEmptyPortfolio } from './use-empty-portfolio';
import { FormattedMessage } from 'react-intl';

export const EmptyPortfolio = () => {
  const { messages, link, callback } = useEmptyPortfolio();
  return (
    <EmptyPortfolioWrapper>
      <Paragraph msg={messages?.promptText} sx={{ flex: 1 }} />
      {callback && messages?.buttonText && (
        <Button variant="outlined" onClick={callback}>
          <FormattedMessage {...messages?.buttonText} />
        </Button>
      )}
      {!callback && link && messages?.buttonText && (
        <Link to={link}>
          <Button variant="outlined">
            <FormattedMessage {...messages?.buttonText} />
          </Button>
        </Link>
      )}
    </EmptyPortfolioWrapper>
  );
};

const EmptyPortfolioWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  background: ${theme.palette.common.white};
  padding: ${theme.spacing(4)};
  align-items: center;
  margin-top: ${theme.spacing(6)};
  border-radius: ${theme.shape.borderRadius()};
  border: ${theme.shape.borderStandard};
  height: ${theme.spacing(13)};
  width: 100%;
  ${theme.breakpoints.down('sm')} {
    flex-direction: column;
    p {
      margin-bottom: ${theme.spacing(2)};
    }
  }
`
);

export default EmptyPortfolio;
