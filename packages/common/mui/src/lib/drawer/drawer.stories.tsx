import { Story, Meta } from '@storybook/react';
import { Drawer, DrawerProps } from './drawer';

export default {
  component: Drawer,
  title: 'Drawer',
} as Meta;

const Template: Story<DrawerProps> = (args) => <Drawer {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
