import React from 'react';
import {Bubble} from 'react-native-gifted-chat';
import {theme} from '../../constants';

function ChatBubble(props) {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: '#F6F6F6',
        },
        right: {
          backgroundColor: theme.colors.secondary,
        },
      }}
    />
  );
}

export default ChatBubble;
