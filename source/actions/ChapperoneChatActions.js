/* eslint-disable curly */
import firebase from 'firebase';
import base64 from 'base-64';
import _ from 'lodash';
import {Alert} from 'react-native';
import {postWithAuth, getWithAuth} from '../resources/controllers/data';
import {getUrl} from '../resources/controllers/url';
import jwt_decode from 'jwt-decode';
import {RNToasty} from 'react-native-toasty';
// I have gine there to
import {
  getLocalChats,
  postToLocalChats,
  closeChatsRealm,
} from '../db/controllers/ChatsController';
import {
  realmToOrdinaryData,
  realmToJson,
  addFirebaseListerDetails,
  handleError,
} from '../resources/utils';

import {
  ADD_CHAPPERONES_MESSAGE,
  ADD_CHAPPERONES_MESSAGES,
  RESET_CHAPPERONES_CHATS,
  LAST_CHAPPERONES_MESSAGE,
  APPEND_CHAPPERONES_MESSAGES,
  UPDATE_GROUP_MESSAGE,
} from '../resources/types';

export const appendToChapperoneChats = payload => {
  return {
    type: ADD_CHAPPERONES_MESSAGE,
    payload,
  };
};
export const appendMsgsToChapperoneChats = payload => {
  return {
    type: APPEND_CHAPPERONES_MESSAGES,
    payload,
  };
};

export const updateGroupMessage = payload => {
  return {
    type: UPDATE_GROUP_MESSAGE,
    payload,
  };
};

export const setChapperonesMessages = payload => {
  return {
    type: ADD_CHAPPERONES_MESSAGES,
    payload,
  };
};

export const fetchLastChapperoneGroupMessage = (ref, tripId) => {
  return async dispatch => {
    try {
      const key = tripId;
      const payload = {};
      const query = `id_key = "chapperones-${tripId}" SORT(createdAt DESC) LIMIT(1)`;

      const messages = await getLocalChats(query);
      if (messages.length > 0) {
        const {
          sender_id,
          _id: msgId,
          text: message,
          image,
          createdAt,
          user,
        } = messages[0];
        const data = {
          sender_id,
          msgId,
          name: user?.name,
          message,
          image,
          createdAt,
        };

        payload[key] = data;
        dispatch({
          type: LAST_CHAPPERONES_MESSAGE,
          payload,
        });
      }

      ref.on('value', snapshot => {
        if (!snapshot.exists()) return;
        payload[key] = snapshot.val();
        dispatch({
          type: LAST_CHAPPERONES_MESSAGE,
          payload,
        });
      });
    } catch (e) {
      Alert.alert(e.message);
    }
  };
};

export const resetChapperonesChats = () => {
  return {
    type: RESET_CHAPPERONES_CHATS,
  };
};

export const getBroadCastMsgs = (tripId, userId) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      // const query = `id_key = "${tripId}" SORT(createdAt DESC)  LIMIT(1)`;
      const query = `id_key = "chapperones-${tripId}" SORT(createdAt DESC)`;

      getLocalChats(query)
        .then(savedBroadcasts => {
          const chatKey = tripId;
          const dataObj = {};
          dataObj[chatKey] = realmToJson(savedBroadcasts);
          // dispatch(setBroadcastMessages(dataObj));
          const latestData = savedBroadcasts[0];
          const refUrl = `/chapperones_broadcasts/${tripId}`;
          // Off if already listening;
          firebase
            .database()
            .ref(refUrl)
            .off();

          let ref = firebase.database().ref(refUrl);
          addFirebaseListerDetails({from: 'chapperones_broadcasts', refUrl});

          if (latestData) {
            const startAt = latestData.createdAt + 125; // 125 is an offset
            ref = firebase
              .database()
              .ref(refUrl)
              .orderByChild('createdAt')
              .startAt(startAt);
          }
          //
          ref.on('child_added', snapshot => {
            if (!snapshot.exists()) return;
            const key = tripId;
            const payload = {};
            const data = snapshot.val();
            payload[key] = data;

            // dispatch({
            //   type: ADD_BROADCAST_MESSAGE,
            //   payload,
            // });
            // dispatch({
            //   type: LAST_BROADCAST_MESSAGE,
            //   payload, // convertion is sometimes necessary because realm arr are not proper arrays they have some diff behaviour
            // });

            const dataToSaveLocally = {...data};
            dataToSaveLocally.id_key = tripId;
            dataToSaveLocally.trip_id = tripId;
            dataToSaveLocally.sender_id = userId;
            dataToSaveLocally.receiver_id = userId;
            dataToSaveLocally.status = 'delivered';
            //
            // dataToSaveLocally.image =
            //   'https://blog.lingoda.com/wp-content/uploads/2020/10/How-To-Say-Hello-in-10-Languages.jpg';

            try {
              postToLocalChats(dataToSaveLocally);
            } catch (error) {
              // Allow to fail silently.
              //Failure kay be due to duplication of messages from forebase handler, i doint know,
              // either ways let it fail silently
            }
          });

          // This is guaranteed to be called last. after on 'child_added'
          ref.limitToLast(1).on('value', () => {
            resolve();
          });
        })
        .catch(reject);
    });
  };
};
