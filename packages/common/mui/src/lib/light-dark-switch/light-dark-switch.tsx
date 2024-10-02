import {
  Switch,
  SwitchProps as MuiSwitchProps,
  FormGroup,
  FormControlLabel,
  styled,
  useTheme,
} from '@mui/material';
import { NotionalTheme, colors } from '@notional-finance/styles';
import moon from './moon.svg';
import sun from './sun.svg';

 
export interface LightDarkSwitchProps extends MuiSwitchProps {
  themeVariant: 'light' | 'dark';
  onToggle?: any;
}

export interface LightDarkConfigProps extends LightDarkSwitchProps {
  theme: NotionalTheme;
}

const LightDarkConfig = styled(Switch, {
  shouldForwardProp: (prop: string) => prop !== 'themeVariant',
})(({ themeVariant, theme }: LightDarkConfigProps) => ({
  padding: 8,
  '& .MuiSwitch-track': {
    border: theme.shape.borderStandard,
    backgroundColor:
      themeVariant === 'light'
        ? `${colors.white} !important`
        : `${colors.matteGreen} !important`,
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
    backgroundColor:
      themeVariant === 'light' ? `${colors.purpleGrey}` : `${colors.blueGreen}`,
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
  },
}));

export function LightDarkSwitch({
  checked = true,
  onToggle,
  themeVariant,
}: LightDarkSwitchProps) {
  const theme = useTheme();
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <LightDarkConfig
            theme={theme}
            themeVariant={themeVariant}
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
