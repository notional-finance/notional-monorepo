import { styled, Box, useTheme } from '@mui/material';
import { LightningIcon } from '@notional-finance/icons';
import {
  Button,
  LargeInputTextEmphasized,
  Toggle,
} from '@notional-finance/mui';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';

interface StateZeroToggleProps {
  selectedTabIndex: number;
  setSelectedTabIndex: Dispatch<SetStateAction<number>>;
}

export const StateZeroToggle = ({
  selectedTabIndex,
  setSelectedTabIndex,
}: StateZeroToggleProps) => {
  const theme = useTheme();
  const handleTabChange = (event, value) => {
    setSelectedTabIndex(value);
  };

  const ToggleData = [
    <LargeInputTextEmphasized>
      <FormattedMessage defaultMessage={'Earn'} />
    </LargeInputTextEmphasized>,
    <LargeInputTextEmphasized
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <LightningIcon
        fill={selectedTabIndex === 1 ? theme.palette.common.white : ''}
      />
      <span style={{ marginLeft: theme.spacing(0.5) }}>
        <FormattedMessage defaultMessage={'Leverage'} />
      </span>
    </LargeInputTextEmphasized>,
    <LargeInputTextEmphasized>
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
          onClick={() => setSelectedTabIndex(0)}
          sx={{ marginTop: theme.spacing(3), width: '100%' }}
        >
          <FormattedMessage defaultMessage={'Earn'} />
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => setSelectedTabIndex(1)}
          sx={{ marginTop: theme.spacing(3), width: '100%' }}
        >
          <FormattedMessage defaultMessage={'Leverage'} />
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => setSelectedTabIndex(2)}
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
