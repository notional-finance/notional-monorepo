import { useState } from 'react';
import { useTheme, Box, styled } from '@mui/material';
import { NotionalTheme, colors } from '@notional-finance/styles';
import { ArrowRightIcon } from '@notional-finance/icons';
import {
  ExternalLink,
  CardInput,
  BodySecondary,
  ButtonText,
} from '@notional-finance/mui';

interface ContentWrapperProps {
  hovered: boolean;
  theme: NotionalTheme;
}

export const CommunityCard = ({ title, link, linkText, icon, text }) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <ExternalLink href={link}>
      <Container
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
      >
        <TitleContainer>
          <img src={icon} alt="icon" style={{ height: theme.spacing(4) }} />
          <Title>{title}</Title>
        </TitleContainer>

        <BodyText>{text}</BodyText>
        <BorderContainer hovered={hovered} theme={theme}>
          <LinkTextContainer hovered={hovered} theme={theme}>
            <ArrowRightIcon
              sx={{ height: '14px', marginRight: theme.spacing(1) }}
              fill={colors.aqua}
            />
            <LinkText>{linkText}</LinkText>
          </LinkTextContainer>
        </BorderContainer>
      </Container>
    </ExternalLink>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      width: ${theme.spacing(29.125)};
      margin-bottom: ${theme.spacing(7)};
      min-height: ${theme.spacing(22.5)};
      display: grid;
      background: ${colors.white};
      overflow: hidden;
      ${theme.breakpoints.down('sm')} {
        width: 100%;
    }
        `
);

const TitleContainer = styled(Box)(
  ({ theme }) => `
      ${theme.breakpoints.down('sm')} {
        display: flex;
        align-items: center;
        img {
          margin-right: ${theme.spacing(2)};
        }
    }
        `
);
const BodyText = styled(BodySecondary)(
  ({ theme }) => `
      font-size: 1rem;
      color: ${colors.darkGrey};
      margin-bottom: ${theme.spacing(2)};
      height: ${theme.spacing(8.5)};
        `
);

const Title = styled(CardInput)(
  ({ theme }) => `
      color: ${colors.black};
      margin-bottom: ${theme.spacing(2)};
      margin-top: ${theme.spacing(1.5)};
      border-bottom: 2px solid transparent;
      border-image: ${theme.gradient.landing};
      border-image-slice: 2;
      width: fit-content;
        `
);

const BorderContainer = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'hovered',
})(
  ({ hovered }: ContentWrapperProps) => `
      display: flex;
      align-items: center;
      border-bottom: 1px solid ${colors.lightGrey};
      position: relative;
      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(to right, ${colors.aqua}, ${colors.aqua});
        transform: ${hovered ? 'scaleX(1)' : 'scaleX(0)'};
        transform-origin: left;
        transition: transform 0.3s ease;
        margin-bottom: -1px;
      }
      `
);

const LinkTextContainer = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'hovered',
})(
  ({ hovered, theme }: ContentWrapperProps) => `
      display: flex;
      align-items: center;
      transform: ${hovered ? 'translateX(0px)' : 'translateX(-32px)'};
      transition: 0.3s ease;
      position: relative;
      padding-bottom: ${theme.spacing(1)};
      ${theme.breakpoints.down('sm')} {
        transform: translateX(0px);
        flex-direction: row-reverse;
    }
      `
);

const LinkText = styled(ButtonText)(
  `
      color: ${colors.aqua};
      white-space: nowrap;
  `
);

export default CommunityCard;
