import { useRef, useState } from 'react';

// material-ui
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// third party
import EmojiPicker, { SkinTones, EmojiClickData } from 'emoji-picker-react';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';

import { openSnackbar } from 'api/snackbar';
import { insertChat, useGetUsers } from 'api/chat';
import incrementer from 'utils/incrementer';

// assets
import PaperClipOutlined from '@ant-design/icons/PaperClipOutlined';
import PictureOutlined from '@ant-design/icons/PictureOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';
import SmileOutlined from '@ant-design/icons/SmileOutlined';
import SoundOutlined from '@ant-design/icons/SoundOutlined';

// types
import { UserProfile } from 'types/user-profile';
import { SnackbarProps } from 'types/snackbar';

interface Props {
  user: UserProfile;
}

// ==============================|| CHAT - MESSAGE SEND ||============================== //

export default function ChatMessageSend({ user }: Props) {
  const { users } = useGetUsers();

  const [anchorElEmoji, setAnchorElEmoji] = useState<any>(); /** No single type can cater for all elements */

  const handleOnEmojiButtonClick = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
    setAnchorElEmoji(anchorElEmoji ? null : event?.currentTarget);
  };

  // handle new message form
  const [message, setMessage] = useState('');
  const textInput = useRef(null);

  const handleOnSend = () => {
    if (message.trim() === '') {
      openSnackbar({
        open: true,
        message: 'Message required',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
    } else {
      const d = new Date();
      const newMessage = {
        id: Number(incrementer(users.length)),
        from: 'User1',
        to: user.name,
        text: message,
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      insertChat(user.name!, newMessage);
    }
    setMessage('');
  };

  const handleEnter = (event: React.KeyboardEvent<HTMLDivElement> | undefined) => {
    if (event?.key !== 'Enter') {
      return;
    }
    handleOnSend();
  };

  // handle emoji
  const onEmojiClick = (emojiObject: EmojiClickData) => {
    setMessage(message + emojiObject.emoji);
  };

  const emojiOpen = Boolean(anchorElEmoji);
  const emojiId = emojiOpen ? 'simple-popper' : undefined;

  const handleCloseEmoji = () => {
    setAnchorElEmoji(null);
  };

  return (
    <Stack>
      <TextField
        inputRef={textInput}
        fullWidth
        multiline
        rows={4}
        placeholder="Your Message..."
        value={message}
        onChange={(e) => setMessage(e.target.value.length <= 1 ? e.target.value.trim() : e.target.value)}
        onKeyDown={handleEnter}
        variant="standard"
        sx={{
          pr: 2,
          '& .MuiInput-root:before': { borderBottomColor: 'divider' }
        }}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" sx={{ py: 2, ml: -1 }}>
          <>
            <IconButton
              ref={anchorElEmoji}
              aria-describedby={emojiId}
              onClick={handleOnEmojiButtonClick}
              sx={{ opacity: 0.5 }}
              size="medium"
              color="secondary"
            >
              <SmileOutlined />
            </IconButton>
            <Popper
              id={emojiId}
              open={emojiOpen}
              anchorEl={anchorElEmoji}
              disablePortal
              sx={{ zIndex: 1200 }}
              popperOptions={{
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [-20, 125]
                    }
                  }
                ]
              }}
            >
              <ClickAwayListener onClickAway={handleCloseEmoji}>
                <MainCard elevation={8} content={false}>
                  <EmojiPicker onEmojiClick={onEmojiClick} defaultSkinTone={SkinTones.DARK} lazyLoadEmojis={true} />
                </MainCard>
              </ClickAwayListener>
            </Popper>
          </>
          <IconButton sx={{ opacity: 0.5 }} size="medium" color="secondary">
            <PaperClipOutlined />
          </IconButton>
          <IconButton sx={{ opacity: 0.5 }} size="medium" color="secondary">
            <PictureOutlined />
          </IconButton>
          <IconButton sx={{ opacity: 0.5 }} size="medium" color="secondary">
            <SoundOutlined />
          </IconButton>
        </Stack>
        <IconButton color="primary" onClick={handleOnSend} size="large" sx={{ mr: 1.5 }}>
          <SendOutlined />
        </IconButton>
      </Stack>
    </Stack>
  );
}
