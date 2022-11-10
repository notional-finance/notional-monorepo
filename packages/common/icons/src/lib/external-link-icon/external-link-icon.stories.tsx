import { Story, Meta } from '@storybook/react';
import { ExternalLink, ExternalLinkProps } from './external-link-icon';

export default {
  component: ExternalLink,
  title: 'ExternalLink',
} as Meta;

const Template: Story<ExternalLinkProps> = (args) => <ExternalLink {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
