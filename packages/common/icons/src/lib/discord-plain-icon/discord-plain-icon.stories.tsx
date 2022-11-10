import { Story, Meta } from '@storybook/react';
import { DiscordPlainIcon, DiscordPlainIconProps } from './discord-plain-icon';

export default {
  component: DiscordPlainIcon,
  title: 'DiscordPlainIcon',
} as Meta;

const Template: Story<DiscordPlainIconProps> = (args) => <DiscordPlainIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
