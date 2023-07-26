import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface FilterIconProps extends SvgIconProps {}

export function FilterIcon(props: FilterIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 16 16">
      <rect x="1.33203" width="1.33333" height="16" rx="0.666664" />
      <rect y="10.667" width="3.99999" height="1.33333" rx="0.666667" />
      <rect x="6" y="4" width="3.99999" height="1.33333" rx="0.666667" />
      <rect x="12" y="10.667" width="3.99999" height="1.33333" rx="0.666667" />
      <rect x="7.33594" width="1.33333" height="16" rx="0.666664" />
      <rect x="13.332" width="1.33333" height="16" rx="0.666664" />
    </SvgIcon>
  );
}

export default FilterIcon;
