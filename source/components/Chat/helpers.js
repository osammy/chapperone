import {getUrl} from '../../resources/controllers/url';
import {postWithAuth} from '../../resources/controllers/data';

export const sendPushNotification = (message, tripId, contact) => {
  if (Array.isArray(message)) {
    message = message[0];
  }
  const contactId = contact._id;
  const {_id: messageId, text, user: currUser, createdAt} = message;
  const cOU = {...currUser};
  const name = cOU.name;
  const baseUrl = getUrl('users');
  const url = `${baseUrl}/${contactId}/notifications`;
  // Set Name and Avatar to current user
  currUser.avatar = this.props.user.avatar;
  currUser.name = this.props.user.username;
  const date_created = `${+createdAt}`; // convert to string because Firebase Cloud Messaging only accepts strings.
  const data = {
    page_to_open: 'trip',
    _id: messageId,
    tripId,
    contactId,
    firebase_key: this.msgInContactNodeKey,
    text,
    type: 'receive',
    user: JSON.stringify(currUser),
    createdAt: date_created,
    status: 'delivered',
  };
  const maxNotifBody = 30;
  const notifBody =
    text.length > maxNotifBody ? `${text.substring(1, maxNotifBody)}...` : text;

  const notification = {
    // title: contactName,
    title: name,
    body: notifBody,
    // badge: "1",
    // imageUrl,
  };

  const body = {
    // tokens,
    notification,
    data,
  };

  return postWithAuth(url, body);
};

export const getInputProp = (contactDetail, role) => {
  let editable = false;
  let textInputPlaceholder = 'Type a message...';

  if (role === 'teacher') {
    editable = true;
  } else {
    if (contactDetail.role === 'teacher') {
      editable = true;
    } else {
      textInputPlaceholder = 'You can only message Chapperones';
    }
  }

  return {
    textInputProps: {editable},
    textInputPlaceholder,
  };
};

// export const isMessageInState = (messageId, messagesDict) => {
//   return !!messagesDict[messageId];
// };

// export const getUniqueState = (messageId, messagesDict, messagesArr) => {
//   const uniqueMsgs = [];
//   messagesArr.forEach(eachMessage => {
//     if (!this.messagesDict[messageId]) {
//       this.messagesDict[messageId] = true;
//       uniqueMsgs.push(eachMessage);
//     }
//   });

//   return uniqueMsgs;
// }
