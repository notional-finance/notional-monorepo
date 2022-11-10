import { Story, Meta } from '@storybook/react';
import { ResourcesIcon, ResourcesIconProps } from './resources-icon';

export default {
  component: ResourcesIcon,
  title: 'ResourcesIcon',
} as Meta;

const Template: Story<ResourcesIconProps> = (args) => <ResourcesIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
