import Realm from 'realm';
import {Platform} from 'react-native';
import Schema from '../../schemas';
import {
  _get,
  _post,
  _remove,
  _update,
  _update_realm_data,
  _close_realm,
  _migrate,
  _post_plain,
  _get_plain,
  _get_realm_instance,
} from '../../index';

const path = Platform.OS === 'ios' ? 'com.gochapperone.Chapperone/files/chatslist.realm': '/data/data/com.chapperone/files/chatslist.realm'


const options = {
  schema: [Schema.ChatsListSchema],
  schemaVersion: Schema.schemaVersion,
  path,
};

const model = 'ChatsList';

export const getLocalChatsList = (query, variant) => {
  if (variant === 'plain') {
    return _get_plain(options, model, query);
  }
  return _get(options, model, query);
};

export const postToLocalChatsList = (data, variant) => {
  if (variant === 'plain') {
    return _post_plain(options, model, data);
  }

  return _post(options, model, data);
};

export const deleteLocalChatsList = query => {
  return _remove(options, model, query);
};

export const updateLocalChatsList = (query, body, upsert) => {
  return _update(options, model, body, query, upsert);
};

export const updateRealmChatsListData = (dataArr, updateObj) => {
  return _update_realm_data(options, dataArr, updateObj);
};

export const chatlistRealmInstance = () => {
  return _get_realm_instance(options);
}

export const closeChatsListRealm = () => {
  return _close_realm(options);
};

export const migrateChatsList = () => {
  return _migrate(options);
};
//extra 
export const _updateChatList = (query, body) => {
  return new Promise((resolve, reject) => {
    Realm.open(options)
      .then(realm => {
        const result = query
          ? realm.objects(model).filtered(query)
          : realm.objects(model);

        realm.write(() => {
          result.createdAt = body.createdAt;
          result.lastMessage = body.lastMessage;
          result.msgId = body.msgId;
          result.unread_count = body.unread_count;
          // result.createdAt = body.createdAt;
          // result.createdAt = body.createdAt;
        });
        resolve(Array.from(result));
      })
      .catch(reject);
  });
};
