import { SvgIcon, SvgIconProps } from '@mui/material';

 
export interface LeafIconProps extends SvgIconProps {
  fill?: string;
}

export function LeafIcon(props: LeafIconProps) {
  const { fill } = props;
  return (
    <SvgIcon {...props}>
      <svg fill="none" viewBox="0 0 16 16">
        <path
          d="M15.8616 0L14.8451 0.322418C13.1028 0.898373 11.2424 1.07512 9.41482 0.838287C7.49446 0.554729 5.52887 0.806704 3.75585 1.56373C2.81592 1.94454 1.99102 2.543 1.35627 3.30463C0.721518 4.06626 0.29707 4.96686 0.121568 5.92443C-0.0569539 6.8453 -0.0386922 7.79095 0.175264 8.70496C0.38922 9.61896 0.794486 10.4826 1.36688 11.2443C1.31605 11.4136 1.26522 11.5829 1.22287 11.7521C0.878787 13.1442 0.708182 14.57 0.714575 16H2.40888C2.48851 14.8295 2.65554 13.6658 2.9087 12.5179C4.08406 13.1218 5.40216 13.4298 6.73782 13.4126C7.98354 13.4118 9.21644 13.1733 10.3636 12.7113C16.8105 10.0917 15.9633 1.37834 15.9633 1.01562L15.8616 0ZM9.70286 11.2282C7.49179 12.1229 4.84868 11.9698 3.36616 10.8655C3.61672 10.0683 3.96056 9.30047 4.39121 8.57632C4.72601 8.05514 5.12097 7.5712 5.56875 7.1335C6.0263 6.69113 6.54163 6.30646 7.1021 5.98892C8.26022 5.33002 9.54461 4.89709 10.8804 4.71537V3.90932C9.34348 3.8587 7.81599 4.15711 6.42438 4.77985C5.00152 5.44044 3.79484 6.45759 2.93411 7.72191C2.61488 8.2048 2.3318 8.70848 2.08696 9.22922C1.69432 8.27353 1.58303 7.23406 1.76504 6.22267C1.8843 5.51459 2.19107 4.84705 2.65646 4.28297C3.12184 3.7189 3.73051 3.27685 4.4251 2.99849C5.43797 2.54804 6.54318 2.3168 7.66122 2.32141C8.18645 2.32141 8.70322 2.36977 9.24539 2.41008C10.9434 2.61852 12.6673 2.52284 14.3283 2.12796C14.269 4.35264 13.8454 9.55164 9.70286 11.2282Z"
          fill={fill || '#012E3A'}
        />
      </svg>
    </SvgIcon>
  );
}
