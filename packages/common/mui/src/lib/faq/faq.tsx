import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  useTheme,
  Tooltip,
} from '@mui/material';
import { ReactNode, useState, useEffect, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import { H4 } from '../typography/typography';

/* eslint-disable-next-line */
export interface FaqProps {
  question: ReactNode;
  answer: ReactNode;
  slug?: string;
}

const INITIAL_TIP = 'Copy Link';
const COPIED_TIP = 'Link Copied';

export function Faq({ question, answer, slug = '' }: FaqProps) {
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
      expanded={expanded}
      onChange={handleChange}
      ref={faqRef}
      sx={{
        padding: '1.25rem',
        marginBottom: '1.75rem !important',
        borderRadius: theme.shape.borderRadiusLarge,
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
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <H4>{question}</H4>
        </Box>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          padding: '.5rem 1rem 1rem',
        }}
      >
        <H4 fontWeight="light">{answer}</H4>
      </AccordionDetails>
    </Accordion>
  );
}

export default Faq;
