import { Typography, TypographyProps, useTheme } from '@mui/material';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { Link } from 'react-router-dom';
import { ExternalLink } from '../external-link/external-link';

type StylesProps = Omit<TypographyProps, 'variant'>;

export interface CustomTypographyProps extends StylesProps {
  accent?: boolean;
  contrast?: boolean;
  error?: boolean;
  main?: boolean;
  light?: boolean;
  href?: string;
  to?: string;
  fontWeight?: 'light' | 'regular' | 'medium' | 'bold';
  inline?: boolean;
  uppercase?: boolean;
  gutter?: 'default' | 'tight' | 'none';
  msg?: MessageDescriptor;
  // NOTE: This is intentionally a any type. MUI does not provide a clear way to get the type for this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: any;
}

const makeVariant = (
  variant: TypographyProps['variant'],
  componentOverRide?: string
) => {
  // eslint-disable-next-line react/display-name
  return ({
    children,
    accent,
    contrast,
    error,
    href,
    main,
    light,
    to,
    inline,
    uppercase,
    gutter = 'none',
    msg,
    component,
    ...style
  }: CustomTypographyProps) => {
    const theme = useTheme();
    let color;
    if (accent) color = theme.palette.typography.accent;
    if (contrast) color = theme.palette.typography.contrastText;
    if (error) color = theme.palette.error.main;
    if (main) color = theme.palette.typography.main;
    if (light) color = theme.palette.typography.light;
    let marginBottom;
    if (gutter === 'none') marginBottom = theme.spacing(0);
    if (gutter === 'tight') marginBottom = theme.spacing(0.5);
    // If default is set then let typography settings take over
    if (gutter === 'default') marginBottom = undefined;

    const el = (
      <Typography
        // Set margin bottom first to allow incoming props to override
        marginBottom={marginBottom}
        {...style}
        textTransform={uppercase ? 'uppercase' : undefined}
        letterSpacing={uppercase ? '1px' : undefined}
        color={color}
        variant={variant}
        display={inline ? 'inline' : 'block'}
        component={componentOverRide || component}
      >
        {msg ? <FormattedMessage {...msg} /> : children}
      </Typography>
    );

    if (href) {
      return <ExternalLink href={href}>{el}</ExternalLink>;
    } else if (to) {
      return <Link to={to}>{el}</Link>;
    } else {
      return el;
    }
  };
};

// LANDING/CARD PAGE SPECIFIC============
export const CardInput = makeVariant('cardInput');
export const SmallInput = makeVariant('smallInput');
export const SectionTitle = makeVariant('sectionTitle');
export const CurrencyTitle = makeVariant('largeNumberLabel');
export const LargeInputText = makeVariant('largeInput');
export const MobileNav = makeVariant('mobileNav');
export const DiagramTitle = makeVariant('diagramTitle');

// DEFAULT ============
export const H1 = makeVariant('h1');
export const H2 = makeVariant('h2');
export const H3 = makeVariant('h3');
export const H4 = makeVariant('h4');
export const ModuleTitle = makeVariant('h4');
export const LargeTableCell = makeVariant('h4');
export const H5 = makeVariant('h5');
export const TableColumnHeading = makeVariant('h5');
export const ParagraphTitle = makeVariant('h5');
export const SideNavText = makeVariant('h5');
export const Body = makeVariant('body1', 'div');
export const Paragraph = makeVariant('body1');
export const Label = makeVariant('body1');
export const LabelValue = makeVariant('labelValue');
export const TableCell = makeVariant('tableCell');
export const BodySecondary = makeVariant('body2');
export const TooltipText = makeVariant('body2');
export const Subtitle = makeVariant('subtitle1');
export const SmallTableCell = makeVariant('caption');
export const ButtonText = makeVariant('button');
export const HeadingSubtitle = makeVariant('subtitle1');
export const LargeNumber = makeVariant('largeNumber');
export const LargeNumberLabel = makeVariant('largeNumberLabel');
export const LargeInputTextEmphasized = makeVariant('largeInputEmphasized');
export const LinkText = makeVariant('link');
export const Caption = makeVariant('caption');
export const CaptionAccent = makeVariant('captionAccent');
