import { Story, Meta } from '@storybook/react';
import { BugBountyIcon, BugBountyIconProps } from './bug-bounty-icon';

export default {
  component: BugBountyIcon,
  title: 'BugBountyIcon',
} as Meta;

const Template: Story<BugBountyIconProps> = (args) => <BugBountyIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
