import Schema from '../../schemas';
import {Platform} from 'react-native';
import {
  _get,
  _get_plain,
  _post,
  _post_plain,
  _remove,
  _update,
  _update_realm_data,
  _close_realm,
  _delete_all_realm,
} from '../../index';

const path =
  Platform.OS === 'ios'
    ? 'com.gochapperone.Chapperone/files/chats.realm'
    : '/data/data/com.chapperone/files/chats.realm';

const options = {
  schema: [Schema.ChatsSchema, Schema.ChatUserSchema],
  schemaVersion: Schema.schemaVersion,
  path,
};
const model = 'Chats';

export const getLocalChats = (query, variant) => {
  if (variant === 'plain') {
    return _get_plain(options, model, query);
  }
  return _get(options, model, query);
};

export const postToLocalChats = (data, variant) => {
  if (variant === 'plain') {
    return _post_plain(options, model, data);
  }
  return _post(options, model, data);
};

export const deleteLocalChats = query => {
  return _remove(options, model, query);
};

export const updateLocalChats = (query, body, upsert) => {
  return _update(options, model, body, query, upsert);
};

export const updateRealmData = (dataArr, updateObj) => {
  return _update_realm_data(options, dataArr, updateObj);
};

export const closeChatsRealm = () => {
  return _close_realm(options);
};

export const deleteAllRealm = () => {
  return _delete_all_realm(options);
};
