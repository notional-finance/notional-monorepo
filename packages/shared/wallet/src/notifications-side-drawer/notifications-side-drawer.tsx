import { Box, styled, Typography, useTheme } from '@mui/material';
import { PageLoading } from '@notional-finance/mui';
import { AnnouncementIcon } from '@notional-finance/icons';
import {
  getFromLocalStorage,
  setInLocalStorage,
  truncateText,
} from '@notional-finance/helpers';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

export interface blogData {
  url: string;
  title: string;
  published_at: string;
  notification_type: string;
  excerpt: string;
}

export const NotificationsSideDrawer = () => {
  const notifications = getFromLocalStorage('notifications');
  const theme = useTheme();
  const handleMarkAsRead = () => {
    setInLocalStorage('notifications', {
      active: false,
      blogData: notifications.blogData,
    });
    // setNotificationsActive(false);
  };

  return (
    <Container>
      <Title>
        <FormattedMessage defaultMessage="Notifications" />
        {notifications.active && (
          <TextLink onClick={handleMarkAsRead}>
            <FormattedMessage defaultMessage="Mark All as Read" />
          </TextLink>
        )}
      </Title>
      {notifications.blogData.length ? (
        notifications.blogData.map(
          (
            { notification_type, title, url, excerpt, published_at }: blogData,
            index
          ) => (
            <ContentBlock
              onClick={() => window?.open(url)}
              key={`${notification_type}-${index}`}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <AnnouncementIcon sx={{ fontSize: '40px' }} />
                <Box
                  sx={{
                    fontWeight: 500,
                    marginLeft: '10px',
                    color: theme.palette.primary.dark,
                  }}
                >
                  {notification_type}
                </Box>
                <Text sx={{ flex: 1, textAlign: 'right' }}>
                  {moment(published_at).format('L')}
                </Text>
              </Box>
              <Text
                sx={{ marginBottom: '10px', color: theme.palette.primary.dark }}
              >
                {title}
              </Text>
              <Text>{truncateText(excerpt, 150)}</Text>
            </ContentBlock>
          )
        )
      ) : (
        <PageLoading></PageLoading>
      )}
    </Container>
  );
};

const ContentBlock = styled(Box)(
  ({ theme }) => `
  padding: 20px;
  border-radius: ${theme.shape.borderRadius()};
  margin: 30px 0px;
  background: ${theme.palette.background.default};
  border: ${theme.shape.borderStandard};
  cursor: pointer;
  `
);

const Title = styled(Box)(
  ({ theme }) => `
  margin-bottom: 20px;
  margin-top: 40px;
  font-weight: 700;
  color: ${theme.palette.primary.dark};
  display: flex;
  text-transform: uppercase;
  `
);

const Text = styled(Typography)(
  ({ theme }) => `
  font-weight: 500;
  font-size: 16px;
  color: ${theme.palette.typography.main};
  white-space: normal;
  `
);

const Container = styled(Box)(
  ({ theme }) => `
  ${theme.breakpoints.down('sm')} {
    margin: ${theme.spacing(2)};
  }
  `
);

const TextLink = styled('a')(
  ({ theme }) => `
  flex: 1;
  text-align: right;
  text-decoration: underline;
  text-transform: capitalize;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  color: ${theme.palette.typography.accent};
  `
);

export default NotificationsSideDrawer;
