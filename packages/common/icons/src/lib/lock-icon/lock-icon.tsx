import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface LockIconProps extends SvgIconProps {}

export const LockIcon = (props: LockIconProps) => {
  return (
    <SvgIcon {...props} viewBox="0 0 12 16" fill="none">
      <path
        d="M6.5 1.6C7.839 1.6 8.9375 2.6816 8.9375 4V6.4H4.0625V4C4.0625 2.6816 5.161 1.6 6.5 1.6ZM10.5625 6.4V4C10.5625 1.7984 8.736 0 6.5 0C4.264 0 2.4375 1.7984 2.4375 4V6.4H1.625C1.19402 6.4 0.780698 6.56857 0.475951 6.86863C0.171205 7.16869 0 7.57565 0 8V14.4C0 14.8243 0.171205 15.2313 0.475951 15.5314C0.780698 15.8314 1.19402 16 1.625 16H11.375C11.806 16 12.2193 15.8314 12.524 15.5314C12.8288 15.2313 13 14.8243 13 14.4V8C13 7.57565 12.8288 7.16869 12.524 6.86863C12.2193 6.56857 11.806 6.4 11.375 6.4H10.5625ZM1.625 8H11.375V14.4H1.625V8Z"
        fill={props.fill}
      />
    </SvgIcon>
  );
};
