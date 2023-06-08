import { useState } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import {
  LabelValue,
  LargeInputTextEmphasized,
  SideDrawerButton,
  ButtonText,
  H4,
  ProgressIndicator,
} from '@notional-finance/mui';
import { RollMaturity } from '../roll-maturity/roll-maturity';
import { LEND_BORROW } from '@notional-finance/shared-config';
import { FormattedMessage } from 'react-intl';
import { useLocation, useHistory } from 'react-router-dom';
import { useManageMaturities } from './use-manage-maturities';
import { messages } from '../messages';

export const ManageMaturities = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const [loaded, setLoaded] = useState(false);
  const [showRollMaturity, setShowRollMaturity] = useState(false);
  const history = useHistory();
  const borrowOrLend = pathname.includes('manage-borrow')
    ? LEND_BORROW.BORROW
    : LEND_BORROW.LEND;

  const portfolioAction = pathname.includes('manage-borrow')
    ? PORTFOLIO_ACTIONS.MANAGE_BORROW
    : PORTFOLIO_ACTIONS.MANAGE_LEND;

  const rollMaturities = useManageMaturities(borrowOrLend);

  const handleMaturityClick = (route: string) => {
    history.push(`${pathname}/${route}`);
    setShowRollMaturity(true);
  };

  setTimeout(() => {
    setLoaded(true);
  }, 3000);

  return (
    <Box>
      {!showRollMaturity ? (
        <>
          <LargeInputTextEmphasized
            gutter="default"
            sx={{ marginBottom: theme.spacing(5) }}
          >
            <FormattedMessage {...messages[portfolioAction].heading} />
          </LargeInputTextEmphasized>
          <LabelValue
            sx={{
              fontWeight: 700,
              color: theme.palette.borders.accentDefault,
              marginBottom: theme.spacing(2),
            }}
          >
            <FormattedMessage defaultMessage={'ROLL MATURITY'} />
          </LabelValue>
          {loaded &&
            rollMaturities.length > 0 &&
            rollMaturities.map((data, index) => (
              <SideDrawerButton
                key={index}
                onClick={() =>
                  handleMaturityClick(data?.rollMaturityRoute || '')
                }
                sx={{
                  cursor: 'pointer',
                }}
              >
                <H4
                  sx={{
                    flex: 1,
                    color: theme.palette.common.black,
                  }}
                  fontWeight="regular"
                >
                  {data?.maturity}
                </H4>
                <ButtonData>{data?.tradeRateString}</ButtonData>
              </SideDrawerButton>
            ))}
          {!loaded && <ProgressIndicator type="notional" />}
          {loaded && rollMaturities.length === 0 && (
            <H4 fontWeight="regular">
              <FormattedMessage defaultMessage={'No data available'} />
            </H4>
          )}
        </>
      ) : (
        <RollMaturity setShowRollMaturity={setShowRollMaturity} />
      )}
    </Box>
  );
};

const ButtonData = styled(ButtonText)(
  ({ theme }) => `
    float: right;
    border: ${theme.shape.borderStandard};
    border-color: ${theme.palette.primary.light};
    background: ${theme.palette.background.paper};
    padding: ${theme.spacing(1, 2)};
    border-radius: ${theme.shape.borderRadius()};
    color: ${theme.palette.common.black};
    margin-bottom: 0px;
  `
);
