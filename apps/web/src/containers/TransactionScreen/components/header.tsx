import { ReactNode } from 'react';
import { Box, styled } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { Caption, H2, LargeInputTextEmphasized } from '@notional-finance/mui';
import { PortfolioNetworkSelector } from '@notional-finance/wallet';
import { useAppStore } from '@notional-finance/notionable-hooks';

interface HeaderProps {
  title: string;
  tokenSymbol?: string;
  caption?: string;
  middleComponent?: ReactNode;
  rightComponent?: ReactNode;
}

// Header Component
const Header = ({
  title,
  caption,
  middleComponent,
  rightComponent = <PortfolioNetworkSelector />,
  tokenSymbol,
}: HeaderProps) => {
  const { isMobileView } = useAppStore();
  return (
    <HeaderContainer>
      <Row>
        {tokenSymbol && (
          <TokenIcon
            symbol={tokenSymbol}
            size={isMobileView ? 'large' : 'xl'}
          />
        )}
        <Column>
          {isMobileView ? (
            <LargeInputTextEmphasized>{title}</LargeInputTextEmphasized>
          ) : (
            <H2>{title}</H2>
          )}
          {caption && <Caption>{caption}</Caption>}
        </Column>
      </Row>

      {middleComponent && <>{middleComponent}</>}

      {rightComponent && !isMobileView && <>{rightComponent}</>}
    </HeaderContainer>
  );
};

const HeaderContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing(2)};
    padding: ${theme.spacing(2)};
    `
);

const Column = styled(Box)(
  () => `
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  `
);

const Row = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing(1)};
  `
);

export default Header;
