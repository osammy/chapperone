import Schema from '../../schemas';
import {Platform} from 'react-native';
import {
  _get,
  _post,
  _remove,
  _update,
  _update_realm_data,
  _close_realm,
  _migrate,
} from '../../index';

const path =
  Platform.OS === 'ios'
    ? 'com.gochapperone.Chapperone/files/notifications.realm'
    : '/data/data/com.chapperone/files/notifications.realm';

const options = {
  schema: [Schema.NotificationsSchema],
  schemaVersion: Schema.schemaVersion,
  path,
  migration: (oldRealm, newRealm) => {
    // only apply this change if upgrading to schemaVersion 1
    if (oldRealm.schemaVersion < Schema.schemaVersion) {
      const oldObjects = oldRealm.objects('Notifications');
      const newObjects = newRealm.objects('Notifications');

      // loop through all objects and set the name property in the new schema
      for (let i = 0; i < oldObjects.length; i++) {
        newObjects[i].read = false;
      }
    }
  },
};
const model = 'Notifications';

export const getLocalNotifications = query => {
  return _get(options, model, query);
};

export const postToLocalNotifications = data => {
  return _post(options, model, data);
};

export const deleteLocalNotifications = query => {
  return _remove(options, model, query);
};

export const updateLocalNotifications = (query, body, upsert) => {
  return _update(options, model, body, query, upsert);
};

export const updateRealmNotificationsData = (dataArr, updateObj) => {
  return _update_realm_data(options, dataArr, updateObj);
};

export const closeNotificationsRealm = () => {
  return _close_realm(options);
};

export const migrateNotifications = () => {
  return _migrate(options);
};
