import { useState } from 'react';
import { styled, Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { colors } from '@notional-finance/styles';
import {
  FeatureLoader,
  H1,
  ButtonBar,
  DataTable,
  TABLE_VARIANTS,
  MultiSelectDropdown,
} from '@notional-finance/mui';
import { MARKET_TYPE } from '@notional-finance/shared-config';
import { useButtonBar, useMarketsTable } from './hooks';

export const Markets = () => {
  const options = [
    { id: '1', title: 'option 1' },
    { id: '2', title: 'option 2' },
    { id: '3', title: 'option 3' },
    { id: '4', title: 'option 4' },
    { id: '5', title: 'option 5' },
  ];

  const [marketType, setMarketType] = useState<MARKET_TYPE>(MARKET_TYPE.EARN);
  const buttonData = useButtonBar(setMarketType, marketType);
  const { marketTableColumns, marketTableData } = useMarketsTable(marketType);
  const [selected, setSelected] = useState([]);

  const theme = useTheme();

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
              customButtonColor={colors.neonTurquoise}
              sx={{
                background: colors.black,
                borderRadius: theme.shape.borderRadius(),
              }}
            />
          </StyledTopContent>
        </Background>
        <Box
          sx={{
            maxWidth: '1335px',
            margin: 'auto',
            marginTop: '-240px',
            marginBottom: '160px',
          }}
        >
          <MultiSelectDropdown
            options={options}
            selected={selected}
            setSelected={setSelected}
            placeHolderText={<FormattedMessage defaultMessage={'Currency'} />}
          />
          <DataTable
            data={marketTableData}
            columns={marketTableColumns}
            tableVariant={TABLE_VARIANTS.SORTABLE}
          />
        </Box>
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
  }
`
);

export default Markets;
