import { SvgIcon, SvgIconProps } from '@mui/material';

 
export interface LightningIconProps extends SvgIconProps {
  fill?: string;
}

export function LightningIcon(props: LightningIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 12 16">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.8554 0.171657C12.0318 0.35859 12.0487 0.641327 11.8957 0.84704L7.80618 6.34513L10.7493 9.22287C10.8675 9.33847 10.925 9.50068 10.9053 9.66301C10.8855 9.82533 10.7907 9.96984 10.6481 10.0551L0.829885 15.9217C0.607908 16.0544 0.321026 16.0153 0.144602 15.8283C-0.0318213 15.6414 -0.048681 15.3587 0.104329 15.153L4.19382 9.65487L1.25067 6.77713C1.13245 6.66153 1.07498 6.49932 1.09473 6.33699C1.11449 6.17466 1.20928 6.03016 1.35194 5.94492L11.1701 0.0782665C11.3921 -0.0543714 11.679 -0.015275 11.8554 0.171657Z"
        fill={props?.fill || 'url(#paint0_linear_10245_102998)'}
      />
      <defs>
        <linearGradient
          id="paint0_linear_10245_102998"
          x1="6"
          y1="0"
          x2="6"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2BCAD0" />
          <stop offset="1" stopColor="#8BA4E5" />
        </linearGradient>
      </defs>
    </SvgIcon>
  );
}

export default LightningIcon;
