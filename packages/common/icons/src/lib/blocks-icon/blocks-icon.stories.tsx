import { Story, Meta } from '@storybook/react';
import { BlocksIcon, BlocksIconProps } from './blocks-icon';

export default {
  component: BlocksIcon,
  title: 'BlocksIcon',
} as Meta;

const Template: Story<BlocksIconProps> = (args) => <BlocksIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
