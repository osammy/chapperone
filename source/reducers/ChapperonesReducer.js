import {
  ADD_CHAPPERONES_MESSAGES,
  ADD_CHAPPERONES_MESSAGE,
  RESET_CHAPPERONES_CHATS,
  LAST_CHAPPERONES_MESSAGE,
  APPEND_CHAPPERONES_MESSAGES,
  UPDATE_GROUP_MESSAGE,
} from './../resources/types';

const INITIAL_STATE = {lastGroupMessage: {}, messages: {}};
// key here is simply tripId

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    // CHAPPERONES CHATS
    case ADD_CHAPPERONES_MESSAGES:
      const dataKey = Object.keys(action.payload);
      const cOfStateMessages = {...state.messages};
      cOfStateMessages[dataKey] = action.payload[dataKey];

      return {...state, messages: cOfStateMessages};

    case ADD_CHAPPERONES_MESSAGE:
      const key = Object.keys(action.payload)[0];

      // I had to explicitly use JSON.pares and Stringify to do a deep copy, so that RNGCHATS will rerender
      //Note this is not a react bug but gifted chats bug, reacst rerendes but internal state of RNGIFTEDCHATS DOES NOT
      //SO I HAD TO CREATE A FRESH DEEP COPY so that nextProps.message !== this.props.message in RnGC Messenger.js
      const cOfState = JSON.parse(JSON.stringify(state));
      let broadcastMessages = cOfState.messages[key];
      if (broadcastMessages) {
        // alert('found');

        broadcastMessages.unshift(action.payload[key]);
      } else {
        broadcastMessages = [action.payload[key]];
      }
      cOfState.messages[key] = broadcastMessages;
      // console.log(broadcastMessages);
      return cOfState;
    case APPEND_CHAPPERONES_MESSAGES:
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

    case LAST_CHAPPERONES_MESSAGE:
      const msgKey = Object.keys(action.payload)[0];
      const cOfMsgState = {...state.lastGroupMessage};

      cOfMsgState[msgKey] = action.payload[msgKey];

      return {...state, lastGroupMessage: cOfMsgState};

    case UPDATE_GROUP_MESSAGE:
      const messages_Key = Object.keys(action.payload)[0];
      // I had to use 'JSON.stringify' because i needed a deep copy of the object
      // If not RNGiftedChats does not rerender
      const copyOfMsgs = JSON.parse(JSON.stringify(state.messages));
      const messagesArray = copyOfMsgs[messages_Key];
      const messageToUpdateId = action.payload[messages_Key]._id;
      const foundIdx = messagesArray.findIndex(
        el => el._id === messageToUpdateId,
      );
      if (foundIdx !== -1) {
        messagesArray[foundIdx] = action.payload[messages_Key];
      }
      copyOfMsgs[messages_Key] = messagesArray;
      return {...state, messages: copyOfMsgs};

    case RESET_CHAPPERONES_CHATS:
      return INITIAL_STATE;

    default:
      return state;
  }
};

//
[
  {
    _id: '773f103f-5c46-43dc-8945-9d083868d347',
    createdAt: 1624415048401,
    firebase_key: '-McqfdAGVI-SjRQpBuvs',
    text: 'Teacvh',
    type: 'chapperones_broadcast',
    user: {
      _id: '5eee304fd530b10025f81328',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/chapperone-6a910.appspot.com/o/user_assets%2FeT6qC-9c4a0d00-446a-4dc4-a224-7f1f290a67ec.jpg?alt=media&token=fe8d9247-594c-4adc-964b-58276b8ff3cc',
      name: 'Helen  Adegoke',
    },
  },
  {
    _id: '7adc8277-56d1-45d6-9284-20aa1087f608',
    createdAt: 1624415036266,
    firebase_key: '-McqfaCeN3L-IS9bj32V',
    text: 'Your',
    type: 'chapperones_broadcast',
    user: {
      _id: '5eee304fd530b10025f81328',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/chapperone-6a910.appspot.com/o/user_assets%2FeT6qC-9c4a0d00-446a-4dc4-a224-7f1f290a67ec.jpg?alt=media&token=fe8d9247-594c-4adc-964b-58276b8ff3cc',
      name: 'Helen  Adegoke',
    },
  },
  {
    _id: '7a1ed7b0-954a-47f1-b9f2-427f75ba3743',
    createdAt: 1624415030205,
    firebase_key: '-McqfZiwzVbk94Ub7KXX',
    text: 'Me',
    type: 'chapperones_broadcast',
    user: {
      _id: '5eee304fd530b10025f81328',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/chapperone-6a910.appspot.com/o/user_assets%2FeT6qC-9c4a0d00-446a-4dc4-a224-7f1f290a67ec.jpg?alt=media&token=fe8d9247-594c-4adc-964b-58276b8ff3cc',
      name: 'Helen  Adegoke',
    },
  },
  {
    _id: '96b0291a-1edb-4bf3-a1e6-ca1330ec5896',
    createdAt: 1624415026711,
    firebase_key: '-McqfYsKZ3B-dm6e5caq',
    text: 'teach',
    type: 'chapperones_broadcast',
    user: {
      _id: '5eee304fd530b10025f81328',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/chapperone-6a910.appspot.com/o/user_assets%2FeT6qC-9c4a0d00-446a-4dc4-a224-7f1f290a67ec.jpg?alt=media&token=fe8d9247-594c-4adc-964b-58276b8ff3cc',
      name: 'Helen  Adegoke',
    },
  },
];

