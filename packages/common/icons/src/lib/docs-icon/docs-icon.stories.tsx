import { Story, Meta } from '@storybook/react';
import { DocsIcon, DocsIconProps } from './docs-icon';

export default {
  component: DocsIcon,
  title: 'DocsIcon',
} as Meta;

const Template: Story<DocsIconProps> = (args) => <DocsIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
