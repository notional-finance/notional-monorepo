import {
  Switch,
  SwitchProps as MuiSwitchProps,
  FormGroup,
  FormControlLabel,
  styled,
} from '@mui/material';
import moon from './moon.svg';
import sun from './sun.svg';

/* eslint-disable-next-line */
export interface LightDarkSwitchProps extends MuiSwitchProps {
  themeVariant?: 'light' | 'dark';
  onToggle?: any;
}

export function LightDarkSwitch({
  checked = true,
  onToggle,
  themeVariant,
}: LightDarkSwitchProps) {
  const LightDarkConfig = styled(Switch)(({ theme }) => ({
    padding: 8,
    '& .MuiSwitch-track': {
      border: theme.shape.borderStandard,
      backgroundColor:
        themeVariant === 'light' ? '#FFFFFF !important' : '#1C4E5C !important',
      borderRadius: 22 / 2,
      '&:before, &:after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 16,
        height: 16,
      },
      '&:before': {
        backgroundImage: `url(${sun})`,
        left: 12,
      },
      '&:after': {
        backgroundImage: `url(${moon})`,
        right: 12,
      },
    },
    '.MuiSwitch-track': {
      opacity: 1,
    },
    '& .MuiSwitch-thumb': {
      backgroundColor: themeVariant === 'light' ? '#E7E8F2' : '#3B7A8B',
      boxShadow: 'none',
      width: 16,
      height: 16,
      margin: 2,
    },
  }));

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <LightDarkConfig
            defaultChecked
            checked={checked}
            onChange={onToggle}
          />
        }
        label=""
      />
    </FormGroup>
  );
}

export default LightDarkSwitch;
