import { useState } from 'react';
import { styled, Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { colors } from '@notional-finance/styles';
import {
  H1,
  ButtonBar,
  DataTable,
  TABLE_VARIANTS,
} from '@notional-finance/mui';
import { MARKET_TYPE, Network } from '@notional-finance/util';
import {
  useButtonBar,
  useMarketsTable,
  useMarketTableDropdowns,
} from './hooks';
import { FeatureLoader } from '@notional-finance/shared-web';
import { useSelectedPortfolioNetwork } from '@notional-finance/notionable-hooks';
import { MarketsMobileNav, MobileFilterOptions } from './components';

export const Markets = () => {
  const theme = useTheme();
  const network = useSelectedPortfolioNetwork();
  const [marketType, setMarketType] = useState<MARKET_TYPE>(MARKET_TYPE.EARN);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const buttonData = useButtonBar(setMarketType, marketType);
  const { dropdownsData, currencyOptions, productOptions } =
    useMarketTableDropdowns(marketType, network || Network.ArbitrumOne);

  const { marketTableColumns, marketTableData, marketDataCSVFormatter } =
    useMarketsTable(marketType, currencyOptions, productOptions);

  return (
    <FeatureLoader featureLoaded={true}>
      <Box sx={{ marginBottom: theme.spacing(20) }}>
        <Background>
          <StyledTopContent>
            <Title gutter="default">
              <FormattedMessage defaultMessage={'Markets'} />
            </Title>
            <ButtonBar
              buttonOptions={buttonData}
              buttonVariant="outlined"
              customButtonColor={colors.black}
              customButtonBGColor={colors.neonTurquoise}
              sx={{
                background: colors.black,
                borderRadius: theme.shape.borderRadius(),
              }}
            />
          </StyledTopContent>
        </Background>
        <MobileTitle>
          <Title sx={{ marginBottom: theme.spacing(5) }}>
            <FormattedMessage defaultMessage={'Markets'} />
          </Title>
        </MobileTitle>
        <TableContainer>
          <DataTable
            data={marketTableData}
            columns={marketTableColumns}
            tableVariant={TABLE_VARIANTS.SORTABLE}
            filterBarData={dropdownsData}
            marketDataCSVFormatter={marketDataCSVFormatter}
          />
        </TableContainer>
        <MarketsMobileNav
          setMarketType={setMarketType}
          marketType={marketType}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
        />
        <MobileFilterOptions
          filterData={dropdownsData.reverse()}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
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
  min-height: ${theme.spacing(33)};
  display: flex;
  flex-direction: column;
  margin: auto;
  ${theme.breakpoints.down('lg')} {
    margin-left: ${theme.spacing(6)};
    margin-right: ${theme.spacing(6)};
  }
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

export default Markets;
