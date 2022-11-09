import { Story, Meta } from '@storybook/react';
import { ForumIcon, ForumIconProps } from './forum-icon';

export default {
  component: ForumIcon,
  title: 'ForumIcon',
} as Meta;

const Template: Story<ForumIconProps> = (args) => <ForumIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
