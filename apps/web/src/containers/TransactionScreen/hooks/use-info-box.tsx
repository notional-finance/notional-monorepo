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
  Theme,
} from '@mui/material';
import {
  CountUp,
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
import moment from 'moment';

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
            <LabelValue>{item.content}</LabelValue>
            {/* <Box>
              {typeof item.content === 'string' ? (
                <LabelValue>{item.content}</LabelValue>
              ) : (
                item.content
              )}
            </Box> */}
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

const formatCountUp = (
  value: TokenBalance | undefined | null,
  suffix?: string
) => {
  return value ? (
    <CountUp
      value={value.toFloat()}
      decimals={4}
      suffix={suffix !== undefined ? suffix : ` ${value.symbol}`}
    />
  ) : (
    '-'
  );
};

const formatSummaryItems = (
  summary: {
    netWorth: TokenBalance | undefined;
    healthFactor: number | null | undefined;
    leverageRatio: number | undefined;
    liquidationPrices: {
      asset: TokenDefinition;
      debt: TokenDefinition;
      threshold: TokenBalance | null;
      isDebtThreshold: boolean;
    }[];
  },
  theme: Theme
) => {
  const healthFactor = formatHealthFactorValues(summary.healthFactor, theme);
  return [
    {
      label: <FormattedMessage defaultMessage={'Net Worth'} />,
      content: formatCountUp(summary.netWorth),
    },
    {
      label: <FormattedMessage defaultMessage={'Health Factor'} />,
      content: <Box color={healthFactor.textColor}>{healthFactor.value}</Box>,
    },
    {
      label: <FormattedMessage defaultMessage={'Leverage Ratio'} />,
      content: summary.leverageRatio ? (
        <CountUp value={summary.leverageRatio} decimals={4} suffix="x" />
      ) : (
        '-'
      ),
    },
    ...summary.liquidationPrices.map((price) => {
      return {
        label: `${price.asset.symbol} Liquidation Price`,
        content: formatCountUp(price.threshold),
      };
    }),
  ];
};

const useSummaryItems = () => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const r = trade?.getVaultRiskSummary();
  const currentItems = r?.current
    ? formatSummaryItems(r.current, theme)
    : undefined;
  const updatedItems = r?.updated
    ? formatSummaryItems(r.updated, theme)
    : undefined;

  return {
    current: currentItems,
    updated: updatedItems,
  };
};

function formatAPYValues(
  apy: number | undefined,
  amount: TokenBalance | undefined,
  positiveGreen: string
) {
  const earnings =
    amount && apy
      ? amount
          .abs()
          .mulInRatePrecision(Math.floor((apy * RATE_PRECISION) / 100))
      : undefined;

  return [
    { value: formatNumberAsPercentWithUndefined(apy, '-', 4) },
    {
      value: (
        <Box color={apy && apy > 0 ? positiveGreen : undefined}>
          {formatCountUp(earnings)}
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
      content: formatCountUp(assets),
    },
    {
      label: 'Debt Amount',
      content: formatCountUp(debts),
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
      label: trade.depositBalance.isNegative()
        ? 'Amount Withdrawn'
        : 'Amount Deposited',
      content: formatCountUp(trade.depositBalance.abs()),
    });
  }

  if (trade?.debtBalance) {
    const borrowed = trade.debtBalance.abs().toUnderlying();
    orderDetails.push({
      label: trade.debtBalance.isPositive()
        ? 'Amount Repaid'
        : 'Amount Borrowed',
      content: formatCountUp(borrowed),
    });
  }

  if (trade?.collateralBalance) {
    orderDetails.push({
      label: trade.collateralBalance.isNegative()
        ? 'Vault Shares Redeemed'
        : 'Vault Shares Minted',
      content: formatCountUp(trade.collateralBalance.abs(), ''),
    });
  }

  if (trade?.collateral) {
    const price = TokenBalance.unit(
      trade.collateral as TokenDefinition
    ).toUnderlying();
    orderDetails.push({
      label: 'Vault Share Price',
      content: formatCountUp(price),
    });
  }

  return orderDetails;
};

const useWithdrawDetails = () => {
  const trade = useCurrentTradeContext();
  if (trade?.tradeType !== 'InitiateWithdraw') return undefined;
  const withdraws = trade.getVaultInitiateWithdraw();
  if (!withdraws) return undefined;
  return withdraws.flatMap((withdraw) => {
    const items: { label: string; content: ReactNode }[] = [];
    if (withdraw.estimatedWithdrawTime) {
      items.push({
        label: 'Estimated Redemption Time',
        content: moment
          .duration(withdraw.estimatedWithdrawTime, 'seconds')
          .humanize(),
      });
    }

    items.push({
      label: 'Tokens Redeemed',
      content: formatCountUp(withdraw.tokensRedeemed),
    });

    items.push({
      label: 'Tokens to Receive',
      content: formatCountUp(withdraw.tokensToReceive),
    });

    return items;
  });
};

export const useInfoBox = () => {
  const { current, updated } = useSummaryItems();
  const apyBreakdown = useApyBreakdown();
  const orderDetails = useOrderDetails();
  const withdrawDetails = useWithdrawDetails();

  const tabs = [
    {
      tabTitle: 'Summary',
      tabContent: (
        <DividedSections>
          {withdrawDetails ? (
            [
              <LabelValueSection
                sectionTitle="Withdraw Details"
                items={withdrawDetails}
              />,
              <LabelValueSection
                sectionTitle="Current Position"
                items={current || []}
              />,
            ]
          ) : updated === undefined ? (
            <LabelValueSection items={current || []} />
          ) : (
            [
              <LabelValueSection
                sectionTitle="Updated Position"
                items={updated}
                key="updated"
              />,
              <LabelValueSection
                sectionTitle="Current Position"
                items={current || []}
                key="current"
              />,
            ]
          )}
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
