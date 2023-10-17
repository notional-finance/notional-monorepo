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
import { MARKET_TYPE } from '@notional-finance/util';
import {
  useButtonBar,
  useMarketsTable,
  useMarketTableDropdowns,
} from './hooks';
import { FeatureLoader } from '@notional-finance/shared-web';

export const Markets = () => {
  const theme = useTheme();
  const [marketType, setMarketType] = useState<MARKET_TYPE>(MARKET_TYPE.EARN);
  const buttonData = useButtonBar(setMarketType, marketType);
  const { dropdownsData, currencyOptions, productOptions } =
    useMarketTableDropdowns(marketType);

  const { marketTableColumns, marketTableData, marketDataCSVFormatter } =
    useMarketsTable(marketType, currencyOptions, productOptions);

  return (
    <FeatureLoader featureLoaded={true}>
      <Box>
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
        <TableContainer>
          <DataTable
            maxHeight="620px"
            data={marketTableData}
            columns={marketTableColumns}
            tableVariant={TABLE_VARIANTS.SORTABLE}
            filterBarData={dropdownsData}
            marketDataCSVFormatter={marketDataCSVFormatter}
          />
        </TableContainer>
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

const TableContainer = styled(Box)(
  ({ theme }) => `
  max-width: 1335px;
  margin: auto;
  margin-top: -240px;
  margin-bottom: 160px;
  ${theme.breakpoints.down('sm')} {
    margin-top: 0px;
    margin-bottom: 0px;
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
    height: ${theme.spacing(10)};
    padding-top: 75px;
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
    margin-left: ${theme.spacing(2)};
    margin-right: ${theme.spacing(2)};
    min-height: ${theme.spacing(10)};
  }
`
);

export default Markets;
