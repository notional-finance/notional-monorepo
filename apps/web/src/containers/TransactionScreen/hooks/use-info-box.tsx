import { ReactNode } from 'react';
import {
  Box,
  Divider,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
} from '@mui/material';
import {
  H5,
  Label,
  LabelValue,
  SmallTableCell,
  TableColumnHeading,
} from '@notional-finance/mui';
import { defineMessage, FormattedMessage, MessageDescriptor } from 'react-intl';
import {
  formatHealthFactorValues,
  useCurrentTradeContext,
} from '@notional-finance/notionable-hooks';
import { formatNumber, RATE_PRECISION } from '@notional-finance/util';
import { formatNumberAsPercentWithUndefined } from '@notional-finance/helpers';
import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';

interface LabelValueSectionProps {
  sectionTitle?: ReactNode;
  items: { label: ReactNode; content: ReactNode | string }[];
}

const LabelValueSection = ({
  sectionTitle = '',
  items,
}: LabelValueSectionProps) => {
  const theme = useTheme();

  return (
    <Box>
      <H5 main marginBottom={theme.spacing(1.5)}>
        {sectionTitle}
      </H5>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {items.map((item, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent="space-between"
            flexDirection="row"
          >
            <Label light>{item.label}</Label>
            <Box>
              {typeof item.content === 'string' ? (
                <LabelValue>{item.content}</LabelValue>
              ) : (
                item.content
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const DividedSections = ({
  children,
}: {
  children: ReactNode | ReactNode[];
}) => {
  const theme = useTheme();
  const c = Array.isArray(children) ? children.filter((c) => !!c) : children;

  return (
    <Box>
      {Array.isArray(c)
        ? c.map((child, index) => (
            <Box key={index}>
              {child}
              {index !== c.length - 1 && (
                <Divider sx={{ margin: theme.spacing(3, 0) }} />
              )}
            </Box>
          ))
        : children}
    </Box>
  );
};

interface TableSectionProps {
  headings: MessageDescriptor[];
  highlightLastRow?: boolean;
  contents: {
    label: string;
    values: {
      value: ReactNode;
      primary?: boolean;
    }[];
  }[];
}

const DenseTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  borderBottom: 'none',
}));

const TableSection = ({
  headings,
  highlightLastRow,
  contents,
}: TableSectionProps) => {
  const theme = useTheme();

  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: 'none',
        background: 'transparent',
        overflowX: 'visible',
      }}
    >
      <Table size="small" padding="none">
        <TableHead>
          <TableRow>
            {headings.map((heading, index) => {
              return (
                <DenseTableCell
                  key={index}
                  align={index === 0 ? 'left' : 'right'}
                >
                  <TableColumnHeading msg={heading} />
                </DenseTableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {contents.map((content, index, array) => (
            <TableRow
              key={content.label}
              sx={{
                ...(highlightLastRow &&
                  index === array.length - 1 && {
                    position: 'relative',
                    zIndex: 1,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: theme.spacing(-3),
                      right: theme.spacing(-3),
                      bottom: 0,
                      backgroundColor: theme.palette.background.default,
                      zIndex: -1,
                    },
                    '& td:first-of-type': {
                      position: 'absolute',
                    },
                  }),
              }}
            >
              <DenseTableCell align="left">
                <SmallTableCell>{content.label}</SmallTableCell>
              </DenseTableCell>
              {content.values.map(({ value, primary }, index) => {
                return (
                  <DenseTableCell key={index} align="right">
                    <SmallTableCell main={!primary || true} primary={primary}>
                      {value}
                    </SmallTableCell>
                  </DenseTableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const useSummaryItems = () => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const risk = trade?.getVaultRiskSummary();
  const netWorth = risk?.netWorth.updated || risk?.netWorth.current || '-';
  const healthFactor = formatHealthFactorValues(
    risk?.healthFactor.updated || risk?.healthFactor.current,
    theme
  );
  const liquidationPrices =
    risk?.liquidationPrice.map((price) => {
      return {
        label: `${price.asset.symbol} Liquidation Price`,
        content:
          price.updated?.toDisplayStringWithSymbol(4, false, false) ||
          price.current?.toDisplayStringWithSymbol(4, false, false) ||
          '-',
      };
    }) || [];

  return [
    {
      label: <FormattedMessage defaultMessage={'Net Worth'} />,
      content: netWorth,
    },
    {
      label: <FormattedMessage defaultMessage={'Health Factor'} />,
      content: <Box color={healthFactor.textColor}>{healthFactor.value}</Box>,
    },
    ...liquidationPrices,
  ];
};

function formatAPYValues(
  apy: number | undefined,
  amount: TokenBalance | undefined,
  positiveGreen: string
) {
  const earningsString =
    amount && apy
      ? amount
          .abs()
          .mulInRatePrecision(Math.floor((apy * RATE_PRECISION) / 100))
          .toDisplayStringWithSymbol(2, false, false)
      : undefined;

  return [
    { value: formatNumberAsPercentWithUndefined(apy, '-', 4) },
    {
      value: (
        <Box color={apy && apy > 0 ? positiveGreen : undefined}>
          {earningsString}
        </Box>
      ),
    },
  ];
}

const useApyBreakdown = () => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const { leveragedAPY, assets, debts, netWorth } =
    trade?.getVaultAPYBreakdown() || {};
  const leverageRatio = leveragedAPY?.leverageRatio || 0;
  let points: { label: string; values: { value: string }[] }[] | undefined;

  if (leveragedAPY?.pointMultiples) {
    points = Object.entries(leveragedAPY.pointMultiples).map(([key, value]) => {
      return {
        label: key,
        values: [{ value: `${formatNumber(value * leverageRatio)}x` }],
      };
    });
  }

  const apy = [
    {
      label: 'Staking APY',
      values: formatAPYValues(
        leveragedAPY?.assetAPY,
        assets,
        theme.palette.success.main
      ),
    },
    {
      label: 'Vault Fee APY',
      values: formatAPYValues(
        leveragedAPY?.feeAPY,
        assets,
        theme.palette.success.main
      ),
    },
    {
      label: 'Borrow APY',
      values: formatAPYValues(
        leveragedAPY?.debtAPY,
        debts,
        theme.palette.success.main
      ),
    },
    {
      label: 'Total APY',
      values: formatAPYValues(
        leveragedAPY?.totalAPY,
        netWorth,
        theme.palette.success.main
      ),
    },
  ];

  const assetsDebts = [
    {
      label: 'Asset Amount',
      content: assets?.toDisplayStringWithSymbol(4, false, false) || '-',
    },
    {
      label: 'Debt Amount',
      content: debts?.toDisplayStringWithSymbol(4, false, false) || '-',
    },
  ];

  return {
    apy,
    points,
    assetsDebts,
  };
};

const useOrderDetails = () => {
  const trade = useCurrentTradeContext();
  const orderDetails: LabelValueSectionProps['items'] = [];

  if (trade?.depositBalance) {
    orderDetails.push({
      label: 'Amount Deposited',
      content: trade.depositBalance.toDisplayStringWithSymbol(4, false, false),
    });
  }

  if (trade?.debtBalance) {
    orderDetails.push({
      label: 'Amount Borrowed',
      content: trade.debtBalance
        .abs()
        .toUnderlying()
        .toDisplayStringWithSymbol(4, false, false),
    });
  }

  if (trade?.collateralBalance) {
    orderDetails.push({
      label: 'Vault Shares Minted',
      content: trade.collateralBalance.toDisplayString(4, false, false),
    });
  }

  if (trade?.collateral) {
    orderDetails.push({
      label: 'Vault Share Price',
      content: TokenBalance.unit(trade.collateral as TokenDefinition)
        .toUnderlying()
        .toDisplayStringWithSymbol(4, false, false),
    });
  }

  return orderDetails;
};

export const useInfoBox = () => {
  const summaryItems = useSummaryItems();
  const apyBreakdown = useApyBreakdown();
  const orderDetails = useOrderDetails();

  const tabs = [
    {
      tabTitle: 'Summary',
      tabContent: (
        <DividedSections>
          <LabelValueSection items={summaryItems} />
        </DividedSections>
      ),
    },
    {
      tabTitle: 'APY Breakdown',
      tabContent: (
        <DividedSections>
          {apyBreakdown.points && (
            <TableSection
              headings={[
                defineMessage({ defaultMessage: 'Points' }),
                defineMessage({ defaultMessage: 'Multiplier' }),
              ]}
              contents={apyBreakdown.points}
            />
          )}
          <TableSection
            highlightLastRow
            headings={[
              defineMessage({ defaultMessage: 'Source' }),
              defineMessage({ defaultMessage: 'APY' }),
              defineMessage({ defaultMessage: 'Earnings (1yr)' }),
            ]}
            contents={apyBreakdown.apy}
          />
          <LabelValueSection items={apyBreakdown.assetsDebts} />
        </DividedSections>
      ),
    },
    {
      tabTitle: 'Order Details',
      tabContent: (
        <DividedSections>
          <LabelValueSection items={orderDetails} />
          <LabelValueSection
            sectionTitle="Trade: USDC → USDT"
            items={[
              { label: 'Amount Sold', content: '-' },
              { label: 'Amount Bought', content: '-' },
              { label: 'Exchange Rate', content: '-' },
            ]}
          />
        </DividedSections>
      ),
    },
  ];

  return tabs;
};
