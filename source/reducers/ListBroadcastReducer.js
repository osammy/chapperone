import {
  ADD_BROADCAST_MESSAGES,
  ADD_BROADCAST_MESSAGE,
  RESET_BROADCAST_CHATS,
  LAST_BROADCAST_MESSAGE,
  PREPEND_MESSAGES_TO_BROADCAST,
} from './../resources/types';

const INITIAL_STATE = {lastMessage: {}, messages: {}};
// key here is simply tripId

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    // BROADCAST CHATS
    case ADD_BROADCAST_MESSAGES:
      const dataKey = Object.keys(action.payload);
      const cOfStateMessages = {...state.messages};
      cOfStateMessages[dataKey] = action.payload[dataKey];

      return {...state, messages: cOfStateMessages};

    case ADD_BROADCAST_MESSAGE:
      const key = Object.keys(action.payload)[0];
      // I had to explicitly use JSON.pares and Stringify to do a deep copy, so that RNGCHATS will rerender
      //Note this is not a react bug but gifted chats bug, reacst rerendes but internal state of RNGIFTEDCHATS DOES NOT
      //SO I HAD TO CREATE A FRESH DEEP COPY so that nextProps.message !== this.props.message in RnGC Messenger.js
      const cOfState = JSON.parse(JSON.stringify(state));
      let broadcastMessages = cOfState.messages[key];

      if (broadcastMessages) {
        broadcastMessages.unshift(action.payload[key]);
      } else {
        broadcastMessages = [action.payload[key]];
      }
      cOfState.messages[key] = broadcastMessages;

      return cOfState;

    case LAST_BROADCAST_MESSAGE:
      const msgKey = Object.keys(action.payload)[0];
      const cOfMsgState = {...state.lastMessage};

      cOfMsgState[msgKey] = action.payload[msgKey];

      return {...state, lastMessage: cOfMsgState};
    case PREPEND_MESSAGES_TO_BROADCAST:
      const msgsKey = Object.keys(action.payload)[0];
      // I had to explicitly use JSON.pares and Stringify to do a deep copy, so that RNGCHATS will rerender
      //Note this is not a react bug but gifted chats bug, reacst rerendes but internal state of RNGIFTEDCHATS DOES NOT
      //SO I HAD TO CREATE A FRESH DEEP COPY so that nextProps.message !== this.props.message in RnGC Messenger.js
      const cpyOfState = JSON.parse(JSON.stringify(state));
      let groupMessages = cpyOfState.messages[msgsKey];

      if (groupMessages) {
        groupMessages = [...groupMessages, ...action.payload[msgsKey]];
      } else {
        groupMessages = [action.payload[msgsKey]];
      }
      cpyOfState.messages[msgsKey] = groupMessages;

      return cpyOfState;

    case RESET_BROADCAST_CHATS:
      return INITIAL_STATE;

    default:
      return state;
  }
};
