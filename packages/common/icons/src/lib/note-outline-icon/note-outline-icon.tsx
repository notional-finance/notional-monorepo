import { SvgIcon, SvgIconProps } from '@mui/material';

 
export interface NoteOutlineIconProps extends SvgIconProps {
  fill?: string;
}

export function NoteOutlineIcon(props: NoteOutlineIconProps) {
  const { fill } = props;
  return (
    <SvgIcon viewBox="0 0 16 16" {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
        <g clip-path="url(#clip0_7274_35209)">
          <circle
            cx="8"
            cy="8"
            r="7.5"
            stroke={fill || '#E7E8F2'}
            className="note-hover-color-stroke"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12.0006 4.0459H11.2734V11.2432L12.0006 11.969V4.0459Z"
            fill={fill || '#E7E8F2'}
            className="note-hover-color"
          />
          <path
            className="note-hover-color"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10.5436 4.0459H9.81641V9.79129L10.5436 10.5171V4.0459Z"
            fill={fill || '#E7E8F2'}
          />
          <path
            className="note-hover-color"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M9.09046 4.0459H8.36328V8.33971L9.09046 9.06554V4.0459Z"
            fill={fill || '#E7E8F2'}
          />
          <path
            className="note-hover-color"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M6.91016 6.9209V11.9698H7.63734V7.64673L6.91016 6.9209Z"
            fill={fill || '#E7E8F2'}
          />
          <path
            className="note-hover-color"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M5.45508 5.46875V11.9708H6.18226V6.19458L5.45508 5.46875Z"
            fill={fill || '#E7E8F2'}
          />
          <path
            className="note-hover-color"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.02995 4.0459H4V11.9695H4.72718V4.74183L4.02995 4.0459Z"
            fill={fill || '#E7E8F2'}
          />
        </g>
        <defs>
          <clipPath id="clip0_7274_35209">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  );
}

export default NoteOutlineIcon;
