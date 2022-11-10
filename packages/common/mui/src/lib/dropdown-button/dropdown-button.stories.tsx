import { Story, Meta } from '@storybook/react';
import { DropdownButton, DropdownButtonProps } from './dropdown-button';
import { useState } from 'react';
import { Box } from '@mui/material';

export default {
  component: DropdownButton,
  title: 'DropdownButton',
} as Meta;

const Template: Story<DropdownButtonProps> = (args) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  return (
    <DropdownButton onClick={handleClick} {...args}>
      <Box sx={{ padding: '3rem' }}>Resources</Box>
    </DropdownButton>
  );
};

export const Primary = Template.bind({});
Primary.args = {};
