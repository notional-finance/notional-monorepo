import { styled, Box } from '@mui/material';
import { truncateText } from '@notional-finance/helpers';
import { colors } from '@notional-finance/styles';
import { H4, BodySecondary, ExternalLink } from '@notional-finance/mui';
import { BlogCardFooter } from './blog-card-footer';

export const BlogCard = ({
  url,
  feature_image,
  title,
  excerpt,
  authors,
  created_at,
}) => {
  return (
    <HoverContainer>
      <ExternalLink href={url}>
        <TopImg src={feature_image} alt="Blog post" />
        <ContentContainer>
          <Title>{title}</Title>
          <BodyText>{truncateText(excerpt, 150)}</BodyText>
          <BlogCardFooter createdAt={created_at} author={authors[0]} />
        </ContentContainer>
      </ExternalLink>
    </HoverContainer>
  );
};

const BodyText = styled(BodySecondary)(
  ({ theme }) => `
    font-size: 1rem;
    color: ${colors.darkGreen};
    margin-bottom: ${theme.spacing(3)};
    padding-bottom: ${theme.spacing(3)};
    border-bottom: 1px solid ${colors.lightGrey};
    `
);

const TopImg = styled('img')(
  `
    width: 100%;
    margin-bottom: -10px;
    z-index: 2;
    position: relative;
    border-radius: 6px 6px 0px 0px;
    box-shadow: -2px 1px 24px rgba(135, 155, 215, 0.2), 0px 4px 16px rgba(121, 209, 213, 0.4);
`
);

const Title = styled(H4)(
  ({ theme }) => `
    color: ${colors.darkGreen};
    margin-bottom: ${theme.spacing(3)};
    height: ${theme.spacing(9.75)};
    display: flex;
    align-items: center;
        `
);

const ContentContainer = styled(Box)(
  ({ theme }) => `
    padding: ${theme.spacing(4)}; 
    background: ${colors.white}; 
    border-radius: ${theme.shape.borderRadius()};
    `
);

const HoverContainer = styled(Box)(
  ({ theme }) => `
  transition: all 0.3s ease;
  &:hover {
    cursor: pointer;
    box-shadow: ${theme.shape.shadowLarge(colors.matteGreen)};
    transition: all 0.3s ease;
    transform: scale(1.1);
  }
    `
);

export default BlogCard;
