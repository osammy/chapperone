/* eslint-disable curly */
import firebase from 'firebase';
import base64 from 'base-64';
import _ from 'lodash';
import {Alert} from 'react-native';
import {postWithAuth, getWithAuth} from '../resources/controllers/data';
import {getUrl} from '../resources/controllers/url';
import jwt_decode from 'jwt-decode';
import {RNToasty} from 'react-native-toasty';
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
  ADD_CONTACT,
  ADD_NEW_CONTACT_ERROR,
  ADD_NEW_CONTACT_SUCCESS,
  CONTACTS_LIST,
  CHANGE_MESSAGE,
  SEND_MESSAGE_SUCCESS,
  LIST_CONVERSATION_USER,
  FETCH_ALL_CHATS,
  FETCH_ONE_CHAT,
  // FETCH_NEW_CHAT_LIST,
  LOADING_CONTACTS,
  FAILED_LOAD_CONTACTS,
  LOADING_ADD_CONTACTS_TO_TRIP,
  FAILED_TO_ADD_CONTACT_TO_TRIP,
  CONTACT_IS_SELECTED,
  UNSELECT_ALL_CONTACTS,
  ADD_CONTACTS_TO_TRIP,
  UPDATE_PARTICIPANT_PERMISSIONS,
  LOADING_PARTICIPANTS,
  FAILED_LOAD_PARTICIPANTS,
  PARTICIPANTS_LIST,
  UPDATE_CHAT_LIST,
  // MARK_CHATS_AS_READ,
  RESET_CONTACTS,
  RESET_LIST_CHATS,
  RESET_BROADCAST_CHATS,
  FETCH_CONVERSATIONS_USER,
  ADD_USER_CONVERSATIONS,
  SET_CONVERSATIONS,
  UPDATE_ONE_MESSAGE, // update one message
  ADD_BROADCAST_MESSAGES,
  LAST_BROADCAST_MESSAGE,
  ADD_BROADCAST_MESSAGE,
  INCREASE_UNREAD_COUNT,
  RESET_CHATLIST_UNREAD,
  CLEAR_CONTACT_CHATS,
  CLEAR_ALL_CONVERSATIONS,
  SET_UNREAD_COUNT,
  CHANGE_UNREAD_MESSAGE_STATUS,
  CHANGE_UNREAD_BROADCAST_STATUS,
  RESET_NOTIFICATION_INDICATOR,
  CHANGE_UNREAD_TRIP_BROADCAST_STATUS,
  UPDATE_A_MESSAGE,
  PREPEND_MESSAGES_TO_BROADCAST,
} from '../resources/types';
import {
  postToLocalChatsList,
  closeChatsListRealm,
  getLocalChatsList,
  updateLocalChatsList,
  updateRealmChatsListData,
  chatlistRealmInstance,
  _updateChatList,
} from '../db/controllers/ChatsListController';

//
import Realm from 'realm';
import Schema from '../db/schemas';

/* added to redux */
export const addContact = email => {
  return {
    type: ADD_CONTACT,
    payload: email,
  };
};

export const unSelectAllContacts = () => {
  return {
    type: UNSELECT_ALL_CONTACTS,
  };
};

export const contactSelected = index => {
  return {
    type: CONTACT_IS_SELECTED,
    payload: index,
  };
};

export const failLoadContacts = trueOrFalse => {
  return {
    type: FAILED_LOAD_CONTACTS,
    payload: trueOrFalse,
  };
};

export const failAddContacts = trueOrFalse => {
  return {
    type: FAILED_TO_ADD_CONTACT_TO_TRIP,
    payload: trueOrFalse,
  };
};
export const loadingAddContacts = trueOrFalse => {
  return {
    type: LOADING_ADD_CONTACTS_TO_TRIP,
    payload: trueOrFalse,
  };
};

export const failLoadParticipants = trueOrFalse => {
  return {
    type: FAILED_LOAD_PARTICIPANTS,
    payload: trueOrFalse,
  };
};

