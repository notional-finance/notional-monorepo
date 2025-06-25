import { ReactNode } from 'react';
import { Box, Divider, styled, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import {
  CountUp,
  H2,
  H3,
  LargeInputTextEmphasized,
  Body,
  InfoTooltip,
  Caption,
  CaptionAccent,
} from '@notional-finance/mui';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { APYData } from '@notional-finance/core-entities';
import { defineMessage } from 'react-intl';

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

const APYBeforePoints = ({ apyInfo }: { apyInfo: APYData }) => {
  return (
    <Box>
      <APYBox apyInfo={apyInfo} />
    </Box>
  );
};

const APYBox = ({ apyInfo }: { apyInfo: APYData }) => {
  const theme = useTheme();
  const pointBoxes: ReactNode[] = [];
  let ToolTip = () => (
    <CaptionAccent
      main
      msg={defineMessage({
        defaultMessage:
          'Total APY = Vault APY + (Vault APY - Borrow APY) x Leverage',
      })}
    />
  );

  if (apyInfo.pointMultiples) {
    Object.entries(apyInfo.pointMultiples).forEach(([key, value]) => {
      pointBoxes.push(
        <APYSectionContainer key={key}>
          <RowContainer>
            <TokenIcon symbol={key} size="medium" />
            <H3>
              <CountUp value={value} decimals={0} suffix="x" />
            </H3>
          </RowContainer>
          <RowContainer>
            <Body>{key}</Body>
          </RowContainer>
        </APYSectionContainer>
      );

      pointBoxes.push(
        <Divider
          orientation="vertical"
          flexItem
          variant="middle"
          sx={{ margin: theme.spacing(0, 2) }}
        />
      );
    });

    ToolTip = () => (
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }}
      >
        <CaptionAccent
          main
          msg={defineMessage({
            defaultMessage:
              'Total APY = Vault APY + (Vault APY - Borrow APY) x Leverage',
          })}
        />
        <Caption
          msg={defineMessage({
            defaultMessage: 'Total APY does not include points',
          })}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: theme.spacing(1) }}>
      {pointBoxes}
      <APYSectionContainer>
        <RowContainer>
          <InfoTooltip
            ToolTipComp={ToolTip}
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
        </RowContainer>
        <RowContainer>
          <Body>
            {apyInfo.assetAPY ? (
              <CountUp
                value={apyInfo.assetAPY}
                decimals={2}
                duration={1}
                suffix="% Vault APY"
              />
            ) : (
              '- % Vault APY'
            )}
          </Body>
          <Divider
            orientation="vertical"
            flexItem
            variant="middle"
            sx={{ margin: theme.spacing(0) }}
          />
          <Body>
            {apyInfo.debtAPY ? (
              <CountUp
                value={apyInfo.debtAPY}
                decimals={2}
                duration={1}
                suffix="% Borrow APY"
              />
            ) : (
              '- % Borrow APY'
            )}
          </Body>
        </RowContainer>
      </APYSectionContainer>
    </Box>
  );
};

const APYSectionContainer = styled(Box)(
  () => `
    display: flex;
    flex-direction: column;
  `
);

const RowContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: ${theme.spacing(1)};
  `
);

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
