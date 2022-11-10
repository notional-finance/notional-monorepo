import React, { ChangeEvent } from 'react';
import Switch from '@mui/material/Switch';
import { Box, styled, SxProps } from '@mui/material';
import { Label } from '../typography/typography';

export interface ToggleSwitchProps {
  isChecked: boolean;
  onToggle: (isChecked: boolean) => void;
  label?: React.ReactNode;
  sx?: SxProps;
}

export const ToggleSwitch = ({ isChecked, onToggle, label, sx }: ToggleSwitchProps) => {
  const handleToggle = ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => {
    onToggle(checked);
  };

  return (
    <StyledSwitch sx={sx}>
      {label && <Label>{label}</Label>}
      <Switch
        classes={{
          root: 'toggle-switch-root',
          thumb: 'toggle-switch-thumb',
          track: 'toggle-switch-track',
          checked: 'toggle-switch-checked',
          colorSecondary: 'toggle-switch-color-secondary',
        }}
        checked={isChecked}
        onChange={handleToggle}
        inputProps={{ 'aria-label': `${label}` }}
      />
    </StyledSwitch>
  );
};

const StyledSwitch = styled(Box)(
  ({ theme }) => `
  display: flex;
  align-items: center;

  .toggle-switch-root {
    top: 2px;
  }

  .toggle-switch-thumb {
    background-color: ${theme.palette.borders.accentDefault};
    height: 15px;
    width: 15px;
  }

  .toggle-switch-track {
    border: 1px solid ${theme.palette.borders.default};
    background: ${theme.palette.common.white};
    opacity: 1;
    margin-top: -4.5px;
    margin-left: -5px;
    border-radius: 20px;
    height: 18px;
    width: 70px;
  }

  .toggle-switch-checked  .toggle-switch-thumb {
    background-color: ${theme.palette.common.white};
  }

  .toggle-switch-checked + .toggle-switch-track {
    background-color: ${theme.palette.primary.light ?? theme.palette.error.main} !important;
    opacity: 1 !important;
  }
`
);

export default ToggleSwitch;
