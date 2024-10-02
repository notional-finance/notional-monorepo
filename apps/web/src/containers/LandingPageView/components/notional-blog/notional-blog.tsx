import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { getGhostContentAPI } from '@notional-finance/helpers';
import { colors } from '@notional-finance/styles';
import { Box, styled, useTheme } from '@mui/material';
import { H5, H2, Button } from '@notional-finance/mui';
import { BlogCard } from './components';

export const NotionalBlog = () => {
  const theme = useTheme();
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  useEffect(() => {
    const api = getGhostContentAPI();

    api.posts
      .browse({ limit: 2, include: ['tags', 'authors'] })
      .then(async (posts) => {
        setBlogPosts(posts);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <BackgroundContainer>
      <InnerContainer>
        <H5 sx={{ color: colors.purpleGrey, marginBottom: theme.spacing(2) }}>
          <FormattedMessage defaultMessage={'Notional Blog'} />
        </H5>
        <Header>
          <FormattedMessage defaultMessage={'News From Notional'} />
        </Header>
        <CardContainer>
          {blogPosts.map(
            (
              { url, feature_image, title, excerpt, authors, created_at },
              index
            ) => (
              <Box sx={{ flex: 1 }} key={index}>
                <BlogCard
                  url={url}
                  feature_image={feature_image}
                  title={title}
                  excerpt={excerpt}
                  authors={authors}
                  created_at={created_at}
                />
              </Box>
            )
          )}
        </CardContainer>
        <ButtonContainer>
          <CustomButton size="large" href="https://blog.notional.finance/">
            <FormattedMessage defaultMessage={'View All Articles'} />
          </CustomButton>
        </ButtonContainer>
      </InnerContainer>
    </BackgroundContainer>
  );
};

const BackgroundContainer = styled(Box)(
  `
  height: 100%;
  width: 100%; 
    background: linear-gradient(271.53deg, rgba(191, 201, 245, 0.5) -60.81%, rgba(142, 161, 245, 0.5) -60.79%, #26CBCF 105.36%);
      `
);

const InnerContainer = styled(Box)(
  ({ theme }) => `
  height: 100%;
  margin: auto; 
  width: ${theme.spacing(150)};
  padding-top: ${theme.spacing(15)};
  padding-bottom: ${theme.spacing(15)};
  ${theme.breakpoints.down('mdLanding')} {
    width: ${theme.spacing(125)}; 
  }
  ${theme.breakpoints.down('smLanding')} {
    width: 90%;
  }
  ${theme.breakpoints.down('sm')} {
    padding-top: ${theme.spacing(7)};
    padding-bottom: ${theme.spacing(7)};
  }
      `
);

const CardContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    gap: ${theme.spacing(10)};
    ${theme.breakpoints.down('mdLanding')} {
      gap: ${theme.spacing(6)};
    }
    ${theme.breakpoints.down('smLanding')} {
      gap: ${theme.spacing(4)};
    }
    ${theme.breakpoints.down('sm')} {
      flex-direction: column;
    }
      `
);

const Header = styled(H2)(
  ({ theme }) => `
      color: ${colors.white}; 
      margin-bottom: ${theme.spacing(10)};
      ${theme.breakpoints.down('sm')} {
        font-size: 1.5rem;
        margin-bottom: ${theme.spacing(7)};
      }
        `
);

const ButtonContainer = styled(Box)(
  ({ theme }) => `
      display: flex;
      margin-top: ${theme.spacing(15)};
      justify-content: center;
      ${theme.breakpoints.down('sm')} {
        margin-top: ${theme.spacing(7)};
      }
        `
);

const CustomButton = styled(Button)(
  `
  background: ${colors.darkGreen};
  color: ${colors.white};
  transition: 0.3s ease;
  &:hover {
    background: ${colors.matteGreen};
    color: ${colors.white};
  }
        `
);

export default NotionalBlog;
