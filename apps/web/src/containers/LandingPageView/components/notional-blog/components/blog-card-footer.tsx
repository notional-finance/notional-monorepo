import { Box, styled } from '@mui/material';
import iconPersonSVG from '@notional-finance/assets/icons/icon-person.svg';
import { colors } from '@notional-finance/styles';
import { getDateString } from '@notional-finance/helpers';
import { Caption } from '@notional-finance/mui';

export const BlogCardFooter = ({ author, createdAt }) => {
  const createdAtTimestampInSeconds = new Date(createdAt).getTime() / 1000;
  const { name, profile_image } = author;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <ProfileImg
        src={profile_image || iconPersonSVG}
        alt={`${name} profile`}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Caption>{name}</Caption>
        <Caption>{getDateString(createdAtTimestampInSeconds)}</Caption>
      </Box>
    </Box>
  );
};

const ProfileImg = styled('img')(
  ({ theme }) => `
    width: ${theme.spacing(5)};
    border: 2px solid ${colors.aqua};
    border-radius: 50px;
    margin-right: 10px;
  `
);

export default BlogCardFooter;
