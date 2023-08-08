import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface NoteIconProps extends SvgIconProps {}

export function NoteIcon(props: NoteIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 14 14">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 46.83 46.83"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M46.8315 23.4158C46.8315 36.3479 36.3479 46.8315 23.4158 46.8315C10.4836 46.8315 0 36.3479 0 23.4158C0 10.4836 10.4836 0 23.4158 0C36.3479 0 46.8315 10.4836 46.8315 23.4158ZM34.7756 12.0167H32.7063V32.5003L34.7756 34.5658V12.0167ZM28.5693 12.0166H30.6387V30.4344L28.5693 28.3689V12.0166ZM26.501 12.0167H24.4317V24.239L26.501 26.3045V12.0167ZM20.2912 34.5645V20.1924L22.3605 22.2579V34.5645H20.2912ZM16.1543 16.0615V34.5657H18.2236V18.127L16.1543 16.0615ZM12.0166 12.0167H12.1028L14.0859 13.9961V34.5649H12.0166V12.0167Z"
        />
      </svg>
    </SvgIcon>
  );
}

export default NoteIcon;
