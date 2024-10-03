import { SvgIcon, SvgIconProps } from '@mui/material';

 
export interface WarningIcon extends SvgIconProps {
  fill?: string;
}

export function WarningIcon(props: WarningIcon) {
  const { fill } = props;
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="32" fill={fill || '#E6EAEB'} />
        <path
          d="M35.375 39.2269H28.625V12H35.375V39.2269ZM27.5 47.7423C27.5 46.5472 27.9313 45.5201 28.7938 44.6611C29.6938 43.8021 30.7625 43.3726 32 43.3726C33.2 43.3726 34.25 43.7834 35.15 44.605C36.05 45.4267 36.5 46.4351 36.5 47.6303C36.5 48.8254 36.05 49.8525 35.15 50.7115C34.2875 51.5705 33.2375 52 32 52C31.4 52 30.8188 51.888 30.2563 51.6639C29.7313 51.4398 29.2625 51.141 28.85 50.7675C28.4375 50.394 28.1 49.9458 27.8375 49.423C27.6125 48.9001 27.5 48.3399 27.5 47.7423Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  );
}

export default WarningIcon;
