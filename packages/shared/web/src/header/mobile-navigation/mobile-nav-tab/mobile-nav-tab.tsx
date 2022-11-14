import { Tab, TabProps, useTheme } from '@mui/material';
import { INavLink } from '../../nav-link';

interface MobileNavTabProps extends TabProps {
  data: INavLink;
  handleClick?: (prop?: any) => void;
  displayXS?: string;
  displayMD?: string;
  value?: string;
}

const MobileNavTab = ({ data, handleClick, displayXS, displayMD }: MobileNavTabProps) => {
  const theme = useTheme();

  return (
    <Tab
      key={data.key}
      data-key={data.key}
      icon={data.iconImg}
      iconPosition="start"
      label={data.label}
      href={data.link}
      value={data.link}
      rel={data.external && data.target === '_blank' ? 'noreferrer' : ''}
      target={data.target || '_self'}
      component="a"
      onClick={handleClick}
      sx={{
        display: {
          xs: displayXS,
          md: displayMD,
        },
        '.MuiSvgIcon-root': {
          color: theme.palette.common.black,
        },
        '&.MuiTab-root, .MuiTab-labelIcon': {
          opacity: 1,
          color: theme.palette.common.black,
          textTransform: 'capitalize',
          fontSize: '1rem',
          justifyContent: 'flex-start',
          maxWidth: 'none',
          width: '90%',
          padding: '0px',
          margin: 'auto',
          borderBottom: data?.noBottomBorder ? 'none' : '1px solid #089CA3',
        },
        '&:hover': {
          svg: {
            filter:
              'invert(63%) sepia(16%) saturate(1939%) hue-rotate(134deg) brightness(91%) contrast(96%)',
          },
          color: theme.palette.primary.light,
        },
        '&.Mui-selected': {
          fontWeight: 700,
        },
      }}
    />
  );
};

export default MobileNavTab;
