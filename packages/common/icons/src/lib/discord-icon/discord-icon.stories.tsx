import { Story, Meta } from '@storybook/react';
import { DiscordIcon, DiscordIconProps } from './discord-icon';

export default {
  component: DiscordIcon,
  title: 'DiscordIcon',
} as Meta;

const Template: Story<DiscordIconProps> = (args) => <DiscordIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
