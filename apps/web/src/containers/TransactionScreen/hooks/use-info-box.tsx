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
  useVaultPosition,
} from '@notional-finance/notionable-hooks';
import {
  formatNumber,
  formatNumberAsPercent,
  RATE_PRECISION,
} from '@notional-finance/util';
import { formatNumberAsPercentWithUndefined } from '@notional-finance/helpers';
import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import moment from 'moment';
import { TokenIcon } from '@notional-finance/icons';

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
  const c = Array.isArray(children)
    ? children.flatMap((c) => c).filter((c) => !!c)
    : children;

  return (
    <Box>
      {Array.isArray(c)
        ? c.map((child, index) => (
            <Box key={index}>
              {child}
              {index !== c.length - 1 && (
                <Divider
                  sx={{
                    margin: theme.spacing(3, 0),
                    backgroundColor: theme.palette.borders.default,
                  }}
                />
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

const useRewardClaims = (isBeingClaimed: boolean) => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const position = useVaultPosition(
    trade?.selectedNetwork,
    trade?.vaultAddress
  );
  const rewardClaims = position?.vaultMetadata.rewardClaims.map((claim) => {
    return {
      label: (
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}
        >
          <TokenIcon symbol={claim.symbol} size="small" />
          <Label light>
            {claim.symbol} Rewards{isBeingClaimed ? ' Claimed' : ''}
          </Label>
        </Box>
      ),
      content: formatCountUp(claim),
    };
  });

  return rewardClaims || [];
};

const useSummaryItems = () => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const r = trade?.getVaultRiskSummary();
  const noPositionItems = [
    {
      label: <FormattedMessage defaultMessage={'Net Worth'} />,
      content: '-',
    },
    {
      label: <FormattedMessage defaultMessage={'Health Factor'} />,
      content: '-',
    },
    {
      label: <FormattedMessage defaultMessage={'Leverage Ratio'} />,
      content: '-',
    },
  ];
  const updatedItems = r?.updated
    ? formatSummaryItems(r.updated, theme)
    : undefined;
  const currentItems =
    r?.current && r.current.netWorth !== undefined
      ? formatSummaryItems(r.current, theme)
      : updatedItems === undefined
      ? noPositionItems
      : undefined;

  return {
    current: currentItems,
    updated: updatedItems,
  };
};

function formatAPYValues(
  apy: number | undefined,
  amount: TokenBalance | undefined,
  positiveGreen: string | undefined
) {
  const earnings =
    amount && apy !== undefined
      ? amount.mulInRatePrecision(Math.floor((apy * RATE_PRECISION) / 100))
      : undefined;

  return [
    { value: formatNumberAsPercentWithUndefined(apy, '-', 4) },
    {
      value: (
        <Box
          color={
            apy !== undefined && apy > 0 && earnings?.isPositive()
              ? positiveGreen
              : undefined
          }
        >
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
  const unleveragedAssetAPY = leveragedAPY?.unleveragedAssetAPY;
  const strategyType = trade?.strategyType;
  let points: { label: string; values: { value: string }[] }[] | undefined;
  let incentives:
    | { label: string; values: { value: ReactNode }[] }[]
    | undefined;

  if (leveragedAPY?.pointMultiples) {
    // These are leveraged point multiples
    points = Object.entries(leveragedAPY.pointMultiples).map(([key, value]) => {
      return {
        label: key,
        values: [{ value: `${formatNumber(value)}x` }],
      };
    });
  }

  if (unleveragedAssetAPY?.incentives) {
    incentives = unleveragedAssetAPY.incentives.map(
      ({ symbol, incentiveAPY }) => {
        return {
          label: symbol,
          values: formatAPYValues(
            incentiveAPY,
            assets,
            theme.palette.success.main
          ),
        };
      }
    );
  }

  const organicAPYLabel =
    strategyType === 'Staking'
      ? 'Staking APY'
      : strategyType === 'PendlePT'
      ? 'PT APY'
      : strategyType === 'CurveConvex2Token'
      ? 'LP Fee APY'
      : 'Organic APY';

  const apy = [
    {
      label: organicAPYLabel,
      values: formatAPYValues(
        unleveragedAssetAPY?.organicAPY,
        assets,
        theme.palette.success.main
      ),
    },
    ...(incentives || []),
    {
      label: 'Vault Fee APY',
      values: formatAPYValues(
        unleveragedAssetAPY?.feeAPY,
        assets?.neg(),
        undefined
      ),
    },
    {
      label: 'Borrow APY',
      values: formatAPYValues(leveragedAPY?.debtAPY, debts, undefined),
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

  if (trade?.tradeType === 'InitiateWithdraw') {
    const withdraws = trade.getVaultInitiateWithdraw();
    withdraws?.forEach((withdraw) => {
      orderDetails.push({
        label: 'Tokens Received',
        content: formatCountUp(withdraw.tokensToReceive),
      });
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
    const items: { label: ReactNode; content: ReactNode }[] = [];
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

const useTradeMetadata = () => {
  const trade = useCurrentTradeContext();
  if (trade?.tradeType === 'ManageVault') return undefined;
  return trade?.vaultTradeMetadata?.map((metadata, index) => {
    return (
      <LabelValueSection
        key={index}
        sectionTitle={`Trade: ${metadata.tokensSold.symbol} → ${metadata.tokensBought.symbol}`}
        items={[
          { label: 'Amount Sold', content: formatCountUp(metadata.tokensSold) },
          {
            label: 'Amount Bought',
            content: formatCountUp(metadata.tokensBought),
          },
          {
            label: 'Exchange Rate',
            content: (
              <Box>
                {metadata.differenceFromSpot && (
                  <LabelValue light inline>
                    {`(${formatNumberAsPercent(
                      metadata.differenceFromSpot,
                      4
                    )}) `}
                  </LabelValue>
                )}
                <LabelValue inline>
                  {formatNumber(metadata.exchangeRate, 4)}
                </LabelValue>
              </Box>
            ),
          },
        ]}
      />
    );
  });
};

export const useInfoBox = () => {
  const { current, updated } = useSummaryItems();
  const trade = useCurrentTradeContext();
  const apyBreakdown = useApyBreakdown();
  const orderDetails = useOrderDetails();
  const withdrawDetails = useWithdrawDetails();
  const tradeMetadata = useTradeMetadata();
  const rewardClaims = useRewardClaims(
    withdrawDetails !== undefined || updated !== undefined
  );

  const tabs = [
    {
      tabTitle: 'Summary',
      tabContent: (
        <DividedSections>
          {withdrawDetails ? (
            [
              <LabelValueSection
                key="withdraw-details"
                sectionTitle="Withdraw Details"
                // Rewards will be claimed during withdraw
                items={withdrawDetails.concat(rewardClaims)}
              />,
              <LabelValueSection
                key="current-position"
                sectionTitle="Current Position"
                items={current || []}
              />,
            ]
          ) : updated !== undefined && current === undefined ? (
            // This happens when there is no existing position
            <LabelValueSection items={updated || []} key="updated" />
          ) : updated === undefined ? (
            [
              <LabelValueSection items={current || []} key="current" />,
              // If there are reward claims show them in a separate section
              rewardClaims.length > 0 ? (
                <LabelValueSection
                  key="reward-claims"
                  sectionTitle="Claimable Rewards"
                  items={rewardClaims}
                />
              ) : undefined,
            ]
          ) : (
            [
              <LabelValueSection
                sectionTitle="Updated Position"
                items={updated.concat(rewardClaims)}
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
              key="points"
              headings={[
                defineMessage({ defaultMessage: 'Points' }),
                defineMessage({ defaultMessage: 'Multiplier' }),
              ]}
              contents={apyBreakdown.points}
            />
          )}
          <TableSection
            key="apy"
            highlightLastRow
            headings={[
              defineMessage({ defaultMessage: 'Source' }),
              defineMessage({ defaultMessage: 'APY' }),
              defineMessage({ defaultMessage: 'Earnings (1yr)' }),
            ]}
            contents={apyBreakdown.apy}
          />
          <LabelValueSection
            key="assets-debts"
            items={apyBreakdown.assetsDebts}
          />
        </DividedSections>
      ),
    },
  ];

  if (trade?.tradeType !== 'ManageVault') {
    tabs.push({
      tabTitle: 'Order Details',
      tabContent: (
        <DividedSections>
          <LabelValueSection key="order-details" items={orderDetails} />
          {tradeMetadata}
        </DividedSections>
      ),
    });
  }

  return tabs;
};
