import { defineMessage, FormattedMessage } from 'react-intl';
import { useHistory, useParams } from 'react-router-dom';
import { Box, styled, Divider } from '@mui/material';
import { Button, InfoTooltip } from '@notional-finance/mui';
import { useTableActionRow } from './use-table-action-row';
import { PortfolioParams } from '../../portfolio-feature-shell';
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
  const buttonText =
    original?.route === 'manage-lend' ? 'Manage Lend' : 'Manage Borrow';

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
                <FormattedMessage
                  defaultMessage={'Roll Or Convert To Variable'}
                />
                <InfoTooltip
                  toolTipText={defineMessage({
                    defaultMessage:
                      'Trade your loan to a longer dated maturity at a new fixed interest rate',
                    description: 'tool tip text',
                  })}
                  sx={{ marginLeft: '10px' }}
                />
              </Label>
              <Button
                variant="contained"
                size="large"
                sx={{
                  marginRight: '20px',
                }}
                onClick={() => {
                  history.push(`/portfolio/${category}/${original.route}`);
                }}
              >
                <Box>{buttonText}</Box>
              </Button>
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

export const MainContainer = styled(Box)(
  ({ theme }) => `
  margin: ${theme.spacing(2.5)};
  display: flex;
  border: 1px solid ${theme.palette.borders.paper};
  border-radius: 6px;
`
);

export default TableActionRow;
