const notionalSassVariables = {
  /******* Theme *******/
  primary: '#1F9B99',
  secondary: '#FF3D71',
  error: '#b00020',
  warning: '#FFAA00',
  theme1: '#F6F8F8',
  margin: '20px',
  radius: '5px',
  radiusLarge: '10px',
  standardShadow: '0px 4px 10px rgba(20, 42, 74, 0.07)',
  landingPageShadow: '0px 4px 10px 0px #142A4A12',

  /******* Colors *******/
  primaryFontColor: '#012E3A',
  cardBackground: '#FFFFFF',
  liteGrey: ' #E6EAEB',
  greyPurple: '#E7E8F2',
  standardBorderColor: '#E7E8F2',
  primaryGreen: '#1F9B99',
  darkGreenBlack: '#012E3A',
  darkGreen: '#013D4A',
  secondaryGrey: '#8F9BB3',
  lightGrey: '#F8FAFA',
  greyGreen: '#95B2BA',
  brightTurquoise: '#2DE1E8',
  feintBlue: '#EAFCFD',
  white: '#FFFFFF',
  red: 'red',
  turquoiseNeon: '#33F8FF',
  aqua: '#13BBC2',
  aquaSedated: '#6eb2b2',
  greenMatte: '#1C4E5C',
  accentError: '#FF3D71',
  oceanBlue: '#3CA7C2',
  darkOceanBlue: '#014454',
  greyBlogLink: '#555F72',

  /******* Responsive Sizes *******/
  appNavBarMobile: '1400px',
  mobileViewWidth: '430px',
} as const;

export type NotionalSassVar = keyof typeof notionalSassVariables;

function getProp(key: NotionalSassVar) {
  return notionalSassVariables[key] || '';
}
export function getStyles(key: [NotionalSassVar] | NotionalSassVar) {
  /* eslint-disable */

  if (key instanceof Array) {
    return key.reduce(
      (previous, k) => ({
        ...previous,
        [k]: getProp(k),
      }),
      {}
    );
  } else if (typeof key === 'string') {
    return getProp(key);
  }

  return null;
}
