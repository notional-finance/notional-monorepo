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

  return (
    <Box>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <Box key={index}>
              {child}
              {index !== children.length - 1 && (
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

export const useInfoBox = () => {
  const summaryItems = useSummaryItems();

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
          <TableSection
            headings={[
              defineMessage({ defaultMessage: 'Points' }),
              defineMessage({ defaultMessage: 'Multiplier' }),
              defineMessage({ defaultMessage: 'Points/Day' }),
            ]}
            contents={[
              {
                label: 'EigenLayer',
                values: [{ value: '40x' }, { value: '100.00' }],
              },
              {
                label: 'ezPoints',
                values: [{ value: '20x' }, { value: '250.22' }],
              },
            ]}
          />
          <TableSection
            highlightLastRow
            headings={[
              defineMessage({ defaultMessage: 'Source' }),
              defineMessage({ defaultMessage: 'APY' }),
              defineMessage({ defaultMessage: 'Earnings (1yr)' }),
            ]}
            contents={[
              {
                label: 'Vault Shares',
                values: [
                  { value: '7.25%' },
                  { value: '35,000 USDC', primary: true },
                ],
              },
              {
                label: 'Borrow Interest',
                values: [
                  { value: '-1.25%' },
                  { value: '-1,000 USDC', primary: false },
                ],
              },
              {
                label: 'Total APY',
                values: [
                  { value: '6.0%' },
                  { value: '34,000 USDC', primary: true },
                ],
              },
            ]}
          />
          <LabelValueSection
            items={[
              { label: 'Asset Amount', content: '-' },
              { label: 'Debt Amount', content: '-' },
            ]}
          />
        </DividedSections>
      ),
    },
    {
      tabTitle: 'Order Details',
      tabContent: (
        <DividedSections>
          <LabelValueSection
            items={[
              {
                label: 'Amount Deposited',
                content: '-',
              },
              {
                label: 'Amount Borrowed',
                content: '-',
              },
              {
                label: 'Vault Shares Minted',
                content: '-',
              },
              {
                label: 'Vault Share Price',
                content: '-',
              },
            ]}
          />
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
