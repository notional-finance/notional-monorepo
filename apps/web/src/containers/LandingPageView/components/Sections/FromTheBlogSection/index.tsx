import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useInView } from 'react-intersection-observer';
import {
  getGhostContentAPI,
  truncateText,
  getDateString,
} from '@notional-finance/helpers';
import iconPersonSVG from '@notional-finance/assets/icons/icon-person.svg';
import { Box, styled, useTheme, Divider } from '@mui/material';
import { H1 } from '@notional-finance/mui';

const FromTheBlogSection = () => {
  const theme = useTheme();
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
  });

  useEffect(() => {
    const api = getGhostContentAPI();

    api.posts
      .browse({ limit: 2, include: ['tags', 'authors'] })
      .then(async (posts) => {
        setBlogPosts(posts);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  const inViewClassName = inView ? 'fade-in' : 'hidden';

  const displayAuthors = (post: any) => {
    // eslint-disable-next-line camelcase
    const { authors, created_at } = post;
    const createdAtTimestampInSeconds = new Date(created_at).getTime() / 1000;
    const authorsList = authors.map((author: any, index: number) => {
      // eslint-disable-next-line camelcase
      const { name, profile_image } = author;
      const key = `blog-post-author-${index}`;

      return (
        <li key={key} className="blog-post-author">
          {/* eslint-disable-next-line camelcase */}
          <img src={profile_image || iconPersonSVG} alt={`${author} profile`} />
          <span className="name">{name}</span>
          <span className="created-at">
            {getDateString(createdAtTimestampInSeconds)}
          </span>
        </li>
      );
    });

    return <ul>{authorsList}</ul>;
  };

  const displayLatestBlogPosts = () => {
    const retrievedBlogPosts = blogPosts.map((post, index) => {
      const { url } = post;
      const key = `blog-item-${index}`;

      return (
        <li key={key} className="blog-item box-shadow">
          <a href={url}>
            <img src={post.feature_image} alt="Blog post" />
            <div className="content">
              <span className="heading">
                <strong>{post.title}</strong>
              </span>
              <p>{truncateText(post.excerpt, 150)}</p>
              <Divider sx={{ margin: theme.spacing(4, 0) }} />
              {displayAuthors(post)}
            </div>
          </a>
        </li>
      );
    });

    return <ul id="section-8-blog-post-list">{retrievedBlogPosts}</ul>;
  };

  return (
    <StyledView ref={ref}>
      <div id="section-8" className={`section ${inViewClassName}`}>
        <div id="section-8-container">
          <H1 contrast marginBottom={theme.spacing(10)}>
            <FormattedMessage
              defaultMessage={'From the Blog'}
              description={'section title'}
            />
          </H1>
          {displayLatestBlogPosts()}
        </div>
      </div>
    </StyledView>
  );
};

const StyledView = styled(Box)(
  ({ theme }) => `
  p { word-break: break-word; }

  #section-8 {
    background: ${theme.gradient.landing};

    #section-8-container {
      padding: 100px 170px;
    }

    #section-8-blog-post-list {
      display: flex;
      justify-content: space-between;

      li.blog-item {
        background: ${theme.palette.common.white};
        border-radius: 4px;
        width: 46%;
        box-shadow: ${theme.shape.shadowStandard};
        padding-bottom: 30px;

        img {
          width: 100%;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;;
        }

        .content {
          padding: 40px;

          .heading {
            font-size: 28px;
            color: ${theme.palette.background.accentDefault};
            text-overflow: ellipsis;
            overflow: hidden;
            display: inline-block;
            white-space: nowrap;
            width: 100%;
          }

          p {
            color: ${theme.palette.background.accentDefault};
            font-weight: 500;
          }

          .blog-post-author {
            width: 100%;
            float: left;
            color: ${theme.palette.typography.light};

            img {
              width: 40px;
              border: 2px solid ${theme.palette.primary.light};
              border-radius: 50px;
              float: left;
              margin-right: 10px;
            }

            .name,
            .created-at  {
              display: block;
              font-size: 13px;
            }

            .name { margin-top: 1px; }
          }
        }
      }
    }
  }

  @media (max-width: 1250px) {
    #section-8 {
      #section-8-container {
        padding: 60px 20px;
      }

      #section-8-blog-post-list {
        display: block;

        li.blog-item {
          width: 100%;
          margin-bottom: 40px;
        }
      }
    }
  }
`
);

export default FromTheBlogSection;