//
[
  {
    _id: 'ab0677db-43c0-4c24-9eb3-2c3509ecc232',
    createdAt: 1624415057641,
    firebase_key: '-McqffMYhwDf_YYr-ZBq',
    id_key: 'chapperones-5ef0b967f7b2510025926f2d',
    image: null,
    imageLocalPath: null,
    receiver_id: '5eee304fd530b10025f81328',
    sender_id: '5eee304fd530b10025f81328',
    status: 'received',
    text: 'So',
    trip_id: '5ef0b967f7b2510025926f2d',
    type: 'chapperones_broadcast',
    user: {
      _id: '5eee304fd530b10025f81328',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/chapperone-6a910.appspot.com/o/user_assets%2FeT6qC-9c4a0d00-446a-4dc4-a224-7f1f290a67ec.jpg?alt=media&token=fe8d9247-594c-4adc-964b-58276b8ff3cc',
      name: 'Helen  Adegoke',
    },
  },
  {
    _id: 'ab0677db-43c0-4c24-9eb3-2c3509ecc232',
    createdAt: 1624415057641,
    firebase_key: '-McqffMYhwDf_YYr-ZBq',
    id_key: 'chapperones-5ef0b967f7b2510025926f2d',
    image: null,
    imageLocalPath: null,
    receiver_id: '5eee304fd530b10025f81328',
    sender_id: '5eee304fd530b10025f81328',
    status: 'received',
    text: 'So',
    trip_id: '5ef0b967f7b2510025926f2d',
    type: 'chapperones_broadcast',
    user: {
      _id: '5eee304fd530b10025f81328',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/chapperone-6a910.appspot.com/o/user_assets%2FeT6qC-9c4a0d00-446a-4dc4-a224-7f1f290a67ec.jpg?alt=media&token=fe8d9247-594c-4adc-964b-58276b8ff3cc',
      name: 'Helen  Adegoke',
    },
  },
  {
    _id: 'ab0677db-43c0-4c24-9eb3-2c3509ecc232',
    createdAt: 1624415057641,
    firebase_key: '-McqffMYhwDf_YYr-ZBq',
    id_key: 'chapperones-5ef0b967f7b2510025926f2d',
    image: null,
    imageLocalPath: null,
    receiver_id: '5eee304fd530b10025f81328',
    sender_id: '5eee304fd530b10025f81328',
    status: 'received',
    text: 'So',
    trip_id: '5ef0b967f7b2510025926f2d',
    type: 'chapperones_broadcast',
    user: {
      _id: '5eee304fd530b10025f81328',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/chapperone-6a910.appspot.com/o/user_assets%2FeT6qC-9c4a0d00-446a-4dc4-a224-7f1f290a67ec.jpg?alt=media&token=fe8d9247-594c-4adc-964b-58276b8ff3cc',
      name: 'Helen  Adegoke',
    },
  },
  {
    _id: 'ab0677db-43c0-4c24-9eb3-2c3509ecc232',
    createdAt: 1624415057641,
    firebase_key: '-McqffMYhwDf_YYr-ZBq',
    id_key: 'chapperones-5ef0b967f7b2510025926f2d',
    image: null,
    imageLocalPath: null,
    receiver_id: '5eee304fd530b10025f81328',
    sender_id: '5eee304fd530b10025f81328',
    status: 'received',
    text: 'So',
    trip_id: '5ef0b967f7b2510025926f2d',
    type: 'chapperones_broadcast',
    user: {
      _id: '5eee304fd530b10025f81328',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/chapperone-6a910.appspot.com/o/user_assets%2FeT6qC-9c4a0d00-446a-4dc4-a224-7f1f290a67ec.jpg?alt=media&token=fe8d9247-594c-4adc-964b-58276b8ff3cc',
      name: 'Helen  Adegoke',
    },
  },
  {
    _id: 'ab0677db-43c0-4c24-9eb3-2c3509ecc232',
    createdAt: 1624415057380,
    firebase_key: '-McqffMYhwDf_YYr-ZBq',
    id_key: 'chapperones-5ef0b967f7b2510025926f2d',
    image: null,
    imageLocalPath: null,
    receiver_id: '5eee304fd530b10025f81328',
    sender_id: '5eee304fd530b10025f81328',
    status: 'received',
    text: 'So',
    trip_id: '5ef0b967f7b2510025926f2d',
    type: 'chapperones_broadcast',
    user: {
      _id: '5eee304fd530b10025f81328',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/chapperone-6a910.appspot.com/o/user_assets%2FeT6qC-9c4a0d00-446a-4dc4-a224-7f1f290a67ec.jpg?alt=media&token=fe8d9247-594c-4adc-964b-58276b8ff3cc',
      name: 'Helen  Adegoke',
    },
  },
  {
    _id: '773f103f-5c46-43dc-8945-9d083868d347',
    createdAt: 1624415048401,
    firebase_key: '-McqfdAGVI-SjRQpBuvs',
    id_key: 'chapperones-5ef0b967f7b2510025926f2d',
    image: null,
    imageLocalPath: null,
    receiver_id: '5eee304fd530b10025f81328',
    sender_id: '5eee304fd530b10025f81328',
    status: 'received',
    text: 'Teacvh',
    trip_id: '5ef0b967f7b2510025926f2d',
    type: 'chapperones_broadcast',
    user: {
      _id: '5eee304fd530b10025f81328',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/chapperone-6a910.appspot.com/o/user_assets%2FeT6qC-9c4a0d00-446a-4dc4-a224-7f1f290a67ec.jpg?alt=media&token=fe8d9247-594c-4adc-964b-58276b8ff3cc',
      name: 'Helen  Adegoke',
    },
  },
  {
    _id: '7adc8277-56d1-45d6-9284-20aa1087f608',
    createdAt: 1624415036266,
    firebase_key: '-McqfaCeN3L-IS9bj32V',
    id_key: 'chapperones-5ef0b967f7b2510025926f2d',
    image: null,
    imageLocalPath: null,
    receiver_id: '5eee304fd530b10025f81328',
    sender_id: '5eee304fd530b10025f81328',
    status: 'received',
    text: 'Your',
    trip_id: '5ef0b967f7b2510025926f2d',
    type: 'chapperones_broadcast',
    user: {
      _id: '5eee304fd530b10025f81328',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/chapperone-6a910.appspot.com/o/user_assets%2FeT6qC-9c4a0d00-446a-4dc4-a224-7f1f290a67ec.jpg?alt=media&token=fe8d9247-594c-4adc-964b-58276b8ff3cc',
      name: 'Helen  Adegoke',
    },
  },
  {
    _id: '7a1ed7b0-954a-47f1-b9f2-427f75ba3743',
    createdAt: 1624415030205,
    firebase_key: '-McqfZiwzVbk94Ub7KXX',
    id_key: 'chapperones-5ef0b967f7b2510025926f2d',
    image: null,
    imageLocalPath: null,
    receiver_id: '5eee304fd530b10025f81328',
    sender_id: '5eee304fd530b10025f81328',
    status: 'received',
    text: 'Me',
    trip_id: '5ef0b967f7b2510025926f2d',
    type: 'chapperones_broadcast',
    user: {
      _id: '5eee304fd530b10025f81328',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/chapperone-6a910.appspot.com/o/user_assets%2FeT6qC-9c4a0d00-446a-4dc4-a224-7f1f290a67ec.jpg?alt=media&token=fe8d9247-594c-4adc-964b-58276b8ff3cc',
      name: 'Helen  Adegoke',
    },
  },
  {
    _id: '96b0291a-1edb-4bf3-a1e6-ca1330ec5896',
    createdAt: 1624415026711,
    firebase_key: '-McqfYsKZ3B-dm6e5caq',
    id_key: 'chapperones-5ef0b967f7b2510025926f2d',
    image: null,
    imageLocalPath: null,
    receiver_id: '5eee304fd530b10025f81328',
    sender_id: '5eee304fd530b10025f81328',
    status: 'received',
    text: 'teach',
    trip_id: '5ef0b967f7b2510025926f2d',
    type: 'chapperones_broadcast',
    user: {
      _id: '5eee304fd530b10025f81328',
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/chapperone-6a910.appspot.com/o/user_assets%2FeT6qC-9c4a0d00-446a-4dc4-a224-7f1f290a67ec.jpg?alt=media&token=fe8d9247-594c-4adc-964b-58276b8ff3cc',
      name: 'Helen  Adegoke',
    },
  },
];
