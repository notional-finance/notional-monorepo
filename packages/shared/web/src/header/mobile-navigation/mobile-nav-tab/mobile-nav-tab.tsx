import { Tab, TabProps, useTheme } from '@mui/material';
import { INavLink } from '../../nav-link';
import { Link } from 'react-router-dom';

interface MobileNavTabProps extends TabProps {
  data: INavLink;
  handleClick?: (prop?: any) => void;
  handleCloseDrawer?: () => void;
  displayXS?: string;
  displayMD?: string;
  value?: string;
}

const MobileNavTab = ({
  data,
  handleClick,
  handleCloseDrawer,
  displayXS,
  displayMD,
}: MobileNavTabProps) => {
  const theme = useTheme();

  return (
    <Tab
      key={data.key}
      data-key={data.key}
      icon={data.iconImg}
      iconPosition="start"
      label={data.label}
      to={data.link || ''}
      value={data.link || ''}
      rel={data.external && data.target === '_blank' ? 'noreferrer' : ''}
      target={data.target || '_self'}
      component={Link}
      onClick={handleClick}
      onClickCapture={handleCloseDrawer}
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
        },
      }}
    />
  );
};

export default MobileNavTab;
