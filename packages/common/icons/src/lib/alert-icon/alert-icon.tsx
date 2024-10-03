import { SvgIcon, SvgIconProps } from '@mui/material';

 
export interface AlertIconProps extends SvgIconProps {
  innerFill?: string;
}

export function AlertIcon(props: AlertIconProps) {
  const { innerFill = 'white' } = props;
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M12 0C9.62663 0 7.30655 0.703788 5.33316 2.02236C3.35977 3.34094 1.8217 5.21508 0.913451 7.4078C0.00519939 9.60051 -0.232441 12.0133 0.230582 14.3411C0.693605 16.6689 1.83649 18.807 3.51472 20.4853C5.19295 22.1635 7.33115 23.3064 9.65892 23.7694C11.9867 24.2324 14.3995 23.9948 16.5922 23.0865C18.7849 22.1783 20.6591 20.6402 21.9776 18.6668C23.2962 16.6934 24 14.3734 24 12C24 8.8174 22.7357 5.76515 20.4853 3.51472C18.2348 1.26428 15.1826 0 12 0Z" />
      <rect x="11" y="5" width="2" height="10" rx="1" fill={innerFill} />
      <rect x="11" y="16.5" width="2" height="2.5" rx="1" fill={innerFill} />
    </SvgIcon>
  );
}

export default AlertIcon;
