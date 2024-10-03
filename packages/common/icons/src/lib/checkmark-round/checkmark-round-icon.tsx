import { SvgIcon, SvgIconProps } from '@mui/material';
import React from 'react';

 
export interface CheckmarkRoundIconProps extends SvgIconProps {
  foregroundColor: React.CSSProperties['color'];
  backgroundColor: React.CSSProperties['color'];
}

export const CheckmarkRoundIcon = ({
  foregroundColor,
  backgroundColor,
  ...rest
}: CheckmarkRoundIconProps) => {
  return (
    <SvgIcon {...rest}>
      <path
        fill={backgroundColor}
        d="M12,0C9.6,0,7.3,0.7,5.3,2c-2,1.3-3.5,3.2-4.4,5.4s-1.1,4.6-0.7,6.9c0.5,2.3,1.6,4.5,3.3,6.1c1.7,1.7,3.8,2.8,6.1,3.3
        c2.3,0.5,4.7,0.2,6.9-0.7c2.2-0.9,4.1-2.4,5.4-4.4c1.3-2,2-4.3,2-6.7c0-3.2-1.3-6.2-3.5-8.5C18.2,1.3,15.2,0,12,0z"
      />
      <path
        fill={foregroundColor}
        d="M10.3,16.6L6,12.4l1.2-1.2l3.1,3.1l6.5-6.5L18,8.9L10.3,16.6z"
      />
    </SvgIcon>
  );
};
