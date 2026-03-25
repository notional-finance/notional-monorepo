import { Divider, Box, styled, useTheme, useMediaQuery } from '@mui/material';
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
  hideLabel = false,
}: {
  label: string;
  multiple: number;
  symbol: string;
  hideLabel?: boolean;
}) => {
  return (
    <APYSectionContainer key={label}>
      <RowContainer>
        <TokenIcon symbol={symbol} size="medium" />
        <H3>
          <CountUp value={multiple} decimals={2} suffix="x" />
        </H3>
      </RowContainer>
      {!hideLabel && (
        <RowContainer>
          <Body>{label}</Body>
        </RowContainer>
      )}
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

const buildPointBoxes = (apyInfo: APYData, hideLabel = false) =>
  Object.entries(apyInfo.pointMultiples || {}).flatMap(
    ([key, { multiple, icon }], index, entries) => [
      <PointSection
        key={`point-section-${key}`}
        label={key}
        multiple={multiple}
        symbol={icon}
        hideLabel={hideLabel}
      />,
      ...(index < entries.length - 1
        ? [<APYSectionDivider key={`point-divider-${key}`} />]
        : []),
    ]
  );

export const APYBeforePoints = ({ apyInfo }: { apyInfo: APYData }) => {
  const theme = useTheme();
  const pointBoxes = buildPointBoxes(apyInfo);

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
      {pointBoxes.length > 0 && <APYSectionDivider />}
      {pointBoxes}
    </APYHeaderContainer>
  );
};

export const APYBox = ({ apyInfo }: { apyInfo: APYData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const pointBoxes = buildPointBoxes(apyInfo);
  const mobilePointBoxes = buildPointBoxes(apyInfo, true);
  let ToolTip = () => (
    <CaptionAccent
      main
      msg={defineMessage({
        defaultMessage:
          'Total APY = Vault APY + (Vault APY - Borrow APY) x Leverage',
      })}
    />
  );

  const hasPoints =
    apyInfo.pointMultiples && Object.keys(apyInfo.pointMultiples).length > 0;

  if (hasPoints) {
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

  const totalAPYSection = (
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
  );

  return (
    <APYHeaderContainer>
      {isMobile && hasPoints ? (
        <>
          {totalAPYSection}
          <MobilePointsRow>
            <PointsRow>{mobilePointBoxes}</PointsRow>
          </MobilePointsRow>
        </>
      ) : (
        <>
          {pointBoxes}
          {pointBoxes.length > 0 && <APYSectionDivider />}
          {totalAPYSection}
        </>
      )}
    </APYHeaderContainer>
  );
};

const APYHeaderContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing(1)};
    width: 100%;
    justify-content: flex-end;

    ${theme.breakpoints.down('sm')} {
      flex-wrap: wrap;
    }
  `
);

const MobilePointsRow = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: stretch;
    width: 100%;
    gap: ${theme.spacing(1)};
  `
);

const PointsRow = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: ${theme.spacing(1)};
  `
);

const APYSectionContainer = styled(Box)(
  () => `
    display: flex;
    flex-direction: column;
    align-items: flex-end;
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
