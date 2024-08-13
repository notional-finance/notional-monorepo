import { useState } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { NotionalTheme, colors } from '@notional-finance/styles';
import { ArrowRightIcon } from '@notional-finance/icons';
import {
  DiagramTitle,
  BodySecondary,
  SectionTitle,
} from '@notional-finance/mui';
import { Link, useNavigate } from 'react-router-dom';
import { DataSets } from '../use-how-it-works';

export interface CardContainerProps {
  hovered: boolean;
  theme: NotionalTheme;
}

export interface CustomSectionTitleProps {
  cardSet: string;
  theme: NotionalTheme;
  parentIndex?: number;
}

interface CardProps extends DataSets {
  parentIndex: number;
  cardSet: string;
}

export const Card = ({
  title,
  bodyText,
  actionItems,
  parentIndex,
  cardSet,
  linkText,
  link,
  hoverTitle,
}: CardProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <CardContainer
      key={parentIndex}
      theme={theme}
      hovered={hovered}
      sx={{
        height: parentIndex === 1 ? theme.spacing(34.75) : theme.spacing(30),
      }}
      onClick={() => navigate(link)}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      <Box id="content">
        <Box>
          <DiagramTitle
            sx={{
              color: colors.black,
              marginBottom: theme.spacing(1),
            }}
          >
            {title}
          </DiagramTitle>
          <BodySecondary sx={{ color: colors.darkGrey, fontSize: '1rem' }}>
            {bodyText}
          </BodySecondary>
        </Box>
        <SectionTitleContainer
          theme={theme}
          cardSet={cardSet}
          parentIndex={parentIndex}
        >
          {actionItems.map(({ itemText, icon }, index) => (
            <CustomSectionTitle key={index} theme={theme} cardSet={cardSet}>
              <img src={icon} alt="icon" />
              {itemText}
            </CustomSectionTitle>
          ))}
        </SectionTitleContainer>
      </Box>
      <Box
        id="hover-content"
        sx={{
          marginTop:
            parentIndex === 1
              ? `-${theme.spacing(29.125)}`
              : `-${theme.spacing(25)}`,
        }}
      >
        <DiagramTitle
          sx={{
            color: colors.white,
            marginBottom: theme.spacing(1),
          }}
        >
          {hoverTitle}
        </DiagramTitle>
        <Box>
          <CustomLink to={link}>
            <Body>
              {linkText}
              <ArrowRightIcon sx={{ height: theme.spacing(1.75) }} />
            </Body>
          </CustomLink>
        </Box>
      </Box>
    </CardContainer>
  );
};

const CardContainer = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'hovered',
})(
  ({ hovered, theme }: CardContainerProps) => `
    cursor: pointer;
    width: ${theme.spacing(37.5)};
    background: ${colors.white};
    border-radius: ${theme.shape.borderRadius()};
    border: 1px solid ${colors.purpleGrey};
    box-shadow: 0px 4px 10px rgba(20, 42, 74, 0.12);
    margin-bottom: ${theme.spacing(4)};
    padding: ${theme.spacing(4)};
    padding-top: ${theme.spacing(3)};
    z-index: 2;
    transition: all 0.3s ease;
    #content {
      opacity: 1;
    }
    #hover-content {    
      opacity: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    ${
      hovered &&
      `
      background: ${colors.blueGreen};
      #content {
        opacity: 0;
      }
      #hover-content {
        opacity: 1;
      }
    `
    }
    `
);

const CustomLink = styled(Link)(
  () => `
      z-index: 5;
      position: relative;
      `
);

const CustomSectionTitle = styled(SectionTitle, {
  shouldForwardProp: (prop: string) => prop !== 'cardSet',
})(
  ({ cardSet, theme }: CustomSectionTitleProps) => `
  color: ${colors.black};
  margin-bottom: ${theme.spacing(1.5)};

  img {
    height: ${theme.spacing(1.25)};
    margin-right: ${theme.spacing(1)};
  }

    ${
      cardSet === 'left' &&
      `
    display: flex;
    align-items: baseline;
    justify-content: end;
    flex-direction: row-reverse;
    img {
        margin-left: ${theme.spacing(1)};
        margin-right: 0px;
    }
    `
    }
    
      `
);

const SectionTitleContainer = styled(Box, {
  shouldForwardProp: (prop: string) =>
    prop !== 'cardSet' && prop !== 'parentIndex',
})(
  ({ cardSet, parentIndex }: CustomSectionTitleProps) => `
  ${
    cardSet === 'left'
      ? `
      position: relative;
      align-self: end;
      text-align: right;
      padding-top: ${parentIndex === 1 ? '21px' : '82px'};
    `
      : `
      position: relative;
      align-self: end;
      padding-top: ${parentIndex === 1 ? '43px' : '59px'};
    `
  }
      `
);

const Body = styled(BodySecondary)(
  ({ theme }) => `
  color: ${colors.neonTurquoise};
  border-bottom: 1px solid ${colors.lightGrey};
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing(3)};
`
);

export default Card;
