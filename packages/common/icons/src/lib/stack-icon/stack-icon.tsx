import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface StackIconProps extends SvgIconProps {}

export function StackIcon(props: StackIconProps) {
  return (
    <SvgIcon viewBox="0 0.5 18 18" {...props}>
      <g clipPath="url(#clip0_9867_94520)">
        <path d="M0.710938 11.138L8.99844 15.8022L16.4377 11.6397V13.2972L8.99844 17.4965L1.13544 13.0265L0.711687 13.2575V13.835L8.99844 18.5L17.2859 13.8365V10.5988L16.8997 10.367L8.99844 14.8385L1.59819 10.5988V8.94125L8.99844 13.1038L17.2859 8.44025V5.24L16.8997 5.009L8.99844 9.4805L1.98369 5.51075L8.99844 1.541L14.8184 4.817L15.3194 4.50875V4.08425L8.99844 0.5L0.710938 5.2025V5.7425L8.99844 10.4052L16.4377 6.24275V7.93775L8.99844 12.14L1.13544 7.67L0.711687 7.901L0.710938 11.138Z" />
      </g>
      <defs>
        <clipPath id="clip0_9867_94520">
          <rect
            width="18"
            height="18"
            fill="white"
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </SvgIcon>
  );
}

export default StackIcon;
