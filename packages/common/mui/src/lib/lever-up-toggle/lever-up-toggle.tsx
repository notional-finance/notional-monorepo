import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ToggleSwitch } from '../toggle-switch/toggle-switch';
import { LightningIcon } from '@notional-finance/icons';
import { Box, styled, useTheme } from '@mui/material';
import { H4 } from '../typography/typography';

interface LeverUpToggleProps {
  leveredUp: boolean;
  handleLeverUpToggle: () => void;
}

export const LeverUpToggle = ({
  leveredUp,
  handleLeverUpToggle,
}: LeverUpToggleProps) => {
  const theme = useTheme();
  const [isChecked, setIsChecked] = useState(leveredUp);

  const handleToggle = () => {
    handleLeverUpToggle();
    setIsChecked(!isChecked);
  };

  return (
    <Container onClick={() => handleToggle()}>
      <LightningIcon viewBox="0 0 12 16" sx={{ height: theme.spacing(2) }} />
      <H4 sx={{ textWrap: 'nowrap' }}>
        <FormattedMessage defaultMessage={'Lever Up'} />
      </H4>
      <ToggleSwitch
        isChecked={isChecked}
        onToggle={() => handleToggle()}
        sx={{ marginRight: theme.spacing(-1) }}
      />
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    background: linear-gradient(180deg, rgba(43, 202, 208, .4) 0%, rgba(139, 193, 229, .4) 100%);
    padding: ${theme.spacing(1)};
    z-index: 1;
    border-radius: 19px;
    width: ${theme.spacing(21)};
    height: ${theme.spacing(5)};
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  `
);

export default LeverUpToggle;
