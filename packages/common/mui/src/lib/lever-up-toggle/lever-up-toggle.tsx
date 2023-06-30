import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ToggleSwitch } from '../toggle-switch/toggle-switch';
import { NotionalTheme, colors } from '@notional-finance/styles';
import { LightningIcon } from '@notional-finance/icons';
import { Box, styled, useTheme } from '@mui/material';
import { H4 } from '../typography/typography';

interface LeverUpToggleProps {
  leveredUp: boolean;
  handleLeverUpToggle: () => void;
  altBackground: boolean;
}

export interface ContainerProps {
  altBackground: boolean;
  isChecked: boolean;
  theme: NotionalTheme;
}

export const LeverUpToggle = ({
  leveredUp,
  handleLeverUpToggle,
  altBackground,
}: LeverUpToggleProps) => {
  const theme = useTheme();
  const [isChecked, setIsChecked] = useState(leveredUp);

  const handleToggle = () => {
    handleLeverUpToggle();
    setIsChecked(!isChecked);
  };

  return (
    <Container
      onClick={() => handleToggle()}
      theme={theme}
      altBackground={altBackground}
      isChecked={isChecked}
    >
      <LightningIcon viewBox="0 0 12 16" sx={{ height: theme.spacing(2) }} />
      <H4 sx={{ textWrap: 'nowrap', fontSize: '16px', fontWeight: 600 }}>
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

const Container = styled(Box, {
  shouldForwardProp: (prop: string) =>
    prop !== 'altBackground' && prop !== 'isChecked',
})(
  ({ altBackground, theme, isChecked }: ContainerProps) => `
    background: ${
      altBackground
        ? 'linear-gradient(180deg, rgba(43, 202, 208, 0.10) 0%, rgba(139, 193, 229, 0.10) 100%)'
        : 'linear-gradient(180deg, rgba(43, 202, 208, .4) 0%, rgba(139, 193, 229, .4) 100%)'
    };
    border: ${
      altBackground && isChecked ? `1px solid ${colors.neonTurquoise}` : 'none'
    };
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
