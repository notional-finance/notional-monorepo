import {
  setInLocalStorage,
  getFromLocalStorage,
} from '@notional-finance/helpers';
import moment from 'moment';
import GhostContentAPI from '@tryghost/content-api';

export const getNotificationsData = () => {
  const notifications = getFromLocalStorage('notifications');
  let result;
  const api = new GhostContentAPI({
    url: 'https://notional-finance.ghost.io',
    key: '8aaf8ab675aff1a497228a380b',
    version: 'v3',
  });

  if (!notifications.active) {
    result = api.posts
      .browse({ limit: 2 })
      .then((posts) => {
        const postData = posts.map((data) => {
          return {
            url: data.url,
            published_at: data.published_at,
            title: data.title,
            notification_type: 'Blog',
            excerpt: data.excerpt,
          };
        });
        const currentDate = new Date();
        const newestPublishedDate = moment(postData[0].published_at);
        const formattedCurrentDate = moment(currentDate);
        const daysSinceLastPost = formattedCurrentDate.diff(
          newestPublishedDate,
          'days'
        );
        const notificationsActive =
          daysSinceLastPost <= 12 || !notifications.blogData;
        if (notificationsActive) {
          setInLocalStorage('notifications', {
            active: true,
            blogData: postData,
          });
        }
        return notificationsActive;
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
  }
  return result;
};
