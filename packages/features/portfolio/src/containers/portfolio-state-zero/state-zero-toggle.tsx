import { styled, Box, useTheme } from '@mui/material';
import { LightningIcon } from '@notional-finance/icons';
import {
  Button,
  LargeInputTextEmphasized,
  Toggle,
} from '@notional-finance/mui';
import { PORTFOLIO_STATE_ZERO_OPTIONS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';

interface StateZeroToggleProps {
  selectedTabIndex: number;
  handleToggle: (num: number) => void;
}

export const StateZeroToggle = ({
  selectedTabIndex,
  handleToggle,
}: StateZeroToggleProps) => {
  const theme = useTheme();
  const handleTabChange = (event, value) => {
    handleToggle(value);
  };

  const ToggleData = [
    <LargeInputTextEmphasized key={0}>
      <FormattedMessage defaultMessage={'Earn'} />
    </LargeInputTextEmphasized>,
    <LargeInputTextEmphasized
      key={1}
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <LightningIcon
        fill={
          selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE
            ? theme.palette.common.white
            : ''
        }
      />
      <span style={{ marginLeft: theme.spacing(0.5) }}>
        <FormattedMessage defaultMessage={'Leverage'} />
      </span>
    </LargeInputTextEmphasized>,
    <LargeInputTextEmphasized key={2}>
      <FormattedMessage defaultMessage={'Borrow'} />
    </LargeInputTextEmphasized>,
  ];

  return (
    <Box>
      <ToggleContainer>
        <Toggle
          tabLabels={ToggleData}
          onChange={handleTabChange}
          selectedTabIndex={selectedTabIndex}
          minHeight="56px"
          width="500px"
        />
      </ToggleContainer>
      <MobileToggleContainer>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => handleToggle(PORTFOLIO_STATE_ZERO_OPTIONS.EARN)}
          sx={{ marginTop: theme.spacing(3), width: '100%' }}
        >
          <FormattedMessage defaultMessage={'Earn'} />
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => handleToggle(PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE)}
          sx={{ marginTop: theme.spacing(3), width: '100%' }}
        >
          <FormattedMessage defaultMessage={'Leverage'} />
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => handleToggle(PORTFOLIO_STATE_ZERO_OPTIONS.BORROW)}
          sx={{ marginTop: theme.spacing(3), width: '100%' }}
        >
          <FormattedMessage defaultMessage={'Borrow'} />
        </Button>
      </MobileToggleContainer>
    </Box>
  );
};

const ToggleContainer = styled(Box)(
  ({ theme }) => `
      ${theme.breakpoints.down('sm')} {
        display: none;
      }
    `
);

const MobileToggleContainer = styled(Box)(
  ({ theme }) => `
      ${theme.breakpoints.up('sm')} {
        display: none;
      }
      ${theme.breakpoints.down('sm')} {
        display: flex;
        min-width: 90vw;
        flex-direction: column;
        align-items: center;
      }
    `
);

export default StateZeroToggle;