export const registerNewContact = email => {
  return dispatch => {
    let emailContactB64 = base64.encode(email);

    firebase
      .database()
      .ref(`/users/${emailContactB64}`)
      .once('value')
      .then(snapshot => {
        if (snapshot.val()) {
          /* Guest email for new contact */
          const userData = _.first(_.values(snapshot.val()));
          /* Currently authenticated user */
          const {currentUser} = firebase.auth();
          let currentEmailB64 = base64.encode(currentUser.email);

          firebase
            .database()
            .ref(`/users_of_contacts/${currentEmailB64}`)
            .push({email, name: userData.name})
            .then(() => registerNewContactSuccess(dispatch))
            .catch(error => registerNewContactError(error, dispatch));
        } else {
          dispatch({
            type: ADD_NEW_CONTACT_ERROR,
            payload: '[App] The user does not exist!',
          });
        }
      });
  };
};

export const fetchContacts = emailLoggedIn => {
  /* A solução sera ao carregar a aplicação, atualizar o emailLoggedIn  no AppReducer para que aplicação não quebre
  devido ao componentWillMount tentar passar um valor inexistente, fazer um função que que buscar o currentUser e
  da dispatch atualizando na store e deixar o email = ''... assim qunado tiver retorno atualizar os contatos
  */
  return dispatch => {
    firebase
      .database()
      .ref(`/users_of_contacts/${emailLoggedIn}`)
      .on('value', snapshot => {
        dispatch({
          type: CONTACTS_LIST,
          payload: snapshot.val(),
        });
      });
  };
};

export const addContactsToTrip = (id, body) => {
  return async dispatch => {
    dispatch(loadingAddContacts(true));

    try {
      const url = getUrl('trips');
      const tripUrl = `${url}/${id}/users`;
      const {data: tripData} = await postWithAuth(tripUrl, body);
      const contacts = tripData.data;
      dispatch({
        type: ADD_CONTACTS_TO_TRIP,
        payload: contacts,
      });
      dispatch({
        type: UNSELECT_ALL_CONTACTS,
      });

      dispatch(loadingAddContacts(false));
      RNToasty.Normal({title: 'User(s) Added'});
    } catch (e) {
      dispatch(loadingAddContacts(false));
      handleError(e);
    }
  };
};

export const fetchAllContacts = (organisationId, params) => {
  return async dispatch => {
    try {
      dispatch({
        type: LOADING_CONTACTS,
        payload: true,
      });
      dispatch(failLoadContacts(false));
      const url = getUrl('users');
      const contactsUrl = `${url}/organisations/${organisationId}`;
      const {data: tripContacts} = await getWithAuth(contactsUrl, params);

      let contacts = [];

      tripContacts.data.forEach(el => {
        el.isSelect = false;
        contacts.push(el);
      });

      dispatch({
        type: LOADING_CONTACTS,
        payload: false,
      });

      dispatch({
        type: CONTACTS_LIST,
        payload: contacts,
      });
    } catch (e) {
      dispatch(failLoadContacts(true));
      dispatch({
        type: LOADING_CONTACTS,
        payload: false,
      });
      RNToasty.Normal({
        title: "Couldn't fetch contacts",
      });
    }
  };
};

export const updateParticipantPermissions = payload => {
  return {
    type: UPDATE_PARTICIPANT_PERMISSIONS,
    payload,
  };
};

export const fetchParticipants = (tripId, params) => {
  return async dispatch => {
    try {
      dispatch({
        type: LOADING_PARTICIPANTS,
        payload: true,
      });
      dispatch(failLoadParticipants(false));
      const url = getUrl('participants');
      const participantsUrl = `${url}/trips/${tripId}`;
      const {data: tripParticipants} = await getWithAuth(
        participantsUrl,
        params,
      );

      let participants = [];

      tripParticipants.data.forEach(el => {
        el.isSelect = false;
        participants.push(el);
      });

      dispatch({
        type: LOADING_PARTICIPANTS,
        payload: false,
      });

      dispatch({
        type: PARTICIPANTS_LIST,
        payload: participants,
      });

      return participants;
    } catch (e) {
      dispatch(failLoadParticipants(true));
      dispatch({
        type: LOADING_PARTICIPANTS,
        payload: false,
      });
      RNToasty.Normal({
        title: "Couldn't fetch Participants",
      });
    }
  };
};

