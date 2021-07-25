/* eslint-disable curly */
const INITIAL_STATE = {
  contacts: [],
  failedToLoadContacts: false,
  highlight_mode: false,
  loadingContacts: false,
  loadingAddContacts: false,
  failedToAddContacts: false,
  // Participants
  participants: [],
  failedToLoadParticipants: false,
  loadingParticipants: false,
  participant_highlight_mode: false,
};

import {
  CONTACTS_LIST,
  LOADING_CONTACTS,
  FAILED_LOAD_CONTACTS,
  CONTACT_IS_SELECTED,
  UNSELECT_ALL_CONTACTS,
  ADD_CONTACTS_TO_TRIP,
  //participants
  PARTICIPANTS_LIST,
  LOADING_PARTICIPANTS,
  FAILED_LOAD_PARTICIPANTS,
  PARTICIPANT_IS_SELECTED,
  UNSELECT_ALL_PARTICIPANTS,
  RESET_CONTACTS,
  UPDATE_PARTICIPANT_PERMISSIONS,
  LOADING_ADD_CONTACTS_TO_TRIP,
  FAILED_TO_ADD_CONTACT_TO_TRIP,
} from './../resources/types';

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CONTACTS_LIST:
      return {...state, contacts: action.payload};
    case FAILED_LOAD_CONTACTS:
      return {...state, failedToLoadContacts: action.payload};
    case LOADING_ADD_CONTACTS_TO_TRIP:
      return {...state, loadingAddContacts: action.payload};
    case FAILED_TO_ADD_CONTACT_TO_TRIP:
      return {...state, failedToAddContacts: action.payload};
    case CONTACT_IS_SELECTED:
      const index = action.payload;
      const cpy = [...state.contacts];
      cpy[index].isSelect = !cpy[index].isSelect;
      //Also modify highlight mode if atleast one is highlighted
      const found = cpy.filter(el => el.isSelect === true);
      let update = {};
      if (found.length > 0) {
        update = state.highlight_mode
          ? {contacts: cpy}
          : {highlight_mode: true, contacts: cpy};
      } else {
        update = {highlight_mode: false, contacts: cpy};
      }
      return {...state, ...update};
    case UNSELECT_ALL_CONTACTS:
      const contacts = state.contacts.map(el => ({...el, isSelect: false}));
      return {...state, contacts: contacts, highlight_mode: false};
    case ADD_CONTACTS_TO_TRIP:
      // const userIds = action.payload;
      // const newContacts = state.contacts.filter(
      //   el => !userIds.includes(el._id),
      // );
      const addedParticipants = action.payload;
      const userIds = addedParticipants.map(
        participant => participant.user_id._id,
      );
      const newContacts = state.contacts.filter(
        el => !userIds.includes(el._id),
      );
      const allParticipants = [...state.participants, ...addedParticipants];

      return {...state, contacts: newContacts, participants: allParticipants};
    case LOADING_CONTACTS:
      return {...state, loadingContacts: action.payload};
    //PARTICIPANTS
    case PARTICIPANTS_LIST:
      return {...state, participants: action.payload};
    case FAILED_LOAD_PARTICIPANTS:
      return {...state, failedToLoadParticipants: action.payload};
    case LOADING_PARTICIPANTS:
      return {...state, loadingParticipants: action.payload};
    case UNSELECT_ALL_PARTICIPANTS:
      const participants = state.participants.map(el => ({
        ...el,
        isSelect: false,
      }));
      return {
        ...state,
        participants: participants,
        participant_highlight_mode: false,
      };
    case PARTICIPANT_IS_SELECTED:
      const i = action.payload;
      const copy = [...state.participants];
      copy[index].isSelect = !copy[i].isSelect;
      //Also modify highlight mode if atleast one is highlighted
      const isFound = copy.filter(el => el.isSelect === true);
      let newData = {};
      if (isFound.length > 0) {
        newData = state.participant_highlight_mode
          ? {contacts: cpy}
          : {participant_highlight_mode: true, participants: copy};
      } else {
        newData = {participant_highlight_mode: false, participant: copy};
      }
      return {...state, ...newData};
    case RESET_CONTACTS:
      return INITIAL_STATE;
    case UPDATE_PARTICIPANT_PERMISSIONS:
      const {_id, permissions, sub_permissions} = action.payload;
      const cOp = [...state.participants];
      const participantIndex = cOp.findIndex(
        participant => participant._id === _id,
      );
      if (participantIndex === -1) return state;
      const newParticipants = {
        ...cOp[participantIndex],
        permissions,
        sub_permissions,
      };
      cOp[participantIndex] = newParticipants;
      return {...state, participants: cOp};
    default:
      return state;
  }
};
