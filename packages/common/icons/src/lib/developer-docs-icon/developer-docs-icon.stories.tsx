import { Story, Meta } from '@storybook/react';
import { DeveloperDocsIcon, DeveloperDocsIconProps } from './developer-docs-icon';

export default {
  component: DeveloperDocsIcon,
  title: 'DeveloperDocsIcon',
} as Meta;

const Template: Story<DeveloperDocsIconProps> = (args) => <DeveloperDocsIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
