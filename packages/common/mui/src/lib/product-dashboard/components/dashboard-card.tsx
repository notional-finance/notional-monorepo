import { Box, useTheme, styled } from '@mui/material';
import { MultiTokenIcon, TokenIcon } from '@notional-finance/icons';
import { DashboardDataProps } from '../product-dashboard';
import {
  H4,
  CurrencyTitle,
  LargeInputTextEmphasized,
  Caption,
} from '../../typography/typography';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { colors, NotionalTheme } from '@notional-finance/styles';
import SliderBasic from '../../slider-basic/slider-basic';
import { useAppState } from '@notional-finance/notionable-hooks';
import { THEME_VARIANTS } from '@notional-finance/util';

interface GridCardApyProps {
  hideApySubTitle: boolean;
  theme: NotionalTheme;
}

const ReinvestPill = ({
  Icon,
  label,
}: {
  Icon: any;
  label: MessageDescriptor;
}) => {
  const theme = useTheme();
  const { themeVariant } = useAppState();

  return (
    <Caption
      sx={{
        display: 'flex',
        justifyContent: 'end',
        padding: '3px 4px',
        color:
          themeVariant === THEME_VARIANTS.LIGHT
            ? colors.darkGrey
            : colors.white,
        borderRadius: theme.shape.borderRadius(),
        width: 'fit-content',
        background: theme.palette.pending.light,
        '.stroke-icon': {
          stroke: theme.palette.pending.main,
        },
        textTransform: 'none',
        fontWeight: 500,
        marginBottom: theme.spacing(0.5),
        svg: {
          height: theme.spacing(2),
          width: theme.spacing(2),
          fill: theme.palette.pending.main,
          marginRight: theme.spacing(1),
        },
      }}
    >
      <Icon />
      <FormattedMessage {...label} />
    </Caption>
  );
};

const UtilizationBar = ({ vaultUtilization }: { vaultUtilization: number }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'end',
      }}
    >
      <CaptionContainer>
        <SectionTitle>Utilization</SectionTitle>
        <SectionTitle>
          {formatNumberAsPercent(vaultUtilization, 1)}
        </SectionTitle>
      </CaptionContainer>
      <SliderBasic
        min={0}
        max={100}
        step={0.01}
        value={vaultUtilization}
        disabled={true}
        sx={{
          marginBottom: '0px',
          justifyContent: 'unset',
          '& .MuiSlider-root': {
            padding: theme.spacing(1, 0),
          },
        }}
      />
    </Box>
  );
};