const registerNewContactError = (error, dispatch) => {
  dispatch({
    type: ADD_NEW_CONTACT_ERROR,
    payload: error.message,
  });
};

const registerNewContactSuccess = dispatch =>
  dispatch({
    type: ADD_NEW_CONTACT_SUCCESS,
    payload: true,
  });

/* Chat component message */
export const changeMessage = text => {
  return {
    type: CHANGE_MESSAGE,
    payload: text,
  };
};

//RESETS

export const resetListChatReducer = () => {
  return {
    type: RESET_LIST_CHATS,
  };
};

export const resetContactsReducer = () => {
  return {
    type: RESET_CONTACTS,
  };
};

export const resetBroadcastChats = () => {
  return {
    type: RESET_BROADCAST_CHATS,
  };
};

// End of Resets

export const addToUserConversations = payload => {
  return {
    type: ADD_USER_CONVERSATIONS,
    payload,
  };
};
export const setConversations = payload => {
  return {
    type: SET_CONVERSATIONS,
    payload,
  };
};

export const updateMessage = payload => {
  return {
    type: UPDATE_ONE_MESSAGE,
    payload,
  };
};
export const updateAMessage = payload => {
  return {
    type: UPDATE_A_MESSAGE,
    payload,
  };
};

export const appendToBroadcast = payload => {
  return {
    type: ADD_BROADCAST_MESSAGE,
    payload,
  };
};

export const prependMsgsToBroadcast = payload => {
  return {
    type: PREPEND_MESSAGES_TO_BROADCAST,
    payload,
  };
};

export const setBroadcastMessages = payload => {
  return {
    type: ADD_BROADCAST_MESSAGES,
    payload,
  };
};

// export const addUnreadCount = () => {
//   return {
//     type: INCREASE_UNREAD_COUNT,
//   };
// };

export const getBroadCastMsgs = (tripId, userId) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      // const query = `id_key = "${tripId}" SORT(createdAt DESC)  LIMIT(1)`;
      const query = `id_key = "${tripId}" SORT(createdAt DESC)`;

      getLocalChats(query)
        .then(savedBroadcasts => {
          const chatKey = tripId;
          const dataObj = {};
          dataObj[chatKey] = realmToJson(savedBroadcasts);
          // dispatch(setBroadcastMessages(dataObj));
          const latestData = savedBroadcasts[0];
          const refUrl = `/broadcasts/${tripId}`;
          // Off if already listening;
          firebase
            .database()
            .ref(refUrl)
            .off();

          let ref = firebase.database().ref(refUrl);
          addFirebaseListerDetails({from: 'broadcasts', refUrl});

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

export const fetchLastBroadcastMessage = (ref, tripId) => {
  return async dispatch => {
    try {
      const key = tripId;
      const payload = {};
      const query = `id_key = "${tripId}" SORT(createdAt DESC) LIMIT(1)`;

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
          type: LAST_BROADCAST_MESSAGE,
          payload,
        });
      }
    } catch (e) {
      console.log(e.message);
    }
    ref.on('value', snapshot => {
      if (!snapshot.exists()) return;
      const key = tripId;
      const payload = {};
      payload[key] = snapshot.val();

      dispatch({
        type: LAST_BROADCAST_MESSAGE,
        payload,
      });
    });
  };
};

export const increaseUnreadCount = payload => {
  return {
    type: INCREASE_UNREAD_COUNT,
    payload,
  };
};
export const setUnreadCount = payload => {
  return {
    type: SET_UNREAD_COUNT,
    payload,
  };
};
export const resetChatlistUnread = payload => {
  return {
    type: RESET_CHATLIST_UNREAD, //SETS CHAT LIST UREAD TO 0
    payload,
  };
};

export const clearContactChats = key => {
  return {
    type: CLEAR_CONTACT_CHATS, //SETS CHAT LIST UREAD TO 0
    payload: key,
  };
};
export const resetListConversationReducer = () => {
  return {
    type: CLEAR_ALL_CONVERSATIONS, //SETS CHAT LIST UREAD TO 0
  };
};

