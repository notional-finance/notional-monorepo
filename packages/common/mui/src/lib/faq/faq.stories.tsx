import { Box } from '@mui/material';
import { Story, Meta } from '@storybook/react';
import { Faq, FaqProps } from './faq';

export default {
  component: Faq,
  title: 'Faq',
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: '100%',
          minHeight: '20rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Story />
      </Box>
    ),
  ],
} as Meta;

const Template: Story<FaqProps> = (args) => <Faq {...args} />;

export const WithLink = Template.bind({});
WithLink.args = {
  question: 'Why?',
  answer: 'Because.',
  slug: '#why',
};

export const WithoutLink = Template.bind({});
WithoutLink.args = {
  question: 'Why?',
  answer: 'Because.',
};

export const Condensed = Template.bind({});
Condensed.args = {
  question: 'What makes this condensed?',
  answer: 'The font size is 1 rem instead of 1.5rem',
  slug: '#condensed',
  condensed: true,
};