export const DashboardCard = ({
  apy,
  title,
  symbol,
  subTitle,
  bottomLeftValue,
  bottomRightValue,
  apySubTitle,
  reinvestOptions,
  vaultUtilization,
  rewardTokens,
  PointsSubTitle,
  routeCallback,
  incentiveValue,
  incentiveSymbols,
  hasPosition,
  network,
}: DashboardDataProps) => {
  const theme = useTheme();
  const hideFooter = !bottomLeftValue && !incentiveSymbols && !bottomRightValue;

  return (
    <GridCard onClick={() => routeCallback()}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: theme.spacing(2),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TokenIcon
            symbol={symbol}
            size="xl"
            style={{ marginRight: theme.spacing(2) }}
            network={network}
          />
          <Box component="div" sx={{ textAlign: 'left', margin: 'auto' }}>
            <GridCardTitle>{title}</GridCardTitle>
            <GridCardSubTitle id="grid-card-sub-title">
              {subTitle}
            </GridCardSubTitle>
          </Box>
        </Box>

        <GridCardApy
          hideApySubTitle={!apySubTitle ? true : false}
          sx={{
            justifyContent: !reinvestOptions && !apySubTitle ? 'center' : '',
          }}
          theme={theme}
        >
          {reinvestOptions && (
            <ReinvestPill
              Icon={reinvestOptions.Icon}
              label={reinvestOptions.label}
            />
          )}
          {apySubTitle && (
            <SectionTitle
              sx={{
                display: 'flex',
                justifyContent: 'end',
                color: theme.palette.typography.light,
                fontWeight: 600,
              }}
            >
              <FormattedMessage {...apySubTitle} />
            </SectionTitle>
          )}
          {PointsSubTitle && <PointsSubTitle />}
          <LargeInputTextEmphasized
            sx={{
              fontWeight: 700,
              color:
                apy < 0
                  ? theme.palette.error.main
                  : theme.palette.typography.main,
            }}
          >
            {vaultUtilization !== undefined ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MultiTokenIcon
                  symbols={rewardTokens || []}
                  size="medium"
                  shiftSize={8}
                />
                <Box sx={{ marginLeft: theme.spacing(1) }}>
                  {formatNumberAsPercent(apy)}
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontWeight: 600,
                    textTransform: 'none',
                    marginLeft: theme.spacing(1),
                  }}
                >
                  {hasPosition ? 'APY' : 'Max APY'}
                </Box>
              </Box>
            ) : (
              formatNumberAsPercent(apy) + ' APY'
            )}
          </LargeInputTextEmphasized>
        </GridCardApy>
      </Box>
      <GridCardFooter
        id="incentive"
        sx={{ display: hideFooter ? 'none' : 'flex' }}
      >
        {vaultUtilization !== undefined && (
          <UtilizationBar vaultUtilization={vaultUtilization} />
        )}
        {bottomLeftValue && (
          <SectionTitle
            sx={{
              display: 'flex',
              justifySelf: 'flex-start',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {bottomLeftValue}
          </SectionTitle>
        )}
        {incentiveSymbols && incentiveSymbols.length > 0 && (
          <SectionTitle
            sx={{
              display: 'flex',
              justifySelf: 'flex-start',
              justifyContent: 'space-between',
              paddingLeft:
                incentiveSymbols.length > 1 ? theme.spacing(1) : '0px',
            }}
          >
            {incentiveSymbols.map((incentiveSymbol, index) => (
              <TokenIcon
                key={index}
                symbol={incentiveSymbol}
                size="small"
                style={{
                  marginRight: theme.spacing(1),
                  position:
                    index === 1 && incentiveSymbols.length > 1
                      ? 'absolute'
                      : 'relative',
                  marginLeft:
                    index === 1 && incentiveSymbols.length > 1
                      ? `-${theme.spacing(1)}`
                      : '0px',
                }}
              />
            ))}
            {incentiveValue && (
              <>
                <Box
                  sx={{
                    color: theme.palette.typography.main,
                    marginRight: theme.spacing(0.5),
                  }}
                >
                  {incentiveValue}
                </Box>
                <FormattedMessage defaultMessage={'Incentive APY'} />
              </>
            )}
          </SectionTitle>
        )}
        {bottomRightValue && (
          <SectionTitle
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              justifySelf: 'flex-end',
            }}
          >
            {bottomRightValue}
          </SectionTitle>
        )}
      </GridCardFooter>
    </GridCard>
  );
};

const GridCardFooter = styled(Box)(
  ({ theme }) => `
      width: 100%;
      min-height: 32.8px;
      background: ${theme.palette.background.default};
      border-radius: 0px 0px ${theme.shape.borderRadius()} ${theme.shape.borderRadius()};
      padding: ${theme.spacing(1, 2)};
      display: flex;
      justify-content: space-between;
        `
);

const GridCard = styled(Box)(
  ({ theme }) => `
      border-radius: ${theme.shape.borderRadius()};
      border: ${theme.shape.borderStandard};
      display: flex;
      flex-direction: column;
      box-shadow: ${theme.shape.shadowStandard};
      ${theme.gradient.hoverTransition(
        theme.palette.background.paper,
        theme.palette.info.light
      )};
      &:hover {
        cursor: pointer;
        border: 1px solid ${theme.palette.primary.light};
        transition: 0.3s ease;
        transform: scale(1.02);
        #incentive {
            background: rgba(19, 187, 194, 0.10);
        }
      }
        `
);

const CaptionContainer = styled(Box)(`
  display: flex;
  justify-content: space-between;
`);

const GridCardTitle = styled(H4)(
  ({ theme }) => `
    font-family: Avenir Next;
    display: block;
    text-align: left;
    margin-bottom: ${theme.spacing(0.5)};
      `
);

const SectionTitle = styled(Box)(
  `
    font-family: Avenir Next;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 1px;
    font-style: normal;
    font-weight: 600;
      `
);

const GridCardApy = styled(CurrencyTitle, {
  shouldForwardProp: (prop: string) => prop !== 'hideApySubTitle',
})(
  ({ hideApySubTitle, theme }: GridCardApyProps) => `
      display: ${hideApySubTitle ? 'flex' : 'block'};
      align-items: ${hideApySubTitle ? 'end' : ''};
      flex-direction: ${hideApySubTitle ? 'column' : ''};
      padding-left: ${theme.spacing(1)};
      white-space: nowrap;
      letter-spacing: 1px;
        `
);

const GridCardSubTitle = styled('span')(
  ({ theme }) => `
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      color: ${theme.palette.typography.light};
      display: block;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
        `
);

export default DashboardCard;
