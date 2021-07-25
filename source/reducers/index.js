import {combineReducers} from 'redux';

import AuthReducer from './AuthReducer';
import AppReducer from './AppReducer';
import ListContactsReducer from './ListContactsReducer';
import ListConversation from './ListConversation';
import ListChatsReducer from './ListChatsReducer';
import TripReducer from './TripReducer';
import ListBroadcastReducer from './ListBroadcastReducer';
import NotificationsReducer from './NotificationsReducer';
import ChapperonesReducer from './ChapperonesReducer';

export default combineReducers({
  AuthReducer,
  AppReducer,
  ListContactsReducer,
  ListConversation,
  ListChatsReducer,
  TripReducer,
  ListBroadcastReducer,
  NotificationsReducer,
  ChapperonesReducer,
});
