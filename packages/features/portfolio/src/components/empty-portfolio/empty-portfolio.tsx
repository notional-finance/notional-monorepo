import { Link, useParams } from 'react-router-dom';
import { Box, styled, useTheme } from '@mui/material';
import { Banner, Button, Paragraph } from '@notional-finance/mui';
import { useEmptyPortfolio } from './use-empty-portfolio';
import { FormattedMessage, defineMessages } from 'react-intl';
import { PortfolioParams } from '@notional-finance/side-drawer';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';

const noteBanner = {
  messages: defineMessages({
    title: {
      defaultMessage: 'Learn about NOTE',
      description: 'empty note staking overview title',
    },
    promptText: {
      defaultMessage:
        "Explore the NOTE token's critical role and utility within Notional.",
      description: 'empty note staking overview prompt text',
    },
    buttonText: {
      defaultMessage: 'Learn More',
      description: 'empty note staking button text',
    },
  }),
};

export const EmptyPortfolio = () => {
  const theme = useTheme();
  const { category } = useParams<PortfolioParams>();
  const { messages, link, callback, href } = useEmptyPortfolio();
  return (
    <Box>
      {category === PORTFOLIO_CATEGORIES.NOTE_STAKING ? (
        <>
          <Banner
            messages={noteBanner.messages}
            tokenSymbol="NOTE"
            title={noteBanner.messages.title}
            link="/note"
          />
          <EmptyPortfolioWrapper sx={{ marginTop: theme.spacing(3) }}>
            <Paragraph msg={messages?.promptText} sx={{ flex: 1 }} />
            {callback && messages?.buttonText && (
              <Button variant="outlined" onClick={callback}>
                <FormattedMessage {...messages?.buttonText} />
              </Button>
            )}
            {!callback && href && messages?.buttonText && (
              <a href={href} target="_blank" rel="noreferrer">
                <Button variant="outlined">
                  <FormattedMessage {...messages?.buttonText} />
                </Button>
              </a>
            )}
          </EmptyPortfolioWrapper>
        </>
      ) : (
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
      )}
    </Box>
  );
};

const EmptyPortfolioWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  background: ${theme.palette.common.white};
  padding: ${theme.spacing(4)};
  align-items: center;
  border-radius: ${theme.shape.borderRadius()};
  border: ${theme.shape.borderStandard};
  height: fit-content;
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
