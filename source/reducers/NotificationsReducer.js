import * as type from '../resources/types';

const INITIAL_STATE = {
  indicateMessageUnread: {},
  indicateBroadcastUnread: false,
  indicateTripBroadcastUnread: false,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case type.CHANGE_UNREAD_MESSAGE_STATUS:
      const key = Object.keys(action.payload)[0];
      const indicateMessageUnread = {...state.indicateMessageUnread};
      indicateMessageUnread[key] = action.payload[key];
      return {...state, indicateMessageUnread};
    case type.CHANGE_UNREAD_BROADCAST_STATUS:
      return {...state, indicateBroadcastUnread: action.payload}; // this controls the bell in trips page
    case type.CHANGE_UNREAD_TRIP_BROADCAST_STATUS:
      const objKey = Object.keys(action.payload)[0];
      const indicateTripBroadcastUnread = {
        ...state.indicateTripBroadcastUnread,
      };
      indicateTripBroadcastUnread[objKey] = action.payload[objKey];
      return {...state, indicateTripBroadcastUnread};
    case type.RESET_NOTIFICATION_INDICATOR:
      return INITIAL_STATE;
    default:
      return state;
  }
};
