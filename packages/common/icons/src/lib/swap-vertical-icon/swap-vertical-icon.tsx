import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface SwapVerticalIconProps extends SvgIconProps {}

export function SwapVerticalIcon(props: SwapVerticalIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 68 68">
      <circle cx="34" cy="34" r="34" fill="white" />
      <g filter="url(#filter0_d_11357_114099)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M34 57C46.7025 57 57 46.7026 57 34C57 21.2975 46.7026 11 34 11C21.2975 11 11 21.2974 11 34C11 46.7025 21.2974 57 34 57Z"
          fill="#13BBC2"
        />
      </g>
      <path
        d="M20.6304 30.2811L25.6207 25.3561V39.3274H27.9266V25.3561L32.9169 30.2811L34.5474 28.672L26.7737 21L19 28.672L20.6304 30.2811ZM35.0829 37.719L33.4525 39.3281L41.2262 47.0001L49 39.3281L47.3695 37.719L42.3791 42.644V28.6726H40.0733V42.644L35.0829 37.719Z"
        fill="white"
      />
      <path
        d="M34.0027 0C17.9805 0 4.54684 11.0825 0.949219 26H1.9788C5.55419 11.6398 18.5371 1 34.0027 1C49.4693 1 62.4507 11.6402 66.0264 26H67.0562C63.4586 11.0825 50.0249 0 34.0027 0Z"
        fill="#E7E8F2"
      />
      <path
        d="M0.949219 42C4.54684 56.9175 17.9805 68 34.0027 68C50.0249 68 63.4586 56.9175 67.0562 42H66.0264C62.4507 56.3598 49.4693 67 34.0027 67C18.5371 67 5.55419 56.3602 1.9788 42H0.949219Z"
        fill="#E7E8F2"
      />
      <defs>
        <filter
          id="filter0_d_11357_114099"
          x="9"
          y="10"
          width="52"
          height="52"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="1" dy="2" />
          <feGaussianBlur stdDeviation="1.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.08 0 0 0 0 0.16 0 0 0 0 0.4 0 0 0 0.2 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_11357_114099"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_11357_114099"
            result="shape"
          />
        </filter>
      </defs>
    </SvgIcon>
  );
}

export default SwapVerticalIcon;
