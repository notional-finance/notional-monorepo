import { styled, Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { colors } from '@notional-finance/styles';
import {
  H1,
  DataTable,
  TABLE_VARIANTS,
  Subtitle,
  MobileNavWithFilter,
} from '@notional-finance/mui';
import { StackIcon } from '@notional-finance/icons';
import {
  useEarnBorrowOptions,
  useMarketsTable,
  useMarketTableDropdowns,
  useMarketsMobileNav,
  useAllNetworksToggle,
} from './hooks';
import { FeatureLoader } from '@notional-finance/shared-web';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';

const Markets = () => {
  const theme = useTheme();
  const rightToggleData = useEarnBorrowOptions();
  const allNetworksToggleData = useAllNetworksToggle();
  const earnBorrowOption = rightToggleData.toggleKey || 0;
  const allNetworksOption = allNetworksToggleData.toggleKey || 0;
  const options = useMarketsMobileNav(
    rightToggleData.setToggleKey,
    earnBorrowOption
  );

  const { dropdownsData, currencyOptions, productOptions } =
    useMarketTableDropdowns(earnBorrowOption, allNetworksOption);
  const { baseCurrency } = useAppStore();
  const { marketTableColumns, marketTableData, marketDataCSVFormatter } =
    useMarketsTable(
      earnBorrowOption,
      allNetworksOption,
      currencyOptions,
      productOptions,
      baseCurrency
    );

  return (
    <FeatureLoader featureLoaded={true}>
      <Box sx={{ marginBottom: theme.spacing(20) }}>
        <Background>
          <StyledTopContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: theme.spacing(2),
              }}
            >
              <StackIcon
                className="color-fill"
                sx={{
                  height: theme.spacing(6),
                  width: theme.spacing(6),
                  fill: colors.white,
                  stroke: 'transparent',
                }}
              />
              <Title
                gutter="default"
                sx={{ marginLeft: theme.spacing(3), marginBottom: '0px' }}
              >
                <FormattedMessage defaultMessage={'Markets'} />
              </Title>
            </Box>
            <Subtitle
              sx={{
                width: '600px',
                color: colors.white,
                marginBottom: theme.spacing(8),
              }}
            >
              <FormattedMessage
                defaultMessage={
                  'See all our opportunities and filter/sort to your liking. Filter by product, currency, and network to find the opportunity that’s right for you.'
                }
              />
            </Subtitle>
          </StyledTopContent>
        </Background>
        <MobileTitle>
          <Title sx={{ marginBottom: theme.spacing(5) }}>
            <FormattedMessage defaultMessage={'Markets'} />
          </Title>
        </MobileTitle>
        <TableContainer>
          <DataTable
            accentCSV
            data={marketTableData}
            columns={marketTableColumns}
            tableVariant={TABLE_VARIANTS.SORTABLE}
            filterBarData={dropdownsData}
            rightToggleData={rightToggleData}
            allNetworksToggleData={allNetworksToggleData}
            csvDataFormatter={marketDataCSVFormatter}
          />
        </TableContainer>
        <MobileNavWithFilter
          setEarnBorrowOption={rightToggleData.setToggleKey}
          earnBorrowOption={earnBorrowOption}
          filterData={dropdownsData.reverse()}
          options={options}
        />
      </Box>
    </FeatureLoader>
  );
};

const Title = styled(H1)(
  ({ theme }) => `
  color: ${colors.white};
  display: flex;
  align-items: center;
  ${theme.breakpoints.down('sm')} {
    font-size: 36px;
  }
`
);

const MobileTitle = styled(Box)(
  ({ theme }) => `
  display: none;
  ${theme.breakpoints.down('sm')} {
    padding-left: ${theme.spacing(2)};
    padding-top: ${theme.spacing(8)};
    display: flex;
    background: linear-gradient(90deg, #053542 28.68%, #06657E 126.35%);
  }
`
);

const TableContainer = styled(Box)(
  ({ theme }) => `
  max-width: ${theme.spacing(167)};
  margin: auto;
  margin-top: -${theme.spacing(30)};
  margin-bottom: ${theme.spacing(20)};
  ${theme.breakpoints.down('sm')} {
    margin-top: 0px;
    margin-bottom: ${theme.spacing(7.5)};
  }
`
);

const Background = styled(Box)(
  ({ theme }) => `
  background: linear-gradient(90deg, #053542 28.68%, #06657E 126.35%);
  height: ${theme.spacing(69)};
  display: flex;
  align-items: center;
  min-width: 100%;
  ${theme.breakpoints.down('md')} {
    height: ${theme.spacing(94)};
  }
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

const StyledTopContent = styled(Box)(
  ({ theme }) => `
  width: 100%;
  max-width: 1335px;
  display: flex;
  flex-direction: column;
  margin: auto;
  margin-top: ${theme.spacing(18.75)};
  ${theme.breakpoints.down('lg')} {
    margin-left: ${theme.spacing(6)};
    margin-right: ${theme.spacing(6)};
  }
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

export default observer(Markets);
