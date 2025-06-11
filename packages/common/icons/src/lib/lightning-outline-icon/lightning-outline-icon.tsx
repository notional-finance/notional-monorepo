import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface LightningOutlineIconProps extends SvgIconProps {
  fill?: string;
}

export function LightningOutlineIcon(props: LightningOutlineIconProps) {
  return (
    <SvgIcon viewBox="0 0 11 15" {...props}>
      <path
        d="M10.5 0.529297L10.4912 0.56543L6.74219 6.06348C6.61036 6.257 6.63085 6.51666 6.79102 6.6875L9.48926 9.56445C9.49127 9.56661 9.49444 9.57199 9.49707 9.58008L9.5 9.60742C9.49891 9.61724 9.4952 9.62481 9.49219 9.62988L9.4873 9.63574L0.506836 15.4893C0.504791 15.4842 0.500468 15.4787 0.5 15.4707L0.508789 15.4346L4.25781 9.93652C4.38964 9.743 4.36915 9.48334 4.20898 9.3125L1.51074 6.43555C1.50873 6.43339 1.50556 6.42801 1.50293 6.41992L1.5 6.39258C1.50109 6.38276 1.5048 6.37519 1.50781 6.37012L1.5127 6.36426L10.4922 0.509766C10.4945 0.515018 10.4995 0.520638 10.5 0.529297Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}
