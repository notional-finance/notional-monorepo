import GhostAdminAPI from '@tryghost/admin-api';
import GhostContentAPI from '@tryghost/content-api';

const GHOST_BASE_URL = 'https://notional-finance.ghost.io';

export const subscribeEmail = async (
  email: string,
  GHOST_ADMIN_KEY: string
) => {
  const api = new GhostAdminAPI({
    url: GHOST_BASE_URL,
    key: GHOST_ADMIN_KEY,
    version: 'v6.0',
  });
  try {
    await api.members.add({
      email,
      name: email,
      newsletters: ['6270f868b15f6100313727ff'],
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error Subscribing to Newsletter' }),
      { status: 500 }
    );
  }
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
