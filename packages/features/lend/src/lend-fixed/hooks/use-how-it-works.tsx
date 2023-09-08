import { useThemeVariant } from '@notional-finance/notionable-hooks';
import { THEME_VARIANTS } from '@notional-finance/util';
import { SvgIcon, SvgIconProps } from '@mui/material';

export type ImageProps = SvgIconProps;
export const useHowItWorks = (tokenSymbol: string) => {
  const themeVariant = useThemeVariant();

  const lightModeImage = (props: ImageProps) => {
    return (
      <SvgIcon {...props} viewBox="0 0 522 102.28">
        <g clipPath="url(#clip0_11770_92557)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M335.177 37.3459C334.858 37.6404 334.361 37.621 334.067 37.3024C333.772 36.9839 333.792 36.4869 334.11 36.1924L341.333 29.5139L334.126 23.2006C333.799 22.9148 333.767 22.4185 334.052 22.0922C334.338 21.7658 334.835 21.733 335.161 22.0189L343.025 28.9072C343.193 29.0539 343.29 29.2649 343.293 29.4876C343.296 29.7102 343.204 29.9237 343.041 30.0749L335.177 37.3459ZM336.096 29.1532C336.53 29.1532 336.882 29.5049 336.882 29.9387C336.882 30.3725 336.53 30.7242 336.096 30.7242H334.2C333.766 30.7242 333.415 30.3726 333.415 29.9387C333.415 29.5049 333.766 29.1532 334.2 29.1532L336.096 29.1532ZM328.133 29.1532C328.567 29.1532 328.918 29.5049 328.918 29.9387C328.918 30.3726 328.567 30.7242 328.133 30.7242H324.341C323.907 30.7242 323.555 30.3726 323.555 29.9387C323.555 29.5049 323.907 29.1532 324.341 29.1532L328.133 29.1532ZM318.273 29.1532C318.707 29.1532 319.059 29.5049 319.059 29.9387C319.059 30.3726 318.707 30.7242 318.273 30.7242H314.481C314.048 30.7242 313.696 30.3726 313.696 29.9387C313.696 29.5049 314.048 29.1532 314.481 29.1532H318.273ZM308.414 29.1532C308.848 29.1532 309.2 29.5049 309.2 29.9387C309.2 30.3726 308.848 30.7242 308.414 30.7242H304.622C304.188 30.7242 303.837 30.3726 303.837 29.9387C303.837 29.5049 304.188 29.1532 304.622 29.1532L308.414 29.1532ZM298.555 29.1532C298.989 29.1532 299.34 29.5049 299.34 29.9387C299.34 30.3726 298.989 30.7242 298.555 30.7242H294.763C294.329 30.7242 293.977 30.3726 293.977 29.9387C293.977 29.5049 294.329 29.1532 294.763 29.1532L298.555 29.1532ZM288.695 29.1532C289.129 29.1532 289.481 29.5049 289.481 29.9387C289.481 30.3726 289.129 30.7242 288.695 30.7242L284.921 30.7242C284.487 30.7242 284.136 30.3726 284.136 29.9387C284.136 29.5049 284.487 29.1532 284.921 29.1532L288.695 29.1532ZM278.91 29.1532C279.344 29.1532 279.696 29.5049 279.696 29.9387C279.696 30.3726 279.344 30.7242 278.91 30.7242H275.154C274.72 30.7242 274.368 30.3726 274.368 29.9387C274.368 29.5049 274.72 29.1532 275.154 29.1532H278.91ZM269.143 29.1532C269.577 29.1532 269.928 29.5049 269.928 29.9387C269.928 30.3726 269.577 30.7242 269.143 30.7242H265.386C264.952 30.7242 264.601 30.3726 264.601 29.9387C264.601 29.5049 264.952 29.1532 265.386 29.1532L269.143 29.1532ZM259.376 29.1532C259.809 29.1532 260.161 29.5049 260.161 29.9387C260.161 30.3726 259.809 30.7242 259.376 30.7242H255.619C255.185 30.7242 254.833 30.3726 254.833 29.9387C254.833 29.5049 255.185 29.1532 255.619 29.1532H259.376ZM249.608 29.1532C250.042 29.1532 250.394 29.5049 250.394 29.9387C250.394 30.3726 250.042 30.7242 249.608 30.7242H245.851C245.418 30.7242 245.066 30.3726 245.066 29.9387C245.066 29.5049 245.418 29.1532 245.851 29.1532L249.608 29.1532ZM239.841 29.1532C240.275 29.1532 240.626 29.5049 240.626 29.9387C240.626 30.3726 240.275 30.7242 239.841 30.7242H236.084C235.65 30.7242 235.298 30.3726 235.298 29.9387C235.298 29.5049 235.65 29.1532 236.084 29.1532H239.841ZM230.073 29.1532C230.507 29.1532 230.859 29.5049 230.859 29.9387C230.859 30.3726 230.507 30.7242 230.073 30.7242H226.317C225.883 30.7242 225.531 30.3726 225.531 29.9387C225.531 29.5049 225.883 29.1532 226.317 29.1532L230.073 29.1532ZM220.306 29.1532C220.74 29.1532 221.091 29.5049 221.091 29.9387C221.091 30.3726 220.74 30.7242 220.306 30.7242H216.549C216.115 30.7242 215.764 30.3726 215.764 29.9387C215.764 29.5049 216.115 29.1532 216.549 29.1532L220.306 29.1532ZM210.538 29.1532C210.972 29.1532 211.324 29.5049 211.324 29.9387C211.324 30.3726 210.972 30.7242 210.538 30.7242H206.782C206.348 30.7242 205.996 30.3726 205.996 29.9387C205.996 29.5049 206.348 29.1532 206.782 29.1532H210.538ZM200.771 29.1532C201.205 29.1532 201.557 29.5049 201.557 29.9387C201.557 30.3726 201.205 30.7242 200.771 30.7242H197.014C196.58 30.7242 196.229 30.3726 196.229 29.9387C196.229 29.5049 196.58 29.1532 197.014 29.1532H200.771ZM191.004 29.1532C191.437 29.1532 191.789 29.5049 191.789 29.9387C191.789 30.3726 191.437 30.7242 191.004 30.7242H187.247C186.813 30.7242 186.461 30.3726 186.461 29.9387C186.461 29.5049 186.813 29.1532 187.247 29.1532H191.004ZM181.236 29.1532C181.67 29.1532 182.022 29.5049 182.022 29.9387C182.022 30.3726 181.67 30.7242 181.236 30.7242H179.358C178.924 30.7242 178.572 30.3726 178.572 29.9387C178.572 29.5049 178.924 29.1532 179.358 29.1532L181.236 29.1532Z"
            fill="url(#paint0_linear_11770_92557)"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M186.702 56.3237C187.035 56.6011 187.531 56.5556 187.808 56.2221C188.085 55.8885 188.04 55.3932 187.706 55.1158L180.597 49.2037L187.69 43.6155C188.031 43.347 188.089 42.8531 187.821 42.5123C187.552 42.1715 187.059 42.1129 186.718 42.3814L178.863 48.5702C178.676 48.7169 178.566 48.9398 178.563 49.1768C178.56 49.4138 178.664 49.6396 178.847 49.7912L186.702 56.3237ZM185.759 48.3816C185.326 48.3816 184.974 48.7332 184.974 49.1671C184.974 49.6009 185.326 49.9526 185.759 49.9526H187.655C188.089 49.9526 188.441 49.6009 188.441 49.1671C188.441 48.7332 188.089 48.3816 187.655 48.3816H185.759ZM193.723 48.3816C193.289 48.3816 192.937 48.7332 192.937 49.1671C192.937 49.6009 193.289 49.9526 193.723 49.9526H197.515C197.949 49.9526 198.3 49.6009 198.3 49.1671C198.3 48.7332 197.949 48.3816 197.515 48.3816H193.723ZM203.582 48.3816C203.148 48.3816 202.797 48.7332 202.797 49.1671C202.797 49.6009 203.148 49.9526 203.582 49.9526H207.374C207.808 49.9526 208.16 49.6009 208.16 49.1671C208.16 48.7332 207.808 48.3816 207.374 48.3816H203.582ZM213.441 48.3816C213.008 48.3816 212.656 48.7332 212.656 49.1671C212.656 49.6009 213.008 49.9526 213.441 49.9526H217.233C217.667 49.9526 218.019 49.6009 218.019 49.1671C218.019 48.7332 217.667 48.3816 217.233 48.3816H213.441ZM223.301 48.3816C222.867 48.3816 222.515 48.7332 222.515 49.1671C222.515 49.6009 222.867 49.9526 223.301 49.9526H227.093C227.527 49.9526 227.878 49.6009 227.878 49.1671C227.878 48.7332 227.527 48.3816 227.093 48.3816H223.301ZM233.16 48.3816C232.726 48.3816 232.375 48.7332 232.375 49.1671C232.375 49.6009 232.726 49.9526 233.16 49.9526H236.932C237.366 49.9526 237.718 49.6009 237.718 49.1671C237.718 48.7332 237.366 48.3816 236.932 48.3816H233.16ZM242.935 48.3816C242.501 48.3816 242.15 48.7332 242.15 49.1671C242.15 49.6009 242.501 49.9526 242.935 49.9526H246.687C247.121 49.9526 247.473 49.6009 247.473 49.1671C247.473 48.7332 247.121 48.3816 246.687 48.3816H242.935ZM252.69 48.3816C252.256 48.3816 251.905 48.7332 251.905 49.1671C251.905 49.6009 252.256 49.9526 252.69 49.9526H256.442C256.876 49.9526 257.228 49.6009 257.228 49.1671C257.228 48.7332 256.876 48.3816 256.442 48.3816H252.69ZM262.445 48.3816C262.011 48.3816 261.66 48.7332 261.66 49.1671C261.66 49.6009 262.011 49.9526 262.445 49.9526H266.197C266.631 49.9526 266.983 49.6009 266.983 49.1671C266.983 48.7332 266.631 48.3816 266.197 48.3816H262.445ZM272.2 48.3816C271.766 48.3816 271.415 48.7332 271.415 49.1671C271.415 49.6009 271.766 49.9526 272.2 49.9526H275.952C276.386 49.9526 276.738 49.6009 276.738 49.1671C276.738 48.7332 276.386 48.3816 275.952 48.3816H272.2ZM281.955 48.3816C281.521 48.3816 281.17 48.7332 281.17 49.1671C281.17 49.6009 281.521 49.9526 281.955 49.9526H285.707C286.141 49.9526 286.493 49.6009 286.493 49.1671C286.493 48.7332 286.141 48.3816 285.707 48.3816H281.955ZM291.71 48.3816C291.276 48.3816 290.925 48.7332 290.925 49.1671C290.925 49.6009 291.276 49.9526 291.71 49.9526H295.462C295.896 49.9526 296.248 49.6009 296.248 49.1671C296.248 48.7332 295.896 48.3816 295.462 48.3816H291.71ZM301.465 48.3816C301.031 48.3816 300.68 48.7332 300.68 49.1671C300.68 49.6009 301.031 49.9526 301.465 49.9526H305.217C305.651 49.9526 306.002 49.6009 306.002 49.1671C306.002 48.7332 305.651 48.3816 305.217 48.3816H301.465ZM311.22 48.3816C310.786 48.3816 310.435 48.7332 310.435 49.1671C310.435 49.6009 310.786 49.9526 311.22 49.9526H314.972C315.406 49.9526 315.757 49.6009 315.757 49.1671C315.757 48.7332 315.406 48.3816 314.972 48.3816H311.22ZM320.975 48.3816C320.541 48.3816 320.19 48.7332 320.19 49.1671C320.19 49.6009 320.541 49.9526 320.975 49.9526H324.727C325.161 49.9526 325.512 49.6009 325.512 49.1671C325.512 48.7332 325.161 48.3816 324.727 48.3816H320.975ZM330.73 48.3816C330.296 48.3816 329.944 48.7332 329.944 49.1671C329.944 49.6009 330.296 49.9526 330.73 49.9526H334.482C334.916 49.9526 335.267 49.6009 335.267 49.1671C335.267 48.7332 334.916 48.3816 334.482 48.3816H330.73ZM340.485 48.3816C340.051 48.3816 339.699 48.7332 339.699 49.1671C339.699 49.6009 340.051 49.9526 340.485 49.9526H342.361C342.795 49.9526 343.146 49.6009 343.146 49.1671C343.146 48.7332 342.795 48.3816 342.361 48.3816H340.485Z"
            fill="url(#paint1_linear_11770_92557)"
          />
          <text
            fill="#012E3A"
            fontFamily="Avenir Next"
            fontSize="10.9895"
            fontWeight="600"
            letterSpacing="0.05em"
          >
            <tspan x="245.076" y="18.9407">
              {tokenSymbol}
            </tspan>
          </text>
          <text
            fill="#012E3A"
            fontFamily="Avenir Next"
            fontSize="10.9895"
            fontWeight="600"
            letterSpacing="0.05em"
          >
            <tspan x="243.02" y="67.1497">
              f{tokenSymbol}
            </tspan>
          </text>
          <text
            fill="#012E3A"
            fontFamily="Avenir Next"
            fontSize="12.8211"
            fontWeight="600"
            letterSpacing="0.02em"
          >
            <tspan x="114.206" y="97.0643">
              Lender
            </tspan>
          </text>
          <text
            fill="#012E3A"
            fontFamily="Avenir Next"
            fontSize="12.8211"
            fontWeight="600"
            letterSpacing="0.02em"
          >
            <tspan x="338.286" y="97.2752">
              Fixed Rate Pool
            </tspan>
          </text>
          <path
            d="M370.757 15.2899L385.984 10.8187L401.212 15.2899L411.605 27.2839L413.863 42.9928L407.271 57.429L393.92 66.0092H378.049L364.698 57.429L358.105 42.9928L360.364 27.2839L370.757 15.2899Z"
            fill="url(#paint2_linear_11770_92557)"
            fillOpacity="0.5"
            stroke="url(#paint3_linear_11770_92557)"
            strokeWidth="1.57103"
          />
          <path
            d="M164.695 38.8474C164.695 54.7793 151.779 67.6947 135.847 67.6947C119.915 67.6947 107 54.7793 107 38.8474C107 22.9154 119.915 10 135.847 10C151.779 10 164.695 22.9154 164.695 38.8474Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M135.847 62.1961C148.743 62.1961 159.196 51.7425 159.196 38.8474C159.196 25.9522 148.743 15.4986 135.847 15.4986C122.952 15.4986 112.499 25.9522 112.499 38.8474C112.499 51.7425 122.952 62.1961 135.847 62.1961ZM135.847 67.6947C151.779 67.6947 164.695 54.7793 164.695 38.8474C164.695 22.9154 151.779 10 135.847 10C119.915 10 107 22.9154 107 38.8474C107 54.7793 119.915 67.6947 135.847 67.6947Z"
            fill="url(#paint4_linear_11770_92557)"
          />
          <mask id="path-10-inside-1_11770_92557" fill="white">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M156.789 58.6869C161.689 53.5165 164.695 46.5329 164.695 38.8474C164.695 22.9154 151.779 10 135.847 10C119.915 10 107 22.9154 107 38.8474C107 46.5576 110.025 53.5613 114.953 58.7366C115.678 50.4054 122.692 43.8446 131.21 43.8446H140.536C149.035 43.8446 156.04 50.3793 156.789 58.6869ZM135.873 39.1818C130.089 39.1818 125.382 34.4747 125.382 28.6905C125.382 22.9063 130.089 18.1992 135.873 18.1992C141.657 18.1992 146.364 22.9063 146.364 28.6905C146.364 34.4747 141.657 39.1818 135.873 39.1818Z"
            />
          </mask>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M156.789 58.6869C161.689 53.5165 164.695 46.5329 164.695 38.8474C164.695 22.9154 151.779 10 135.847 10C119.915 10 107 22.9154 107 38.8474C107 46.5576 110.025 53.5613 114.953 58.7366C115.678 50.4054 122.692 43.8446 131.21 43.8446H140.536C149.035 43.8446 156.04 50.3793 156.789 58.6869ZM135.873 39.1818C130.089 39.1818 125.382 34.4747 125.382 28.6905C125.382 22.9063 130.089 18.1992 135.873 18.1992C141.657 18.1992 146.364 22.9063 146.364 28.6905C146.364 34.4747 141.657 39.1818 135.873 39.1818Z"
            fill="url(#paint5_linear_11770_92557)"
          />
          <path
            d="M156.789 58.6869L151.313 59.1809L152.407 71.3053L160.781 62.4691L156.789 58.6869ZM114.953 58.7366L110.97 62.5282L119.373 71.3531L120.43 59.2137L114.953 58.7366ZM159.196 38.8474C159.196 45.0705 156.769 50.7148 152.798 54.9046L160.781 62.4691C166.61 56.3181 170.193 47.9954 170.193 38.8474H159.196ZM135.847 15.4986C148.743 15.4986 159.196 25.9522 159.196 38.8474H170.193C170.193 19.8786 154.816 4.50139 135.847 4.50139V15.4986ZM112.499 38.8474C112.499 25.9522 122.952 15.4986 135.847 15.4986V4.50139C116.879 4.50139 101.501 19.8786 101.501 38.8474H112.499ZM118.935 54.9449C114.941 50.751 112.499 45.0903 112.499 38.8474H101.501C101.501 48.0248 105.108 56.3715 110.97 62.5282L118.935 54.9449ZM131.21 38.346C119.813 38.346 110.445 47.1148 109.475 58.2594L120.43 59.2137C120.911 53.696 125.572 49.3432 131.21 49.3432V38.346ZM140.536 38.346H131.21V49.3432H140.536V38.346ZM162.266 58.1929C161.263 47.0797 151.909 38.346 140.536 38.346V49.3432C146.161 49.3432 150.817 53.6789 151.313 59.1809L162.266 58.1929ZM119.883 28.6905C119.883 37.5115 127.052 44.6804 135.873 44.6804V33.6832C133.126 33.6832 130.881 31.4379 130.881 28.6905H119.883ZM135.873 12.7006C127.052 12.7006 119.883 19.8695 119.883 28.6905H130.881C130.881 25.9431 133.126 23.6978 135.873 23.6978V12.7006ZM151.863 28.6905C151.863 19.8695 144.694 12.7006 135.873 12.7006V23.6978C138.621 23.6978 140.866 25.9431 140.866 28.6905H151.863ZM135.873 44.6804C144.694 44.6804 151.863 37.5115 151.863 28.6905H140.866C140.866 31.4379 138.621 33.6832 135.873 33.6832V44.6804Z"
            fill="url(#paint6_linear_11770_92557)"
            mask="url(#path-10-inside-1_11770_92557)"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_11770_92557"
            x1="178.867"
            y1="30"
            x2="342.867"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0980A0" />
            <stop offset="1" stopColor="#063642" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_11770_92557"
            x1="342.709"
            y1="49"
            x2="178.709"
            y2="49"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#62BBE0" />
            <stop offset="1" stopColor="#27C1C7" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_11770_92557"
            x1="452.598"
            y1="70.3048"
            x2="451.485"
            y2="10.4344"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#BFC9F5" stopOpacity="0.5" />
            <stop offset="0.0001" stopColor="#8EA1F5" stopOpacity="0.5" />
            <stop offset="1" stopColor="#26CBCF" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_11770_92557"
            x1="452.598"
            y1="70.3048"
            x2="451.485"
            y2="10.4344"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#BFC9F5" stopOpacity="0.5" />
            <stop offset="0.0001" stopColor="#8EA1F5" stopOpacity="0.5" />
            <stop offset="1" stopColor="#26CBCF" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_11770_92557"
            x1="190.956"
            y1="39.0982"
            x2="93.312"
            y2="39.0982"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#053542" />
            <stop offset="1" stopColor="#06657E" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_11770_92557"
            x1="190.956"
            y1="34.5802"
            x2="93.312"
            y2="34.5802"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#053542" />
            <stop offset="1" stopColor="#06657E" />
          </linearGradient>
          <linearGradient
            id="paint6_linear_11770_92557"
            x1="190.956"
            y1="34.5802"
            x2="93.312"
            y2="34.5802"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#053542" />
            <stop offset="1" stopColor="#06657E" />
          </linearGradient>
          <clipPath id="clip0_11770_92557">
            <rect width="522" height="102" fill="white" />
          </clipPath>
        </defs>
      </SvgIcon>
    );
  };
  const darkModeImage = (props: ImageProps) => {
    return (
      <SvgIcon {...props} viewBox="0 0 522 102.28">
        <g clipPath="url(#clip0_11770_92578)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M335.177 37.3459C334.858 37.6404 334.361 37.621 334.067 37.3024C333.772 36.9839 333.792 36.4869 334.11 36.1924L341.333 29.5139L334.126 23.2006C333.799 22.9148 333.767 22.4185 334.052 22.0922C334.338 21.7658 334.835 21.733 335.161 22.0189L343.025 28.9072C343.193 29.0539 343.29 29.2649 343.293 29.4876C343.296 29.7102 343.204 29.9237 343.041 30.0749L335.177 37.3459ZM336.096 29.1532C336.53 29.1532 336.882 29.5049 336.882 29.9387C336.882 30.3725 336.53 30.7242 336.096 30.7242H334.2C333.766 30.7242 333.415 30.3726 333.415 29.9387C333.415 29.5049 333.766 29.1532 334.2 29.1532L336.096 29.1532ZM328.133 29.1532C328.567 29.1532 328.918 29.5049 328.918 29.9387C328.918 30.3726 328.567 30.7242 328.133 30.7242H324.341C323.907 30.7242 323.555 30.3726 323.555 29.9387C323.555 29.5049 323.907 29.1532 324.341 29.1532L328.133 29.1532ZM318.273 29.1532C318.707 29.1532 319.059 29.5049 319.059 29.9387C319.059 30.3726 318.707 30.7242 318.273 30.7242H314.481C314.048 30.7242 313.696 30.3726 313.696 29.9387C313.696 29.5049 314.048 29.1532 314.481 29.1532H318.273ZM308.414 29.1532C308.848 29.1532 309.2 29.5049 309.2 29.9387C309.2 30.3726 308.848 30.7242 308.414 30.7242H304.622C304.188 30.7242 303.837 30.3726 303.837 29.9387C303.837 29.5049 304.188 29.1532 304.622 29.1532L308.414 29.1532ZM298.555 29.1532C298.989 29.1532 299.34 29.5049 299.34 29.9387C299.34 30.3726 298.989 30.7242 298.555 30.7242H294.763C294.329 30.7242 293.977 30.3726 293.977 29.9387C293.977 29.5049 294.329 29.1532 294.763 29.1532L298.555 29.1532ZM288.695 29.1532C289.129 29.1532 289.481 29.5049 289.481 29.9387C289.481 30.3726 289.129 30.7242 288.695 30.7242L284.921 30.7242C284.487 30.7242 284.136 30.3726 284.136 29.9387C284.136 29.5049 284.487 29.1532 284.921 29.1532L288.695 29.1532ZM278.91 29.1532C279.344 29.1532 279.696 29.5049 279.696 29.9387C279.696 30.3726 279.344 30.7242 278.91 30.7242H275.154C274.72 30.7242 274.368 30.3726 274.368 29.9387C274.368 29.5049 274.72 29.1532 275.154 29.1532H278.91ZM269.143 29.1532C269.577 29.1532 269.928 29.5049 269.928 29.9387C269.928 30.3726 269.577 30.7242 269.143 30.7242H265.386C264.952 30.7242 264.601 30.3726 264.601 29.9387C264.601 29.5049 264.952 29.1532 265.386 29.1532L269.143 29.1532ZM259.376 29.1532C259.809 29.1532 260.161 29.5049 260.161 29.9387C260.161 30.3726 259.809 30.7242 259.376 30.7242H255.619C255.185 30.7242 254.833 30.3726 254.833 29.9387C254.833 29.5049 255.185 29.1532 255.619 29.1532H259.376ZM249.608 29.1532C250.042 29.1532 250.394 29.5049 250.394 29.9387C250.394 30.3726 250.042 30.7242 249.608 30.7242H245.851C245.418 30.7242 245.066 30.3726 245.066 29.9387C245.066 29.5049 245.418 29.1532 245.851 29.1532L249.608 29.1532ZM239.841 29.1532C240.275 29.1532 240.626 29.5049 240.626 29.9387C240.626 30.3726 240.275 30.7242 239.841 30.7242H236.084C235.65 30.7242 235.298 30.3726 235.298 29.9387C235.298 29.5049 235.65 29.1532 236.084 29.1532H239.841ZM230.073 29.1532C230.507 29.1532 230.859 29.5049 230.859 29.9387C230.859 30.3726 230.507 30.7242 230.073 30.7242H226.317C225.883 30.7242 225.531 30.3726 225.531 29.9387C225.531 29.5049 225.883 29.1532 226.317 29.1532L230.073 29.1532ZM220.306 29.1532C220.74 29.1532 221.091 29.5049 221.091 29.9387C221.091 30.3726 220.74 30.7242 220.306 30.7242H216.549C216.115 30.7242 215.764 30.3726 215.764 29.9387C215.764 29.5049 216.115 29.1532 216.549 29.1532L220.306 29.1532ZM210.538 29.1532C210.972 29.1532 211.324 29.5049 211.324 29.9387C211.324 30.3726 210.972 30.7242 210.538 30.7242H206.782C206.348 30.7242 205.996 30.3726 205.996 29.9387C205.996 29.5049 206.348 29.1532 206.782 29.1532H210.538ZM200.771 29.1532C201.205 29.1532 201.557 29.5049 201.557 29.9387C201.557 30.3726 201.205 30.7242 200.771 30.7242H197.014C196.58 30.7242 196.229 30.3726 196.229 29.9387C196.229 29.5049 196.58 29.1532 197.014 29.1532H200.771ZM191.004 29.1532C191.437 29.1532 191.789 29.5049 191.789 29.9387C191.789 30.3726 191.437 30.7242 191.004 30.7242H187.247C186.813 30.7242 186.461 30.3726 186.461 29.9387C186.461 29.5049 186.813 29.1532 187.247 29.1532H191.004ZM181.236 29.1532C181.67 29.1532 182.022 29.5049 182.022 29.9387C182.022 30.3726 181.67 30.7242 181.236 30.7242H179.358C178.924 30.7242 178.572 30.3726 178.572 29.9387C178.572 29.5049 178.924 29.1532 179.358 29.1532L181.236 29.1532Z"
            fill="url(#paint0_linear_11770_92578)"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M186.702 56.3237C187.035 56.6011 187.531 56.5556 187.808 56.2221C188.085 55.8885 188.04 55.3932 187.706 55.1158L180.597 49.2037L187.69 43.6155C188.031 43.347 188.089 42.8531 187.821 42.5123C187.552 42.1715 187.059 42.1129 186.718 42.3814L178.863 48.5702C178.676 48.7169 178.566 48.9398 178.563 49.1768C178.56 49.4138 178.664 49.6396 178.847 49.7912L186.702 56.3237ZM185.759 48.3816C185.326 48.3816 184.974 48.7332 184.974 49.1671C184.974 49.6009 185.326 49.9526 185.759 49.9526H187.655C188.089 49.9526 188.441 49.6009 188.441 49.1671C188.441 48.7332 188.089 48.3816 187.655 48.3816H185.759ZM193.723 48.3816C193.289 48.3816 192.937 48.7332 192.937 49.1671C192.937 49.6009 193.289 49.9526 193.723 49.9526H197.515C197.949 49.9526 198.3 49.6009 198.3 49.1671C198.3 48.7332 197.949 48.3816 197.515 48.3816H193.723ZM203.582 48.3816C203.148 48.3816 202.797 48.7332 202.797 49.1671C202.797 49.6009 203.148 49.9526 203.582 49.9526H207.374C207.808 49.9526 208.16 49.6009 208.16 49.1671C208.16 48.7332 207.808 48.3816 207.374 48.3816H203.582ZM213.441 48.3816C213.008 48.3816 212.656 48.7332 212.656 49.1671C212.656 49.6009 213.008 49.9526 213.441 49.9526H217.233C217.667 49.9526 218.019 49.6009 218.019 49.1671C218.019 48.7332 217.667 48.3816 217.233 48.3816H213.441ZM223.301 48.3816C222.867 48.3816 222.515 48.7332 222.515 49.1671C222.515 49.6009 222.867 49.9526 223.301 49.9526H227.093C227.527 49.9526 227.878 49.6009 227.878 49.1671C227.878 48.7332 227.527 48.3816 227.093 48.3816H223.301ZM233.16 48.3816C232.726 48.3816 232.375 48.7332 232.375 49.1671C232.375 49.6009 232.726 49.9526 233.16 49.9526H236.932C237.366 49.9526 237.718 49.6009 237.718 49.1671C237.718 48.7332 237.366 48.3816 236.932 48.3816H233.16ZM242.935 48.3816C242.501 48.3816 242.15 48.7332 242.15 49.1671C242.15 49.6009 242.501 49.9526 242.935 49.9526H246.687C247.121 49.9526 247.473 49.6009 247.473 49.1671C247.473 48.7332 247.121 48.3816 246.687 48.3816H242.935ZM252.69 48.3816C252.256 48.3816 251.905 48.7332 251.905 49.1671C251.905 49.6009 252.256 49.9526 252.69 49.9526H256.442C256.876 49.9526 257.228 49.6009 257.228 49.1671C257.228 48.7332 256.876 48.3816 256.442 48.3816H252.69ZM262.445 48.3816C262.011 48.3816 261.66 48.7332 261.66 49.1671C261.66 49.6009 262.011 49.9526 262.445 49.9526H266.197C266.631 49.9526 266.983 49.6009 266.983 49.1671C266.983 48.7332 266.631 48.3816 266.197 48.3816H262.445ZM272.2 48.3816C271.766 48.3816 271.415 48.7332 271.415 49.1671C271.415 49.6009 271.766 49.9526 272.2 49.9526H275.952C276.386 49.9526 276.738 49.6009 276.738 49.1671C276.738 48.7332 276.386 48.3816 275.952 48.3816H272.2ZM281.955 48.3816C281.521 48.3816 281.17 48.7332 281.17 49.1671C281.17 49.6009 281.521 49.9526 281.955 49.9526H285.707C286.141 49.9526 286.493 49.6009 286.493 49.1671C286.493 48.7332 286.141 48.3816 285.707 48.3816H281.955ZM291.71 48.3816C291.276 48.3816 290.925 48.7332 290.925 49.1671C290.925 49.6009 291.276 49.9526 291.71 49.9526H295.462C295.896 49.9526 296.248 49.6009 296.248 49.1671C296.248 48.7332 295.896 48.3816 295.462 48.3816H291.71ZM301.465 48.3816C301.031 48.3816 300.68 48.7332 300.68 49.1671C300.68 49.6009 301.031 49.9526 301.465 49.9526H305.217C305.651 49.9526 306.002 49.6009 306.002 49.1671C306.002 48.7332 305.651 48.3816 305.217 48.3816H301.465ZM311.22 48.3816C310.786 48.3816 310.435 48.7332 310.435 49.1671C310.435 49.6009 310.786 49.9526 311.22 49.9526H314.972C315.406 49.9526 315.757 49.6009 315.757 49.1671C315.757 48.7332 315.406 48.3816 314.972 48.3816H311.22ZM320.975 48.3816C320.541 48.3816 320.19 48.7332 320.19 49.1671C320.19 49.6009 320.541 49.9526 320.975 49.9526H324.727C325.161 49.9526 325.512 49.6009 325.512 49.1671C325.512 48.7332 325.161 48.3816 324.727 48.3816H320.975ZM330.73 48.3816C330.296 48.3816 329.944 48.7332 329.944 49.1671C329.944 49.6009 330.296 49.9526 330.73 49.9526H334.482C334.916 49.9526 335.267 49.6009 335.267 49.1671C335.267 48.7332 334.916 48.3816 334.482 48.3816H330.73ZM340.485 48.3816C340.051 48.3816 339.699 48.7332 339.699 49.1671C339.699 49.6009 340.051 49.9526 340.485 49.9526H342.361C342.795 49.9526 343.146 49.6009 343.146 49.1671C343.146 48.7332 342.795 48.3816 342.361 48.3816H340.485Z"
            fill="url(#paint1_linear_11770_92578)"
          />
          <text
            fill="white"
            fontFamily="Avenir Next"
            fontSize="10.9895"
            fontWeight="600"
            letterSpacing="0.05em"
          >
            <tspan x="245.076" y="18.9407">
              {tokenSymbol}
            </tspan>
          </text>
          <text
            fill="white"
            fontFamily="Avenir Next"
            fontSize="10.9895"
            fontWeight="600"
            letterSpacing="0.05em"
          >
            <tspan x="243.02" y="67.1497">
              f{tokenSymbol}
            </tspan>
          </text>
          <text
            fill="white"
            fontFamily="Avenir Next"
            fontSize="12.8211"
            fontWeight="600"
            letterSpacing="0.02em"
          >
            <tspan x="114.206" y="97.0643">
              Lender
            </tspan>
          </text>
          <text
            fill="white"
            fontFamily="Avenir Next"
            fontSize="12.8211"
            fontWeight="600"
            letterSpacing="0.02em"
          >
            <tspan x="338.286" y="97.2752">
              Fixed Rate Pool
            </tspan>
          </text>
          <path
            d="M370.757 15.2899L385.984 10.8187L401.212 15.2899L411.605 27.2839L413.863 42.9928L407.271 57.429L393.92 66.0092H378.049L364.698 57.429L358.105 42.9928L360.364 27.2839L370.757 15.2899Z"
            fill="url(#paint2_linear_11770_92578)"
            fillOpacity="0.5"
            stroke="url(#paint3_linear_11770_92578)"
            strokeWidth="1.57103"
          />
          <path
            d="M164.695 38.6364C164.695 54.5684 151.779 67.4838 135.847 67.4838C119.915 67.4838 107 54.5684 107 38.6364C107 22.7045 119.915 9.78906 135.847 9.78906C151.779 9.78906 164.695 22.7045 164.695 38.6364Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M135.847 61.9852C148.743 61.9852 159.196 51.5316 159.196 38.6364C159.196 25.7413 148.743 15.2877 135.847 15.2877C122.952 15.2877 112.499 25.7413 112.499 38.6364C112.499 51.5316 122.952 61.9852 135.847 61.9852ZM135.847 67.4838C151.779 67.4838 164.695 54.5684 164.695 38.6364C164.695 22.7045 151.779 9.78906 135.847 9.78906C119.915 9.78906 107 22.7045 107 38.6364C107 54.5684 119.915 67.4838 135.847 67.4838Z"
            fill="url(#paint4_linear_11770_92578)"
          />
          <mask id="path-10-inside-1_11770_92578" fill="white">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M156.789 58.4759C161.689 53.3055 164.695 46.322 164.695 38.6364C164.695 22.7045 151.779 9.78906 135.847 9.78906C119.915 9.78906 107 22.7045 107 38.6364C107 46.3466 110.025 53.3503 114.953 58.5256C115.678 50.1945 122.692 43.6336 131.21 43.6336H140.536C149.035 43.6336 156.04 50.1684 156.789 58.4759ZM135.873 38.9708C130.089 38.9708 125.382 34.2638 125.382 28.4796C125.382 22.6954 130.089 17.9883 135.873 17.9883C141.657 17.9883 146.364 22.6954 146.364 28.4796C146.364 34.2638 141.657 38.9708 135.873 38.9708Z"
            />
          </mask>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M156.789 58.4759C161.689 53.3055 164.695 46.322 164.695 38.6364C164.695 22.7045 151.779 9.78906 135.847 9.78906C119.915 9.78906 107 22.7045 107 38.6364C107 46.3466 110.025 53.3503 114.953 58.5256C115.678 50.1945 122.692 43.6336 131.21 43.6336H140.536C149.035 43.6336 156.04 50.1684 156.789 58.4759ZM135.873 38.9708C130.089 38.9708 125.382 34.2638 125.382 28.4796C125.382 22.6954 130.089 17.9883 135.873 17.9883C141.657 17.9883 146.364 22.6954 146.364 28.4796C146.364 34.2638 141.657 38.9708 135.873 38.9708Z"
            fill="url(#paint5_linear_11770_92578)"
          />
          <path
            d="M156.789 58.4759L151.313 58.9699L152.407 71.0944L160.781 62.2582L156.789 58.4759ZM114.953 58.5256L110.97 62.3173L119.373 71.1422L120.43 59.0028L114.953 58.5256ZM159.196 38.6364C159.196 44.8595 156.769 50.5039 152.798 54.6936L160.781 62.2582C166.61 56.1072 170.193 47.7844 170.193 38.6364H159.196ZM135.847 15.2877C148.743 15.2877 159.196 25.7413 159.196 38.6364H170.193C170.193 19.6677 154.816 4.29046 135.847 4.29046V15.2877ZM112.499 38.6364C112.499 25.7413 122.952 15.2877 135.847 15.2877V4.29046C116.879 4.29046 101.501 19.6677 101.501 38.6364H112.499ZM118.935 54.7339C114.941 50.5401 112.499 44.8794 112.499 38.6364H101.501C101.501 47.8139 105.108 56.1606 110.97 62.3173L118.935 54.7339ZM131.21 38.135C119.813 38.135 110.445 46.9039 109.475 58.0485L120.43 59.0028C120.911 53.485 125.572 49.1322 131.21 49.1322V38.135ZM140.536 38.135H131.21V49.1322H140.536V38.135ZM162.266 57.9819C161.263 46.8688 151.909 38.135 140.536 38.135V49.1322C146.161 49.1322 150.817 53.468 151.313 58.9699L162.266 57.9819ZM119.883 28.4796C119.883 37.3006 127.052 44.4695 135.873 44.4695V33.4722C133.126 33.4722 130.881 31.227 130.881 28.4796H119.883ZM135.873 12.4897C127.052 12.4897 119.883 19.6586 119.883 28.4796H130.881C130.881 25.7322 133.126 23.4869 135.873 23.4869V12.4897ZM151.863 28.4796C151.863 19.6586 144.694 12.4897 135.873 12.4897V23.4869C138.621 23.4869 140.866 25.7322 140.866 28.4796H151.863ZM135.873 44.4695C144.694 44.4695 151.863 37.3006 151.863 28.4796H140.866C140.866 31.227 138.621 33.4722 135.873 33.4722V44.4695Z"
            fill="url(#paint6_linear_11770_92578)"
            mask="url(#path-10-inside-1_11770_92578)"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_11770_92578"
            x1="178.867"
            y1="30"
            x2="342.867"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#919DB5" />
            <stop offset="1" stopColor="#34F9FF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_11770_92578"
            x1="342.709"
            y1="49"
            x2="178.709"
            y2="49"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8BA4E5" />
            <stop offset="1" stopColor="#4E9FFF" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_11770_92578"
            x1="452.598"
            y1="70.3048"
            x2="451.485"
            y2="10.4344"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#BFC9F5" stopOpacity="0.5" />
            <stop offset="0.0001" stopColor="#8EA1F5" stopOpacity="0.5" />
            <stop offset="1" stopColor="#26CBCF" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_11770_92578"
            x1="452.598"
            y1="70.3048"
            x2="451.485"
            y2="10.4344"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#BFC9F5" stopOpacity="0.5" />
            <stop offset="0.0001" stopColor="#8EA1F5" stopOpacity="0.5" />
            <stop offset="1" stopColor="#26CBCF" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_11770_92578"
            x1="135.847"
            y1="9.78906"
            x2="135.847"
            y2="67.4838"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2BCAD0" />
            <stop offset="1" stopColor="#8BA4E5" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_11770_92578"
            x1="135.847"
            y1="9.78906"
            x2="135.847"
            y2="58.5256"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2BCAD0" />
            <stop offset="1" stopColor="#8BA4E5" />
          </linearGradient>
          <linearGradient
            id="paint6_linear_11770_92578"
            x1="135.847"
            y1="9.78906"
            x2="135.847"
            y2="58.5256"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2BCAD0" />
            <stop offset="1" stopColor="#8BA4E5" />
          </linearGradient>
          <clipPath id="clip0_11770_92578">
            <rect width="522" height="102" fill="white" />
          </clipPath>
        </defs>
      </SvgIcon>
    );
  };
  return themeVariant === THEME_VARIANTS.DARK ? darkModeImage : lightModeImage;
};
