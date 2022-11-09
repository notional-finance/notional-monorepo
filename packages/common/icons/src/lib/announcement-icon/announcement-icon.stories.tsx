import { Story, Meta } from '@storybook/react';
import { AnnouncementIcon, AnnouncementIconProps } from './announcement-icon';

export default {
  component: AnnouncementIcon,
  title: 'AnnouncementIcon',
} as Meta;

const Template: Story<AnnouncementIconProps> = (args) => <AnnouncementIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
