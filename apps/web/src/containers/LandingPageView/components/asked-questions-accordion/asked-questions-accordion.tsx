import { defineMessages, FormattedMessage } from 'react-intl';
import { useInView } from 'react-intersection-observer';
import { Box, useTheme } from '@mui/material';
import { Faq, Button, H1 } from '@notional-finance/mui';

const faqs = [
  defineMessages({
    question: {
      defaultMessage: 'How is the interest rate set?',
      description: 'faq question',
    },
    answer: {
      defaultMessage:
        "The interest rate is updated based on a user's trade size using an automated market maker. The rate is determined by the current market's supply and demand and will vary for each individual loan. However, once executed, the user's rate is fixed for the duration of the loan and will not change.",
      description: 'faq answer',
    },
  }),
  defineMessages({
    question: {
      defaultMessage: 'What are the risks?',
      description: 'faq question',
    },
    answer: {
      defaultMessage:
        'Users of the protocol face two risks, the risk that Notional gets hacked and the risk that borrowers on the platform become insolvent. Notional takes security extremely seriously and has never been hacked. The protocol has been audited by industry leaders including Open Zeppelin, Certora, ABDK, and Code Arena. Notional’s liquidation infrastructure makes sure that borrowers do not become insolvent, and if they do, the protocol shields users from any losses with its reserve funds.',
      description: 'faq answer',
    },
  }),
  defineMessages({
    question: {
      defaultMessage:
        "What's the difference between fixed rates on Notional and 'stable rates' found elsewhere?",
      description: 'faq question',
    },
    answer: {
      defaultMessage:
        "Lenders and borrowers get fixed interest rates on Notional which can't and won't change over the course of the maturity. While stable rates do exist on other platforms (usually at a premium) they are not fixed and often do change with certain market conditions.",
      description: 'faq answer',
    },
  }),
  defineMessages({
    question: {
      defaultMessage:
        'Do I have to keep my funds and collateral locked in for the entire duration of the loan maturity?',
      description: 'faq question',
    },
    answer: {
      defaultMessage:
        'You can close out your loan and withdraw your funds at any time prior to maturity without penalty. By doing so, you would be closing out the remaining portion of your loan at the prevailing market rate - this could be at a higher or lower rate than what you started with.',
      description: 'faq answer',
    },
  }),
];
export const AskedQuestionsAccordion = () => {
  const theme = useTheme();
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
  });

  const inViewClassName = inView ? 'fade-in' : 'hidden';

  return (
    <Box ref={ref}>
      <Box
        className={`section ${inViewClassName}`}
        sx={{
          background: theme.palette.background.default,
          width: '100%',
        }}
      >
        <Box padding={{ xs: theme.spacing(8, 4), lg: theme.spacing(12, 18) }}>
          <Box marginBottom={theme.spacing(6)}>
            <H1
              marginBottom={theme.spacing(6)}
              sx={{ textAlign: { xs: 'center', lg: 'left' } }}
            >
              <FormattedMessage
                defaultMessage="Actually Asked Questions!"
                description={'frequently asked questions heading'}
              />
            </H1>

            {faqs.map((f, i) => (
              <Faq
                key={`faq-${i}`}
                question={<FormattedMessage {...f.question} />}
                answer={<FormattedMessage {...f.answer} />}
                slug={''}
              />
            ))}
          </Box>
          <Box display="flex" justifyContent="center">
            <Button
              size="large"
              href="https://docs.notional.finance/notional-v2/faq"
              sx={{
                background: theme.gradient.landing,
                border: theme.shape.borderHighlight,
              }}
            >
              <FormattedMessage
                defaultMessage="More FAQs"
                description="button link text"
              />
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AskedQuestionsAccordion;
