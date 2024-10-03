import { SvgIcon, SvgIconProps } from '@mui/material';

 
export interface CopyIconProps extends SvgIconProps {
  fill?: string;
}

export function CopyIcon(props: CopyIconProps) {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 15 16">
        <g clipPath="url(#clip0_11258_114286)">
          <path
            d="M12.6028 14.4606H4.58203V4.40926H12.6028V14.4606ZM12.6028 2.97336H4.58203C4.19526 2.97336 3.82432 3.12464 3.55083 3.39392C3.27735 3.6632 3.1237 4.02843 3.1237 4.40926V14.4606C3.1237 14.8414 3.27735 15.2065 3.55083 15.4758C3.82432 15.7451 4.19526 15.8964 4.58203 15.8964H12.6028C12.9896 15.8964 13.3606 15.7451 13.6341 15.4758C13.9076 15.2065 14.0612 14.8414 14.0612 14.4606V4.40926C14.0612 4.02843 13.9076 3.6632 13.6341 3.39392C13.3606 3.12464 12.9896 2.97336 12.6028 2.97336ZM10.4154 0.101562H1.66536C1.2786 0.101562 0.907658 0.252844 0.634168 0.522128C0.360676 0.79141 0.207031 1.15664 0.207031 1.53745V11.5887H1.66536V1.53745H10.4154V0.101562Z"
            fill={props.fill || '#13BBC2'}
          />
        </g>
        <defs>
          <clipPath id="clip0_11258_114286">
            <rect width="15" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  );
}

export default CopyIcon;
