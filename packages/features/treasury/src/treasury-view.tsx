import {
  Box,
  styled,
  Typography,
  Button,
  useTheme,
  Input,
} from '@mui/material';
import { formatBigNumberToDecimals } from '@notional-finance/helpers';
import {
  CurrencyInput,
  DataTable,
  TABLE_VARIANTS,
  LabeledText,
  MiniButton,
  SideBarLayout,
} from '@notional-finance/mui';
import { BigNumber } from 'ethers';
import { useTreasuryReservesTable } from './lib/use-treasury-reserves';
import { useOpenOrderTable } from './lib/use-open-orders';
import { updateTreasuryState } from './lib/treasury-store';
import { useTreasury } from './lib/use-treasury';
import { FormattedMessage } from 'react-intl';

export const TreasuryView = () => {
  const theme = useTheme();
  const { tableData, tableColumns } = useTreasuryReservesTable();
  const { tableData: openOrderTableData, tableColumns: openOrderColumns } =
    useOpenOrderTable();

  const {
    isTreasuryManager,
    tradeReserveStatus,
    tradePriceFloor,
    tradeSpotPrice,
    selectedReserveCurrency,
    tradeReserveAmountError,
    tradeCurrentPrice,
    investNOTEError,
    investWETHError,
    maxAmounts,
    tradeReserve,
    harvestCOMP,
    harvestReserves,
    cancelOrder,
    fetchZeroExQuote,
    investNOTE,
  } = useTreasury();

  const { maxReserveAmount, maxNOTEAmount, maxETHAmount } = maxAmounts;

  const formattedPriceFloor = tradePriceFloor?.gt(0)
    ? formatBigNumberToDecimals(
        BigNumber.from(10).pow(36).div(tradePriceFloor),
        18,
        3
      )
    : '';
  const formattedSpotPrice = tradeSpotPrice?.gt(0)
    ? formatBigNumberToDecimals(
        BigNumber.from(10).pow(36).div(tradeSpotPrice),
        18,
        3
      )
    : '';
  const formattedCurrentPrice = tradeCurrentPrice?.gt(0)
    ? formatBigNumberToDecimals(
        BigNumber.from(10).pow(36).div(tradeCurrentPrice),
        18,
        3
      )
    : '';

  const mainContent = (
    <Container>
      <Section>
        <Typography variant="h3" sx={{ marginBottom: '1rem' }}>
          Manage Reserves
        </Typography>
        <DataTable
          tableTitle={
            <div>
              <FormattedMessage
                defaultMessage="Reserve Balance Sheet"
                description="Reserve Balance Table Title"
              />
            </div>
          }
          data={tableData}
          columns={tableColumns}
          hideExcessRows={false}
        />
        <Button
          sx={{ marginTop: '1rem' }}
          color="primary"
          size="large"
          variant={'contained'}
          disabled={!isTreasuryManager}
          onClick={harvestCOMP}
        >
          Harvest COMP
        </Button>
        <Button
          sx={{ marginTop: '1rem', marginLeft: '1rem' }}
          color="primary"
          size="large"
          variant={'contained'}
          disabled={!isTreasuryManager}
          onClick={harvestReserves}
        >
          Harvest Reserves
        </Button>
      </Section>
      <Section>
        <Typography variant="h3" sx={{ marginBottom: '1rem' }}>
          Trade Reserves
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <CurrencyInput
            placeholder="Sell reserve asset"
            decimals={8}
            onInputChange={(v) => updateTreasuryState({ inputTradeReserve: v })}
            onSelectChange={(s) =>
              s ? updateTreasuryState({ selectedReserveCurrency: s }) : null
            }
            maxValue={maxReserveAmount}
            errorMsg={tradeReserveAmountError}
            defaultValue={'COMP'}
            currencies={['DAI', 'USDC', 'WBTC', 'COMP']}
          />
          <Typography
            variant="body1"
            sx={{ marginRight: '1rem', marginLeft: '1rem' }}
          >
            for
          </Typography>
          <CurrencyInput
            placeholder="WETH amount"
            decimals={18}
            onInputChange={(v) => updateTreasuryState({ inputTradeWETH: v })}
            errorMsg={''}
            defaultValue={'WETH'}
            currencies={['WETH']}
          />
          <Button
            sx={{ marginLeft: '1rem' }}
            color="primary"
            size="large"
            variant={'contained'}
            disabled={!isTreasuryManager}
            onClick={tradeReserve}
          >
            Submit
          </Button>
        </Box>
        <Box
          sx={{
            marginTop: '1rem',
            width: '89%',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '1rem',
            borderRadius: theme.shape.borderRadiusLarge,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <LabeledText
            label="Input Price"
            value={`${
              formattedCurrentPrice || '--'
            } ${selectedReserveCurrency}/WETH`}
            labelAbove
          />
          <LabeledText
            label="Spot Price"
            value={`${formattedSpotPrice} ${selectedReserveCurrency}/WETH`}
            labelAbove
          />
          <LabeledText
            label="Max Price"
            value={`${formattedPriceFloor} ${selectedReserveCurrency}/WETH`}
            labelAbove
          />
          <MiniButton
            label="Use 0x Quote"
            isVisible
            onClick={fetchZeroExQuote}
          />
          <LabeledText label="Status" value={tradeReserveStatus} labelAbove />
        </Box>
        {openOrderTableData && openOrderTableData.length > 0 && (
          <Box
            sx={{
              marginTop: '1rem',
              width: '89%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
              }}
            >
              <Input
                sx={{
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  marginRight: '1rem',
                  width: '7rem',
                }}
                placeholder={'Order Id'}
                onChange={(event) => {
                  updateTreasuryState({ cancelOrderId: event.target.value });
                }}
              />
              <MiniButton
                label="Cancel Order"
                isVisible
                onClick={cancelOrder}
              />
            </Box>
            <DataTable
              tableTitle={
                <div>
                  <FormattedMessage
                    defaultMessage="Open 0x Limit Orders"
                    description="Open 0x Limit Orders Table Title"
                  />
                </div>
              }
              data={openOrderTableData}
              columns={openOrderColumns}
              hideExcessRows={false}
            />
          </Box>
        )}
      </Section>
      <Section>
        <Typography variant="h3" sx={{ marginBottom: '1rem' }}>
          Invest into sNOTE
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <CurrencyInput
            placeholder="NOTE to Invest"
            decimals={8}
            onInputChange={(v) => updateTreasuryState({ inputInvestNOTE: v })}
            defaultValue={'NOTE'}
            maxValue={maxNOTEAmount}
            errorMsg={investNOTEError}
            currencies={['NOTE']}
          />
          <Typography
            variant="body1"
            sx={{ marginRight: '1rem', marginLeft: '1rem' }}
          >
            and
          </Typography>
          <CurrencyInput
            placeholder="WETH amount"
            decimals={18}
            onInputChange={(v) => updateTreasuryState({ inputInvestETH: v })}
            maxValue={maxETHAmount}
            errorMsg={investWETHError}
            defaultValue={'WETH'}
            currencies={['WETH']}
          />
          <Button
            sx={{ marginLeft: '1rem' }}
            color="primary"
            size="large"
            variant={'contained'}
            disabled={!isTreasuryManager}
            onClick={investNOTE}
          >
            Submit
          </Button>
        </Box>
      </Section>
    </Container>
  );

  return <SideBarLayout mainContent={mainContent} sideBar={<div></div>} />;
};

const Container = styled(Box)`
  max-width: 1200px;
  margin: 0 auto;
`;

const Section = styled(Box)(
  ({ theme }) => `
  margin-bottom: 3rem;
  background: ${theme.palette.common.white};
  padding: 20px;
  border-radius: ${theme.shape.borderRadius()};
`
);

export default TreasuryView;