export const changeTripsUnreadNotification = payload => {
  return {
    type: CHANGE_UNREAD_MESSAGE_STATUS,
    payload,
  };
};
export const changeTripBroadcastUnreadNotification = payload => {
  return {
    type: CHANGE_UNREAD_TRIP_BROADCAST_STATUS,
    payload,
  };
};
// indicateTripBroadcastUnread

export const changeTripsBroadcastUnreadNotification = payload => {
  return {
    type: CHANGE_UNREAD_BROADCAST_STATUS,
    payload,
  };
};

export const resetNotificationsReducer = () => {
  return {
    type: RESET_NOTIFICATION_INDICATOR,
  };
};

async function handleLocalChatsStorage(conversation, tripId, userId, dispatch) {
  try {
    const contactId = conversation._id;
    const user_msg_id_key = `${tripId}-${userId}-${contactId}`;
    const contact_msg_id_key = `${tripId}-${contactId}-${userId}`;
    const query = `id_key = "${user_msg_id_key}" OR id_key = "${contact_msg_id_key}" SORT(createdAt DESC)`;
    const chatData = await getLocalChats(query, 'plain');
    const latestData = chatData[0];
    const refUrl = `/messages/${tripId}/${userId}/${contactId}`;
    // Store the firebase listener details so that listener can be removed later
    addFirebaseListerDetails({from: 'chats', refUrl});
    // Just to query for unread alone

    /**
 *     const unreadCountQuery = `id_key = "${user_msg_id_key}" AND type = "receive" AND status != "received"`;
    const unreadInRealm = await getLocalChats(unreadCountQuery, 'plain');
    const unreadTotalCount = unreadInRealm.length;
    console.log(unreadTotalCount);
    console.log(user_msg_id_key)
    console.log(await getLocalChats());

    if(unreadTotalCount > 0) {
      const chatListUserUniqueKey = `${tripId}-${userId}`;
      const localCountPayload = {};
      const localPayload = {
        contactId,
        count: unreadTotalCount,
      };
      localCountPayload[chatListUserUniqueKey] = localPayload;
      // Fire redux action to increase unread count
      dispatch(setUnreadCount(localCountPayload));
    }
 */

    let ref = firebase.database().ref(refUrl);

    if (latestData) {
      const startAt = latestData.createdAt + 125; // 1 is an offset
      ref = firebase
        .database()
        .ref(refUrl)
        .orderByChild('createdAt')
        .startAt(startAt);
    }
    ref.on('child_added', async messagesSnap => {
      if (!messagesSnap.exists()) return;
      const body = messagesSnap.val();
      const {type, status} = body;
      if (type === 'receive' && status !== 'received') {
        // Add unread marker
        const notifDetails = {};
        notifDetails[tripId] = true;
        dispatch(changeTripsUnreadNotification(notifDetails));
      }

      // This is an added fault tolerance redundant check, naturally the startAt date should prevent any
      // message already stored to be gotten form this on 'child_added' handler.
      const dataPresent = await getLocalChats(`_id = "${body._id}"`);
      // If not already saved to realm save it!
      if (dataPresent.length === 0) {
        const {type} = body;
        let id_key;
        // if (type === 'send') id_key = user_msg_id_key;
        // else if (type === 'receive') id_key = contact_msg_id_key;
        if (type === 'receive') id_key = user_msg_id_key;
        else if (type === 'send') id_key = contact_msg_id_key;

        body.id_key = id_key;
        // // For consistency store the date as a number, it is coming from gifted chats as a date object
        // body.createdAt = Number(body.createdAt);
        body.trip_id = tripId;
        body.sender_id = userId;
        body.receiver_id = contactId;

        try {
          await postToLocalChats(body);
          // await closeChatsRealm();
          if (type === 'receive' && status !== 'received') {
            const chatListUserUniqueKey = `${tripId}-${userId}`;
            const localCountPayload = {};
            const localPayload = {
              contactId,
              count: 1,
            };
            localCountPayload[chatListUserUniqueKey] = localPayload;
            // Fire redux action to increase unread count
            dispatch(increaseUnreadCount(localCountPayload));
          }
        } catch (e) {
          console.log(e.message);
          console.log('failed to save to realm');
        }
      }
    });
    ref.limitToLast(1).once('value', async () => {
      /**
       * Never return from this callback when snap is empty i.e snap.exists() is null
       * Because this callback should be guaranteed to fire once after in child added has fired
       * the data it contains is not used here however, i use this to set the unread count
       */
      console.log('in limit to last');
      const unreadQuery = `id_key = "${user_msg_id_key}" AND type = "receive" AND status = "delivered"`;
      const receivedChats = await getLocalChats(unreadQuery, 'plain');
      const chatLen = receivedChats.length;
      const listKey = `${tripId}-${userId}`;
      const countPayload = {};
      const payload = {
        contactId,
        count: chatLen,
      };
      countPayload[listKey] = payload;
      // Fire redux action to increase unread count
      dispatch(setUnreadCount(countPayload));
    });
  } catch (e) {
    // console.log(e);
  }
}

