import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  useTheme,
  Tooltip,
  SxProps,
} from '@mui/material';
import { ReactNode, useState, useEffect, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import { Body, H4 } from '../typography/typography';

 
export interface FaqProps {
  question: ReactNode;
  questionDescription?: ReactNode;
  answer?: ReactNode;
  componentAnswer?: ReactNode;
  slug?: string;
  sx?: SxProps;
  onClick?: () => void;
}

const INITIAL_TIP = 'Copy Link';
const COPIED_TIP = 'Link Copied';

export function Faq({
  question,
  questionDescription,
  answer,
  componentAnswer,
  slug = '',
  sx,
  onClick,
}: FaqProps) {
  const { origin, pathname, hash } = window.location;
  const url = `${origin}${pathname}${slug}`;
  const isActive = hash !== '' && hash === slug;

  const theme = useTheme();
  const [tipText, setTipText] = useState(INITIAL_TIP);
  const [expanded, setExpanded] = useState(false);
  const faqRef = useRef<HTMLDivElement>(null);

  const [linkOpacity, setLinkOpacity] = useState(0);
  const showLink = !!slug && slug !== '';

  useEffect(() => {
    if (isActive) {
      setExpanded(true);
      const offsetTop = faqRef.current?.offsetTop ?? 0;
      const yPosition = offsetTop > 0 ? offsetTop - 100 : 0;
      window.scrollTo(0, yPosition);
    }
  }, [isActive]);

  const handleChange = () => {
    setExpanded(!expanded);
  };

  const handleCopyLinkClick = () => {
    navigator.clipboard.writeText(url);
    setTipText(COPIED_TIP);
    setTimeout(() => setTipText(INITIAL_TIP), 10000);
  };

  return (
    <Accordion
      onClick={onClick}
      expanded={expanded}
      onChange={handleChange}
      ref={faqRef}
      sx={{
        padding: '1.25rem',
        marginBottom: '1.75rem !important',
        borderRadius: theme.shape.borderRadius(),
        border: theme.shape.borderStandard,
        boxShadow: theme.shape.shadowStandard,
        ':before': {
          display: 'none',
        },
        ':first-of-type': {
          borderTopLeftRadius: theme.shape.borderRadiusLarge,
          borderTopRightRadius: theme.shape.borderRadiusLarge,
        },
        ':last-of-type': {
          borderBottomLeftRadius: theme.shape.borderRadiusLarge,
          borderBottomRightRadius: theme.shape.borderRadiusLarge,
        },
        ...sx,
      }}
    >
      <AccordionSummary
        expandIcon={
          <AddIcon
            sx={{
              color: theme.palette.primary.main,
              transform: expanded ? 'rotate(135deg)' : 'rotate(0deg)',
            }}
          />
        }
        onMouseOver={() => setLinkOpacity(1)}
        onMouseOut={() => setLinkOpacity(0)}
      >
        {showLink && (
          <Tooltip title={tipText}>
            <IconButton
              onClick={handleCopyLinkClick}
              size="small"
              sx={{
                position: 'absolute',
                top: '-1rem',
                left: '-1rem',
                opacity: linkOpacity,
                transition: 'opacity 300ms cubic-bezier(0.4,0,0.2,1) 0ms',
              }}
            >
              <LinkIcon
                sx={{
                  transform: 'rotate(-45deg)',
                }}
              />
            </IconButton>
          </Tooltip>
        )}
        <Box
          sx={{
            width: '100%',
          }}
        >
          <H4>{question}</H4>
          {questionDescription && !expanded && (
            <Body sx={{ marginTop: theme.spacing(2) }} id="faq-body">
              {questionDescription}
            </Body>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          padding: theme.spacing(1, 2, 2),
        }}
      >
        {componentAnswer && componentAnswer}
        {answer && <Body id="faq-body">{answer}</Body>}
      </AccordionDetails>
    </Accordion>
  );
}

export default Faq;
