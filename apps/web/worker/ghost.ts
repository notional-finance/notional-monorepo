import GhostAdminAPI from '@tryghost/admin-api';
import GhostContentAPI from '@tryghost/content-api';

const GHOST_BASE_URL = 'https://notional-finance.ghost.io';

export const subscribeEmail = (email: string, GHOST_ADMIN_KEY: string) => {
  const api = new GhostAdminAPI({
    url: GHOST_BASE_URL,
    key: GHOST_ADMIN_KEY,
    version: 'v6.0',
  });
  return api.members.create({
    email,
    name: email,
    newsletters: ['6270f868b15f6100313727ff'],
  });
};

export const getLatestBlogPosts = async (GHOST_CONTENT_KEY: string) => {
  const api = new GhostContentAPI({
    url: GHOST_BASE_URL,
    key: GHOST_CONTENT_KEY,
    version: 'v6.0',
  });
  return await api.posts.browse({
    limit: 2,
    include: ['tags', 'authors'],
  });
};
