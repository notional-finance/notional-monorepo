import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface EditIcon extends SvgIconProps {}

export function EditIcon(props: EditIcon) {
  return (
    <SvgIcon {...props} viewBox="0 0 18 18">
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.125 14.625H16.875V15.75H1.125V14.625ZM14.2875 5.0625C14.7375 4.6125 14.7375 3.9375 14.2875 3.4875L12.2625 1.4625C11.8125 1.0125 11.1375 1.0125 10.6875 1.4625L2.25 9.9V13.5H5.85L14.2875 5.0625ZM11.475 2.25L13.5 4.275L11.8125 5.9625L9.7875 3.9375L11.475 2.25ZM3.375 12.375V10.35L9 4.725L11.025 6.75L5.4 12.375H3.375Z"
          fill="#13BBC2"
        />
      </svg>
    </SvgIcon>
  );
}

export default EditIcon;
