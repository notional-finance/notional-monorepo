import { Story, Meta } from '@storybook/react';
import { StakeIcon, StakeIconProps } from './stake-icon';

export default {
  component: StakeIcon,
  title: 'StakeIcon',
} as Meta;

const Template: Story<StakeIconProps> = (args) => <StakeIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
