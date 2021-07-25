const INITIAL_STATE = {};

import {
  FETCH_ALL_CHATS,
  FETCH_ONE_CHAT,
  FETCH_NEW_CHAT_LIST,
  // FETCH_UNREAD_CHAT_COUNT,
  UPDATE_CHAT_LIST,
  INCREASE_UNREAD_COUNT,
  SET_UNREAD_COUNT,
  RESET_CHATLIST_UNREAD,
  RESET_LIST_CHATS,
} from './../resources/types';

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_ONE_CHAT:
      const listKey = Object.keys(action.payload)[0];
      const cpyOstate = {...state};
      let list = cpyOstate[listKey];
      if (!list) {
        list = [action.payload[listKey]];
      } else {
        list.push(action.payload[listKey]);
        //Sort conversation list so that most recent is up
        list.sort((a, b) => b.createdAt - a.createdAt);
      }
      cpyOstate[listKey] = list;
      // return INITIAL_STATE;
      return cpyOstate;
    case FETCH_ALL_CHATS:
      const list_key = Object.keys(action.payload)[0];
      const cOs = {...state};
      cOs[list_key] = action.payload[list_key];
      return cOs;
    // case FETCH_NEW_CHAT_LIST:
    //   const cpy = {...state};
    //   const key = Object.keys(action.payload)[0];
    //   let conversation_list = cpy[key];

    //   if (conversation_list) {
    //     // conversation_list.unshift(action.payload[key]);
    //     const index = conversation_list.findIndex(
    //       el => el._id === action.payload[key]._id,
    //     );

    //     conversation_list.splice(index, 1);

    //     conversation_list.unshift(action.payload[key]);
    //     // conversation_list.sort((a, b) => b.createdAt - a.createdAt);
    //     cpy[key] = conversation_list;
    //     return {...state, ...cpy};
    //   } else {
    //     const val = action.payload[key];
    //     return {...state, key: [val]};
    //   }
    // case FETCH_UNREAD_CHAT_COUNT:
    //   const copyOfState = {...state};
    //   const dkey = Object.keys(action.payload)[0];
    //   let dlist = copyOfState[dkey];
    //   const data = action.payload[dkey];
    //   const addToCoversation = [];
    //   dlist.forEach(el => {
    //     const unread = data.find(d => {
    //       return d.contact_id === el._id;
    //     });
    //     if (unread) {
    //       el.unread_count = el.unread_count
    //         ? el.unread_count + unread.count
    //         : unread.count;
    //     } else {
    //       el.unread_count = 0;
    //     }

    //     addToCoversation.push(el);
    //   });
    //   copyOfState[dkey] = addToCoversation;
    //   return copyOfState;

    case UPDATE_CHAT_LIST:
      const dataKey = Object.keys(action.payload)[0];
      // deep copy state to force updates
      const cpyOfState = JSON.parse(JSON.stringify(state));
      const dataToUpdate = action.payload[dataKey];
      let currData = cpyOfState[dataKey];

      if (currData) {
        const dataIndex = currData.findIndex(el => el._id === dataToUpdate._id);
        if (dataIndex !== -1) {
          const currUnreadCount = currData[dataIndex].unread_count || 0;
          dataToUpdate.unread_count = currUnreadCount;
          // currData.splice(dataIndex, 1);
          // currData = [dataToUpdate, ...currData];

          currData[dataIndex] = dataToUpdate;
          currData.sort((a, b) => b.createdAt - a.createdAt);

          cpyOfState[dataKey] = currData;
        }
      }
      return cpyOfState;

    case RESET_CHATLIST_UNREAD:
      const data_key = Object.keys(action.payload)[0];
      const cpyOfDState = {...state};
      let dChatList = cpyOfDState[data_key] || [];
      const idOfDataToBeUpdated = action.payload[data_key].contactId;

      const foundIndex = dChatList.findIndex(
        el => el._id === idOfDataToBeUpdated,
      );
      if (foundIndex !== -1) {
        dChatList[foundIndex].unread_count = 0;
        cpyOfDState[data_key] = dChatList;
      }

      return cpyOfDState;

    case INCREASE_UNREAD_COUNT:
      const datakey = Object.keys(action.payload)[0];
      const cpyOState = {...state};
      let chatList = cpyOState[datakey] || [];
      const idToBeUpdated = action.payload[datakey].contactId;

      const foundIndx = chatList.findIndex(el => el._id === idToBeUpdated);

      if (foundIndx !== -1) {
        chatList[foundIndx].unread_count += action.payload[datakey].count;
        cpyOState[datakey] = chatList;
      }

      return cpyOState;
    case SET_UNREAD_COUNT:
      const listkey = Object.keys(action.payload)[0];
      const shallowCopy = {...state};
      let chatlist = shallowCopy[listkey] || [];
      const contactId = action.payload[listkey].contactId;

      const fndIndx = chatlist.findIndex(el => el._id === contactId);

      if (fndIndx !== -1) {
        chatlist[fndIndx].unread_count = action.payload[listkey].count;
        shallowCopy[listkey] = chatlist;
      }

      return shallowCopy;

    case RESET_LIST_CHATS:
      return INITIAL_STATE;

    default:
      return state;
  }
};
