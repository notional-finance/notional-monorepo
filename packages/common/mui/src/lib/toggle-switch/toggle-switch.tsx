import React, { ChangeEvent } from 'react';
import { Switch } from '@mui/material';
import { Box, styled, SxProps } from '@mui/material';
import { Label } from '../typography/typography';

export interface ToggleSwitchProps {
  isChecked: boolean;
  onToggle: (isChecked: boolean) => void;
  label?: React.ReactNode;
  sx?: SxProps;
}

export const ToggleSwitch = ({
  isChecked,
  onToggle,
  label,
  sx,
}: ToggleSwitchProps) => {
  const handleToggle = ({
    target: { checked },
  }: ChangeEvent<HTMLInputElement>) => {
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
    background-color: ${theme.palette.borders.accentPaper};
    height: 17px;
    width: 17px;
  }

  .toggle-switch-track {
    border: 1px solid ${theme.palette.borders.accentPaper};
    background: ${theme.palette.common.white};
    opacity: 1;
    margin-top: -4.5px;
    margin-left: -4.5px;
    margin-right: -4px;
    border-radius: 20px;
    height: 20px;
    width: 40px;
  }

  .toggle-switch-checked  .toggle-switch-thumb {
    background-color: ${theme.palette.typography.accent};
  }

  .toggle-switch-checked + .toggle-switch-track {
    background-color: ${theme.palette.background.paper} !important;
    border: 1px solid ${theme.palette.typography.accent};
    opacity: 1 !important;
  }
`
);

export default ToggleSwitch;
