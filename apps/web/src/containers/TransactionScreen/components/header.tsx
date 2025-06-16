import { ReactNode } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import {
  CountUp,
  H2,
  H3,
  LargeInputTextEmphasized,
  Body,
  InfoTooltip,
} from '@notional-finance/mui';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { APYData } from '@notional-finance/core-entities';
import { defineMessage } from 'react-intl';

interface HeaderProps {
  title: string;
  tokenSymbol?: string;
  secondaryTitle?: ReactNode;
  apyInfo?: APYData;
}

// Header Component
const Header = ({
  title,
  secondaryTitle,
  apyInfo,
  tokenSymbol,
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
          <Column sx={{ alignItems: 'flex-end' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing(1),
              }}
            >
              <InfoTooltip
                toolTipText={defineMessage({
                  defaultMessage:
                    'Total APY = Vault APY + (Vault APY - Borrow APY) x Leverage',
                })}
                iconColor={theme.palette.info.dark}
                iconSize={theme.spacing(2)}
                disableMaxWidth
              />
              <H3>
                <CountUp
                  value={apyInfo.totalAPY}
                  decimals={2}
                  duration={1}
                  suffix="% Total APY"
                />{' '}
              </H3>
            </Box>
            <Body>
              {apyInfo.assetAPY ? (
                <CountUp
                  value={apyInfo.assetAPY}
                  decimals={2}
                  duration={1}
                  suffix="% Vault APY"
                />
              ) : (
                ''
              )}
            </Body>
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
    padding: ${theme.spacing(2)};
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
