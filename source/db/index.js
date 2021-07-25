/* eslint-disable curly */
import Realm from 'realm';
import {realmToJson} from '../resources/utils';
/***
 * ..._plain means they return a plain array as opposed to a realm array
 */

export const _get = (options, model, query) => {
  return new Promise((resolve, reject) => {
    Realm.open(options)
      .then(realm => {
        const result = query
          ? realm.objects(model).filtered(query)
          : realm.objects(model);
        // console.log(realm.path);
        resolve(Array.from(result.snapshot()));
      })
      .catch(reject);
  });
};

export const _get_plain = (options, model, query) => {
  return new Promise((resolve, reject) => {
    Realm.open(options)
      .then(realm => {
        const result = query
          ? realm.objects(model).filtered(query)
          : realm.objects(model);
        const data = realmToJson(Array.from(result.snapshot()));
        // realm.close();
        resolve(data);
      })
      .catch(reject);
  });
};

export const _post = (options, model, data) => {
  return new Promise((resolve, reject) => {
    Realm.open(options)
      .then(realm => {
        realm.write(() => {
          resolve(realm.create(model, data));
        });
      })
      .catch(reject);
  });
};

export const _post_plain = (options, model, data) => {
  return new Promise((resolve, reject) => {
    Realm.open(options)
      .then(realm => {
        realm.write(() => {
          const result = realm.create(model, data);
          const postData = realmToJson(result);
          // realm.close();
          resolve(postData);
        });
      })
      .catch(reject);
  });
};

export function _remove(options, models, query) {
  return new Promise((resolve, reject) => {
    Realm.open(options)
      .then(realm => {
        if (!Array.isArray(models)) {
          models = [models];
        }

        // realm.write is placed inside of the forEach becasue it fails with the error
        // you can only delete inside of a transaction
        models.forEach(async model => {
          const allItems = await _get(options, model, query);
          realm.write(() => {
            realm.delete(allItems);
          });
        });
        resolve(true);
      })
      .catch(reject);
  });
}

export function _update(options, model, body, query, upsert) {
  if (typeof body !== 'object') {
    return new Error('Body must be an object');
  }
  return new Promise((resolve, reject) => {
    Realm.open(options)
      .then(realm => {
        realm.write(() => {
          const allItems = query
            ? realm.objects(model).filtered(query)
            : realm.objects(model);

          const keys = Object.keys(body);

          allItems.snapshot().forEach(item => {
            keys.forEach(key => {
              //Update the key field if the key already exists
              if (item[key] !== undefined || item[key] !== null)
                item[key] = body[key];
            });
          });

          if (upsert && allItems.length === 0) {
            _post(options, model, body)
              .then(resolve)
              .catch(reject);
          } else resolve(allItems);
        });
      })
      .catch(reject);
  });
}

export function _update_realm_data(options, dataArr, updateObj) {
  if (typeof updateObj !== 'object') {
    return new Error('Body must be an object');
  }

  if (!Array.isArray(dataArr)) dataArr = [dataArr];

  return new Promise((resolve, reject) => {
    Realm.open(options)
      .then(realm => {
        realm.write(() => {
          const keys = Object.keys(updateObj);
          dataArr.forEach(data => {
            keys.forEach(key => {
              if (data[key] !== undefined || data[key] !== null) {
                data[key] = updateObj[key];
              }
            });
          });

          resolve(dataArr);
        });
      })
      .catch(reject);
  });
}

export function _get_realm_instance(options) {
  return new Promise((resolve, reject) => {
    Realm.open(options)
      .then(realm => {
        resolve(realm);
      })
      .catch(reject);
  });
}

export function _close_realm(options) {
  return new Promise((resolve, reject) => {
    Realm.open(options)
      .then(realm => {
        realm.close();
        resolve();
      })
      .catch(reject);
  });
}

export function _delete_all_realm(options) {
  return new Promise((resolve, reject) => {
    Realm.open(options)
      .then(realm => {
        realm.write(() => {
          realm.deleteAll();
          resolve();
        });
      })
      .catch(reject);
  });
}

export function _migrate(options) {
  Realm.open(options).then(realm => {});
}

export default {
  _post,
  _post_plain,
  _get,
  _get_plain,
  _remove,
  _update,
  _update_realm_data,
  _get_realm_instance,
  _close_realm,
  _delete_all_realm,
  _migrate,
};
