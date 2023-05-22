import { defineMessage, FormattedMessage } from 'react-intl';
import { useHistory, useParams } from 'react-router-dom';
import { Box, styled, Divider } from '@mui/material';
import { Button, InfoTooltip } from '@notional-finance/mui';
import { useTableActionRow } from './use-table-action-row';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { MaturityData } from '@notional-finance/notionable';
import { RemindMe } from '../remind-me/remind-me';
import { ActionRowButton } from '../action-row-button/action-row-button';
import { Label } from '../../types';

export const TableActionRow = ({ row }) => {
  const history = useHistory();
  const { category } = useParams<PortfolioParams>();
  const { actionLabel, toolTip } = useTableActionRow();
  const { original } = row;
  const maturityData = original?.rollMaturities;
  const removeAssetRoute = original?.removeAssetRoute;
  const rawMaturity = original?.rawMaturity;

  return (
    <MainContainer>
      <Box sx={{ display: 'flex', width: '100%' }}>
        {removeAssetRoute && actionLabel && (
          <ActionRowButton
            label={actionLabel}
            tooltip={toolTip}
            route={`/portfolio/${category}/${removeAssetRoute}`}
          />
        )}
        {maturityData && maturityData.length > 0 && (
          <>
            <CustomDivider orientation="vertical" flexItem>
              <FormattedMessage defaultMessage={'OR'} />
            </CustomDivider>
            <Box sx={{ marginBottom: '20px', flex: 1, whiteSpace: 'nowrap' }}>
              <Label>
                <FormattedMessage defaultMessage={'Roll Maturity'} />
                <InfoTooltip
                  toolTipText={defineMessage({
                    defaultMessage:
                      'Trade your loan to a longer dated maturity at a new fixed interest rate',
                    description: 'tool tip text',
                  })}
                  sx={{ marginLeft: '10px' }}
                />
              </Label>
              {maturityData.map((data: MaturityData) => (
                <CustomButton
                  variant="contained"
                  key={data.marketKey}
                  sx={{
                    marginRight: '20px',
                    padding: '9px 20px',
                  }}
                  onClick={() => {
                    history.push(
                      `/portfolio/${category}/${data.rollMaturityRoute}`
                    );
                  }}
                >
                  <Box>
                    <MaturityDate>{data.maturity}</MaturityDate>
                    <Box>{data.tradeRateString}</Box>
                  </Box>
                </CustomButton>
              ))}
            </Box>
          </>
        )}
      </Box>
      <RemindMe futureDate={rawMaturity} />
    </MainContainer>
  );
};

const CustomDivider = styled(Divider)(
  ({ theme }) => `
  color: ${theme.palette.borders.accentPaper};
  margin: 0px ${theme.spacing(2)};
  span {
    font-size: 12px;
  }
`
);

const MaturityDate = styled('span')(
  ({ theme }) => `
  color: ${theme.palette.borders.default};
  font-size: 12px;
  font-weight: 600;
`
);

export const MainContainer = styled(Box)(
  ({ theme }) => `
  margin: ${theme.spacing(2.5)};
  display: flex;
  border: 1px solid ${theme.palette.borders.paper};
  border-radius: 6px;
`
);

export const CustomButton = styled(Button)`
  padding: 1.25rem;
  font-size: 16px;
`;

export default TableActionRow;
