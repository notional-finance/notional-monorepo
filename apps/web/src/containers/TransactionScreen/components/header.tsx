import { ReactNode } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { H2, LargeInputTextEmphasized } from '@notional-finance/mui';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { APYData } from '@notional-finance/core-entities';
import { APYBeforePoints, APYBox } from './apy-header';

interface HeaderProps {
  title: string;
  tokenSymbol?: string;
  secondaryTitle?: ReactNode;
  isPointsOnly?: boolean;
  apyInfo?: APYData;
}

// Header Component
const Header = ({
  title,
  secondaryTitle,
  apyInfo,
  tokenSymbol,
  isPointsOnly,
}: HeaderProps) => {
  const { isMobileView } = useAppStore();
  const theme = useTheme();

  return (
    <HeaderContainer>
      <LeftSection>
        {tokenSymbol && (
          <TokenIcon
            symbol={tokenSymbol}
            size={isMobileView ? 'large' : 'xl'}
          />
        )}
        <Column sx={{ alignItems: 'flex-start' }}>
          {isMobileView ? (
            <LargeInputTextEmphasized>{title}</LargeInputTextEmphasized>
          ) : (
            <H2>{title}</H2>
          )}
          {secondaryTitle}
        </Column>
      </LeftSection>
      <RightSection>
        {apyInfo && (
          <Column
            sx={{
              alignItems: 'flex-end',
              padding: theme.spacing(1.5, 3),
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius(),
              border: theme.shape.borderStandard,
            }}
          >
            {isPointsOnly ? (
              <APYBeforePoints apyInfo={apyInfo} />
            ) : (
              <APYBox apyInfo={apyInfo} />
            )}
          </Column>
        )}
      </RightSection>
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
    padding: ${theme.spacing(2, 0)};
    `
);

const Column = styled(Box)(
  () => `
    display: flex;
    flex-direction: column;
  `
);

const LeftSection = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing(1)};
  `
);

const RightSection = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    align-self: flex-end;
    gap: ${theme.spacing(1)};
  `
);
export default Header;