export const fetchChatList = (tripId, userId) => {
  return async dispatch => {
    const refUrl = `/user_conversations/${tripId}/${userId}`;
    const userConversationRef = firebase.database().ref(refUrl);

    const key = `${tripId}-${userId}`;
    const chatsList = await getLocalChatsList(
      `id_key = "${key}" SORT(createdAt DESC)`,
      'plain',
    );

    if (chatsList.length > 0) {
      const chatlistData = {};
      chatlistData[key] = chatsList;
      dispatch({
        type: FETCH_ALL_CHATS,
        payload: chatlistData,
      });
    }

    userConversationRef.on('child_added', async snapshot => {
      try {
        if (!snapshot.exists()) return;
        const conversation = snapshot.val();
        const listBody = {id_key: key, unread_count: 0, ...conversation};
        const found = chatsList.find(el => el._id === conversation._id);

        if (!found) {
          let payload = {};
          payload[key] = listBody;
          dispatch({type: FETCH_ONE_CHAT, payload});
          try {
            await postToLocalChatsList(listBody);
          } catch (e) {
            //Fail silently
          }
        } else {
          const sameMsg = conversation.msgId === found.msgId;

          if (!sameMsg) {
            const toBeUpdated = {};
            toBeUpdated[key] = listBody;
            dispatch({
              type: UPDATE_CHAT_LIST,
              payload: toBeUpdated,
            });
          }
        }
        handleLocalChatsStorage(conversation, tripId, userId, dispatch);
      } catch (e) {
        //fail silently
        //Alert.alert(e.message);
      }
    });

    userConversationRef.on('child_changed', async snap => {
      const key = `${tripId}-${userId}`;
      const changedData = {};
      const latestCoversation = snap.val();
      const {createdAt, lastMessage, msgId, role} = latestCoversation;

      changedData[key] = latestCoversation;
      dispatch({
        type: UPDATE_CHAT_LIST,
        payload: changedData,
      });
      // Check if message is not from the user, then increment unread count
      if (latestCoversation.senderId !== userId) {
        const listKey = `${tripId}-${userId}`;
        const countPayload = {};
        const payload = {
          contactId: latestCoversation._id,
          count: 1,
        };
        countPayload[listKey] = payload;
        //fire redux action to increase unread count
        dispatch(increaseUnreadCount(countPayload));

        //update chatlist realm
        const listQuery = `_id = "${latestCoversation._id}"`;
        const oneContact = await getLocalChatsList(listQuery);

        if (oneContact && oneContact.length > 0) {
          const unread_count = oneContact[0].unread_count + 1;
          await updateLocalChatsList(listQuery, {
            createdAt,
            lastMessage,
            msgId,
            role,
            unread_count,
          });
        }
      }
    });
    //store firebase listener ref
    addFirebaseListerDetails({from: 'chatslist', refUrl});
  };
};

export const fetchContactMessages = (tripId, userId, contactId, startAt) => {
  return dispatch => {
    const msgRef = `/messages/${tripId}/${userId}/${contactId}`;

    let ref = firebase.database().ref(msgRef);
    addFirebaseListerDetails({from: 'chats', refUrl: msgRef});

    if (startAt) {
      ref = firebase
        .database()
        .orderByChild('createdAt')
        .startAt(startAt)
        .ref(msgRef);
    }

    ref.on('value', snapshot => {
      dispatch({
        type: FETCH_CONVERSATIONS_USER,
        payload: snapshot.val(),
      });
    });
  };
};
