import { Box } from '@mui/material';
import { Story, Meta } from '@storybook/react';
import { SectionLink, SectionLinkProps } from './section-link';

export default {
  component: SectionLink,
  title: 'SectionLink',
} as Meta;

const Template: Story<SectionLinkProps> = (args) => {
  return (
    <Box sx={{ width: '600px' }}>
      <SectionLink {...args} />
    </Box>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  title: 'Section Link',
  description: 'Something that describes the section link',
};
