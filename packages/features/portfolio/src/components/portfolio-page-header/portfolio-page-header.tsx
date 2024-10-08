import { Box, styled } from '@mui/material';
import { LargeInputTextEmphasized } from '@notional-finance/mui';
import { PortfolioNetworkSelector } from '@notional-finance/wallet';
import { messages } from '../../messages';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';

export const PortfolioPageHeader = ({
  category,
  children,
}: {
  category: PORTFOLIO_CATEGORIES;
  children?: React.ReactNode | React.ReactNode[];
}) => {
  return (
    <ActionButtonRow>
      {category && messages[category] && <Heading msg={messages[category]} />}
      <ButtonsContainer>
        {children}
        <PortfolioNetworkSelector />
      </ButtonsContainer>
    </ActionButtonRow>
  );
};

const Heading = styled(LargeInputTextEmphasized)(
  ({ theme }) => `
  ${theme.breakpoints.down('sm')} {
    display: none;
  };`
);

const ButtonsContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  align-items: center;
  ${theme.breakpoints.down('sm')} {
    justify-content: space-between;
    flex-flow: column;
    height: ${theme.spacing(21)};
  };`
);
const ActionButtonRow = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing(3)};
  ${theme.breakpoints.down('sm')} {
    flex-direction: column-reverse;
    align-items: baseline;
    justify-content: flex-start;
  }
`
);
