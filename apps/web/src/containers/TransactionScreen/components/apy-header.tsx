import { ReactNode } from 'react';
import { Divider, Box, styled, useTheme } from '@mui/material';
import { APYData } from '@notional-finance/core-entities';
import { TokenIcon } from '@notional-finance/icons';
import {
  H3,
  InfoTooltip,
  CaptionAccent,
  Caption,
  Body,
  CountUp,
} from '@notional-finance/mui';
import { defineMessage, FormattedMessage } from 'react-intl';

const PointSection = ({
  label,
  multiple,
  symbol,
}: {
  label: string;
  multiple: number;
  symbol: string;
}) => {
  return (
    <APYSectionContainer key={label}>
      <RowContainer>
        <TokenIcon symbol={symbol} size="medium" />
        <H3>
          <CountUp value={multiple} decimals={0} suffix="x" />
        </H3>
      </RowContainer>
      <RowContainer>
        <Body>{label}</Body>
      </RowContainer>
    </APYSectionContainer>
  );
};

const APYSectionDivider = () => {
  const theme = useTheme();
  return (
    <Divider
      orientation="vertical"
      flexItem
      variant="middle"
      sx={{ margin: theme.spacing(0, 2) }}
    />
  );
};

export const APYBeforePoints = ({ apyInfo }: { apyInfo: APYData }) => {
  const theme = useTheme();

  const pointBoxes: ReactNode[] = [];
  if (
    apyInfo.pointMultiples &&
    Object.keys(apyInfo.pointMultiples).length > 0
  ) {
    Object.entries(apyInfo.pointMultiples).forEach(([key, value]) => {
      pointBoxes.push(<APYSectionDivider />);
      pointBoxes.push(
        <PointSection label={key} multiple={value} symbol={key} />
      );
    });
  }

  return (
    <APYHeaderContainer>
      <APYSectionContainer>
        <RowContainer>
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
              suffix="%"
            />{' '}
          </H3>
        </RowContainer>
        <RowContainer>
          <Body>
            <FormattedMessage defaultMessage="APY Before Points" />
          </Body>
        </RowContainer>
      </APYSectionContainer>
      {pointBoxes}
    </APYHeaderContainer>
  );
};

export const APYBox = ({ apyInfo }: { apyInfo: APYData }) => {
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

  if (
    apyInfo.pointMultiples &&
    Object.keys(apyInfo.pointMultiples).length > 0
  ) {
    Object.entries(apyInfo.pointMultiples).forEach(([key, value]) => {
      pointBoxes.push(
        <PointSection label={key} multiple={value} symbol={key} />
      );
      pointBoxes.push(<APYSectionDivider />);
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
    <APYHeaderContainer>
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
            {apyInfo.unleveragedAssetAPY?.totalAPY !== undefined ? (
              <CountUp
                value={apyInfo.unleveragedAssetAPY.totalAPY}
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
            {apyInfo.debtAPY !== undefined ? (
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
    </APYHeaderContainer>
  );
};

const APYHeaderContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing(1)};
  `
);

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
