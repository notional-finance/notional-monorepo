import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  styled,
  useTheme,
} from '@mui/material';
import { formatNumberAsPercent, trackEvent } from '@notional-finance/helpers';
import { ArrowIcon } from '@notional-finance/icons';
import { useLocation } from 'react-router-dom';
import {
  DataTable,
  DataTableColumn,
  InfoTooltip,
  H4,
  H5,
  LabelValue,
  LinkText,
  MultiValueIconCell,
  PageLoading,
  SliderRisk,
  ArrowChangeCell,
} from '@notional-finance/mui';
import { TRACKING_EVENTS } from '@notional-finance/util';
import {
  useAccountReady,
  useCurrentLiquidationPrices,
  useFiat,
  usePortfolioRiskProfile,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { FormattedMessage, MessageDescriptor, defineMessage } from 'react-intl';

const Container = styled(Box)(
  ({ theme }) => `
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  margin-bottom: ${theme.spacing(3)};
`
);

const RiskHeaderBox = styled(Box)(
  ({ theme }) => `
  border-radius: ${theme.shape.borderRadius()};
  padding: ${theme.spacing(3)};
  background: ${theme.palette.background.paper};
`
);

const LiquidationPriceExpander = styled(AccordionSummary)(
  ({ theme }) => `
  padding: ${theme.spacing(2, 3)};
  background: ${theme.palette.background.paper};
  border-top: ${theme.shape.borderStandard};
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`
);

const LiquidationPriceTables = styled(AccordionDetails)(
  ({ theme }) => `
  padding: ${theme.spacing(3)};
  background: ${theme.palette.background.default};
  border-bottom-left-radius: ${theme.shape.borderRadius()};
  border-bottom-right-radius: ${theme.shape.borderRadius()};
`
);

const LabelAndValue = ({
  label,
  value,
}: {
  label: MessageDescriptor;
  value: string;
}) => {
  return (
    <Box>
      <H5 msg={label} />
      <LabelValue>{value}</LabelValue>
    </Box>
  );
};

const LiquidationPriceColumns: DataTableColumn[] = [
  {
    Header: (
      <FormattedMessage
        defaultMessage="Exchange Rate"
        description={'Exchange Rate column header'}
      />
    ),
    Cell: MultiValueIconCell,
    accessor: 'exchangeRate',
    textAlign: 'left',
  },
  {
    Header: (
      <FormattedMessage
        defaultMessage="Liquidation Price"
        description={'column header'}
      />
    ),
    accessor: 'liquidationPrice',
    textAlign: 'right',
  },
  {
    Header: (
      <FormattedMessage
        defaultMessage="Current Price"
        description={'column header'}
      />
    ),
    accessor: 'currentPrice',
    textAlign: 'right',
  },
  {
    Header: (
      <FormattedMessage defaultMessage="24H %" description={'column header'} />
    ),
    Cell: ArrowChangeCell,
    accessor: 'oneDayChange',
    textAlign: 'right',
  },
  {
    Header: (
      <FormattedMessage defaultMessage="7D %" description={'column header'} />
    ),
    Cell: ArrowChangeCell,
    accessor: 'sevenDayChange',
    textAlign: 'right',
  },
];

export const PortfolioRisk = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const [isExpanded, setExpanded] = useState(false);
  const network = useSelectedNetwork();
  const isAccountReady = useAccountReady(network);
  const profile = usePortfolioRiskProfile(network);
  const baseCurrency = useFiat();
  const loanToValue = profile?.loanToValue();
  const healthFactor = profile ? profile.healthFactor() : null;
  const { exchangeRateRisk, assetPriceRisk } =
    useCurrentLiquidationPrices(network);

  const hasLiquidationPrices =
    exchangeRateRisk.length > 0 || assetPriceRisk.length > 0;

  if (!isAccountReady) return <PageLoading />;

  return (
    <Container>
      <RiskHeaderBox
        sx={{
          borderBottomLeftRadius: hasLiquidationPrices
            ? '0px'
            : theme.shape.borderRadius(),
          borderBottomRightRadius: hasLiquidationPrices
            ? '0px'
            : theme.shape.borderRadius(),
        }}
      >
        <H4 gutter={'default'} sx={{ display: 'flex', alignItems: 'center' }}>
          <FormattedMessage defaultMessage={'Portfolio Health Factor'} />
          <InfoTooltip
            onMouseEnter={() =>
              trackEvent(TRACKING_EVENTS.TOOL_TIP, {
                path: pathname,
                type: TRACKING_EVENTS.HOVER_TOOL_TIP,
                title: 'Portfolio Health Factor',
              })
            }
            iconColor={theme.palette.typography.accent}
            iconSize={theme.spacing(2)}
            sx={{ marginLeft: theme.spacing(1) }}
            toolTipText={defineMessage({
              defaultMessage:
                'Your health factor measures the riskiness of your account. If your health factor drops below 1, you can be liquidated.',
            })}
          />
        </H4>
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ width: theme.spacing(54) }}>
            <SliderRisk healthFactor={healthFactor} />
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: '50%',
              justifyContent: 'space-evenly',
            }}
          >
            <LabelAndValue
              label={defineMessage({ defaultMessage: 'Total Collateral' })}
              value={
                profile
                  ?.totalAssets()
                  .toFiat(baseCurrency)
                  .toDisplayStringWithSymbol(2, true) || '-'
              }
            />
            <LabelAndValue
              label={defineMessage({ defaultMessage: 'Total Debt' })}
              value={
                profile
                  ?.totalDebt()
                  .abs()
                  .toFiat(baseCurrency)
                  .toDisplayStringWithSymbol(2, true) || '-'
              }
            />
            <LabelAndValue
              label={defineMessage({ defaultMessage: 'Loan to Value' })}
              value={loanToValue ? formatNumberAsPercent(loanToValue, 2) : '-'}
            />
          </Box>
        </Box>
      </RiskHeaderBox>
      {hasLiquidationPrices && (
        <Accordion
          disableGutters
          expanded={isExpanded}
          sx={{
            boxShadow: 'unset',
            borderBottomLeftRadius: theme.shape.borderRadius(),
            borderBottomRightRadius: theme.shape.borderRadius(),
          }}
        >
          <LiquidationPriceExpander
            expandIcon={
              <ArrowIcon sx={{ color: theme.palette.primary.light }} />
            }
            sx={{
              borderTop: isExpanded ? theme.shape.borderStandard : 'unset',
              borderBottom: isExpanded ? theme.shape.borderStandard : undefined,
              borderBottomLeftRadius: isExpanded
                ? undefined
                : theme.shape.borderRadius(),
              borderBottomRightRadius: isExpanded
                ? undefined
                : theme.shape.borderRadius(),
            }}
            onClick={() => setExpanded(!isExpanded)}
          >
            <LinkText
              msg={defineMessage({ defaultMessage: 'Liquidation Prices' })}
            />
          </LiquidationPriceExpander>
          <LiquidationPriceTables>
            {exchangeRateRisk.length > 0 && (
              <DataTable
                tableTitle={
                  <FormattedMessage defaultMessage={'Exchange Rate Risk'} />
                }
                columns={LiquidationPriceColumns}
                data={exchangeRateRisk}
                sx={{
                  marginBottom: theme.spacing(3),
                }}
              />
            )}
            {assetPriceRisk.length > 0 && (
              <DataTable
                tableTitle={
                  <FormattedMessage defaultMessage={'Asset Price Risk'} />
                }
                columns={LiquidationPriceColumns}
                data={assetPriceRisk}
              />
            )}
          </LiquidationPriceTables>
        </Accordion>
      )}
    </Container>
  );
};
