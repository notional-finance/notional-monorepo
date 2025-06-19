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
import { defineMessage } from 'react-intl';
import { formatNumber, formatNumberAsPercent } from '@notional-finance/util';

interface LabelValueTabProps {
  contents: {
    sectionTitle: string;
    items: { label: string; content: ReactNode | string }[];
  }[];
}

const LabelValueTab = ({ contents }: LabelValueTabProps) => {
  const theme = useTheme();

  return (
    <Box>
      {contents.map((content, index, array) => (
        <Box key={content.sectionTitle}>
          <H5 main marginBottom={theme.spacing(1.5)}>
            {content.sectionTitle}
          </H5>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {content.items.map((item) => (
              <Box
                key={item.label}
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
          {index !== array.length - 1 && (
            <Divider
              sx={{
                margin: theme.spacing(3, 0),
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

interface APYBreakdownTabProps {
  earningsSymbol: string;
  contents: {
    source: string;
    apy: number;
    earnings: number;
  }[];
}

const DenseTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  borderBottom: 'none',
}));

const APYBreakdownTab = ({
  earningsSymbol,
  contents,
}: APYBreakdownTabProps) => {
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
            <DenseTableCell align="left">
              <TableColumnHeading
                msg={defineMessage({ defaultMessage: 'Source' })}
              />
            </DenseTableCell>
            <DenseTableCell align="right">
              <TableColumnHeading
                msg={defineMessage({ defaultMessage: 'APY' })}
              />
            </DenseTableCell>
            <DenseTableCell align="right">
              <TableColumnHeading
                msg={defineMessage({ defaultMessage: 'Earnings (1yr)' })}
              />
            </DenseTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contents.map((content, index, array) => (
            <TableRow
              key={content.source}
              sx={{
                ...(index === array.length - 1 && {
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
                <SmallTableCell>{content.source}</SmallTableCell>
              </DenseTableCell>
              <DenseTableCell align="right">
                <SmallTableCell main>
                  {formatNumberAsPercent(content.apy)}
                </SmallTableCell>
              </DenseTableCell>
              <DenseTableCell align="right">
                <SmallTableCell
                  primary={content.earnings > 0}
                  main={content.earnings <= 0}
                >
                  {formatNumber(content.earnings, 0)} {earningsSymbol}
                </SmallTableCell>
              </DenseTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const useInfoBox = () => {
  const tabs = [
    {
      tabTitle: 'Summary',
      tabContent: (
        <LabelValueTab
          contents={[
            {
              sectionTitle: 'Summary',
              items: [
                {
                  label: 'Net Worth',
                  content: '-',
                },
                {
                  label: 'Health Factor',
                  content: '-',
                },
                {
                  label: 'Leverage Ratio',
                  content: '-',
                },
                {
                  label: 'Liquidation Price',
                  content: '-',
                },
              ],
            },
            {
              sectionTitle: 'Estimated Earnings (30d)',
              items: [
                {
                  label: 'Assets',
                  content: '-',
                },
                {
                  label: 'Borrow Interest',
                  content: '-',
                },
                {
                  label: 'Net Earnings',
                  content: '-',
                },
              ],
            },
            {
              sectionTitle: 'Fees',
              items: [
                {
                  label: 'Trading Costs',
                  content: '-',
                },
              ],
            },
          ]}
        />
      ),
    },
    {
      tabTitle: 'APY Breakdown',
      tabContent: (
        <APYBreakdownTab
          earningsSymbol="USDC"
          contents={[
            { source: 'Vault Shares', apy: 7.25, earnings: 35000 },
            { source: 'Borrow Interest', apy: -1.25, earnings: -1000 },
            { source: 'Net Earnings', apy: 6.0, earnings: 34000 },
          ]}
        />
      ),
    },
    {
      tabTitle: 'Order Details',
      tabContent: (
        <LabelValueTab
          contents={[
            {
              sectionTitle: '',
              items: [
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
              ],
            },
            {
              sectionTitle: 'Trade: USDC → USDT',
              items: [
                {
                  label: 'Amount Sold',
                  content: '-',
                },
                {
                  label: 'Amount Bought',
                  content: '-',
                },
                {
                  label: 'Exchange Rate',
                  content: '-',
                },
                {
                  label: 'Fees',
                  content: '-',
                },
              ],
            },
          ]}
        />
      ),
    },
  ];

  return tabs;
};
