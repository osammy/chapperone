/* eslint-disable curly */
import {GiftedChat} from 'react-native-gifted-chat';

const INITIAL_STATE = {
  messages: {}, // format is {'[key]': [{},{},....]}
};

import {
  LIST_CONVERSATION_USER,
  ADD_USER_CONVERSATIONS,
  RESET_USER_CONVERSATION,
  ADD_ONE_MESSAGE,
  SET_CONVERSATIONS,
  UPDATE_ONE_MESSAGE,
  CLEAR_CONTACT_CHATS,
  CLEAR_ALL_CONVERSATIONS,
  UPDATE_A_MESSAGE,
} from './../resources/types';

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LIST_CONVERSATION_USER:
      return action.payload;
    case ADD_USER_CONVERSATIONS:
      const key = Object.keys(action.payload)[0];

      const prevMessagesObj = {...state.messages};
      const messagesArr = prevMessagesObj[key];
      let newMessagesArr = [];
      if (messagesArr) {
        newMessagesArr = GiftedChat.append(messagesArr, action.payload[key]);
      } else {
        newMessagesArr = action.payload[key];
      }

      prevMessagesObj[key] = newMessagesArr;
      return {...state, messages: prevMessagesObj};
    case RESET_USER_CONVERSATION:
      return INITIAL_STATE;

    // case ADD_ONE_MESSAGE:
    //   const messages = [...state.messages];
    //   messages.push(action.payload);
    //   return {...state, messages: messages};

    case SET_CONVERSATIONS:
      const dkey = Object.keys(action.payload)[0];
      const cpyOfMessages = {...state.messages};
      cpyOfMessages[dkey] = action.payload[dkey];
      return {...state, messages: cpyOfMessages};

    case UPDATE_ONE_MESSAGE:
      const messagesKey = Object.keys(action.payload)[0];
      // I had to use 'JSON.stringify' because i needed a deep copy of the object
      // If not RNGiftedChats does not rerender
      const cpyOfMsgs = JSON.parse(JSON.stringify(state.messages));
      const msgArr = cpyOfMsgs[messagesKey];
      const msgToUpdateId = action.payload[messagesKey]._id;
      const foundIndx = msgArr.findIndex(el => el._id === msgToUpdateId);
      if (foundIndx !== -1) msgArr[foundIndx].status = 'received';
      cpyOfMsgs[messagesKey] = msgArr;
      return {...state, messages: cpyOfMsgs};
    case UPDATE_A_MESSAGE:
      const messages_Key = Object.keys(action.payload)[0];
      // I had to use 'JSON.stringify' because i needed a deep copy of the object
      // If not RNGiftedChats does not rerender
      const copyOfMsgs = JSON.parse(JSON.stringify(state.messages));
      const messagesArray = copyOfMsgs[messages_Key];
      const messageToUpdateId = action.payload[messages_Key]._id;

      if (!messagesArray) {
        return state;
      }
      const foundIdx = messagesArray.findIndex(
        el => el._id === messageToUpdateId,
      );
      if (foundIdx !== -1) {
        messagesArray[foundIdx] = action.payload[messages_Key];
      }
      copyOfMsgs[messages_Key] = messagesArray;
      return {...state, messages: copyOfMsgs};

    case CLEAR_CONTACT_CHATS:
      const conversationKey = action.payload;
      const cpyOMsgs = {...state.messages};
      delete cpyOMsgs[conversationKey];

      return {...state, messages: cpyOMsgs};

    case CLEAR_ALL_CONVERSATIONS:
      return INITIAL_STATE;

    default:
      return state;
  }
};
