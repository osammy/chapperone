import {Linking, Platform} from 'react-native';
import * as RNFS from 'react-native-fs';
import firebase from 'firebase';

import {postWithAuth} from '../resources/controllers/data';
import {getUrl} from '../resources/controllers/url';
import {uploadFileToFirebase, generateRandomStrings} from '../resources/utils';
import {validateImages} from '../resources/utils/imageUploader';

export const getDataFromParticipants = participants => {
  const data = [];

  participants.forEach(eachParticipant => {
    const name = `${eachParticipant?.user_id?.first_name} ${
      eachParticipant?.user_id?.last_name
    }`;
    data.push({
      _id: eachParticipant?._id,
      name,
      avatar: eachParticipant?.user_id?.avatar,
      reader_id: eachParticipant?.user_id?._id,
    });
  });

  return data;
};

export const onPressPhoneNumber = async phoneNum => {
  try {
    let phoneNumberToCall = '';

    if (Platform.OS === 'android') {
      phoneNumberToCall = `tel:${phoneNum}`;
    } else {
      phoneNumberToCall = `telprompt:${phoneNum}`;
    }

    const supported = await Linking.canOpenURL(phoneNumberToCall);
    if (!supported) {
      return;
    }

    Linking.openURL(phoneNumberToCall);
  } catch (e) {
    console.log(e);
  }
};

export const saveToDisk = async url => {
  const fileName = generateRandomStrings(16) + '.jpg';
  const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  const options = {
    fromUrl: url, // URL to download file from
    toFile: path, // Local filesystem path to save the file to
    background: true, // Continue the download in the background after the app terminates (iOS only)
    discretionary: true, // Allow the OS to control the timing and speed of the download to improve perceived performance  (iOS only)
    cacheable: true, // Whether the download can be stored in the shared NSURLCache (iOS only, defaults to true)
    // progressInterval?: number;
    // progressDivider?: number;
    // begin?: (res: DownloadBeginCallbackResult) => void;
    // progress?: (res: DownloadProgressCallbackResult) => void;
    // resumable?: () => void;    // only supported on iOS yet
    // connectionTimeout?: number // only supported on Android yet
    // readTimeout?: number       // supported on Android and iOS
    // backgroundTimeout?: number // Maximum time (in milliseconds) to download an entire resource (iOS only, useful for timing out background downloads)
  };

  const t = await RNFS.downloadFile(options);
  const res = await t.promise;
  if (res.statusCode === 200) {
    return path;
  }
};

export const sendPushNotification = (message, tripId, msgKey) => {
  if (Array.isArray(message)) {
    message = message[0];
  }
  const {_id: messageId, text, user: currUser, createdAt} = message;
  // Made the data payload as consistent as possible with the localchats schema so it can be stored on reception
  const date_created = `${+createdAt}`; // convert to string because Firebase Cloud Messaging only accepts strings.
  const data = {
    page_to_open: 'trip_broadcast',
    _id: messageId,
    tripId,
    firebase_key: this.msgKey,
    text,
    user: JSON.stringify(currUser),
    createdAt: date_created,
  };
  // const maxNotifBody = 30;
  const notifBody = text;
  // text.length > maxNotifBody ? `${text.substring(1, maxNotifBody)}...` : text;

  const title = `New broadcast from ${currUser.name}`;

  const notification = {
    title,
    body: notifBody,
    // badge: "1",
    // imageUrl,
  };

  const body = {
    notification,
    data,
  };

  const baseUrl = getUrl('users');
  const url = `${baseUrl}/trip/${tripId}/broadcast/notifications`;

  return postWithAuth(url, body);
};

export const getFirebaseRef = url => {
  return firebase.database().ref(url);
};

export const checkIfUserAlreadyRead = (userId, tripId, messageId) => {
  return new Promise((resolve, reject) => {
    const users_read_broadcast_node = `/users_read_broadcast/${tripId}/${messageId}`;
    const ref = firebase.database().ref(users_read_broadcast_node);
    ref
      .orderByChild('reader_id')
      .equalTo(userId)
      .once('value', snapShot => {
        if (!snapShot.exists()) resolve(false);

        resolve(true);
      })
      .catch(reject);
  });
};

export const updateReadReceipts = (tripId, user, messages) => {
  const updates = {};
  const {_id: reader_id, avatar, first_name, last_name} = user;
  const name = `${first_name} ${last_name}`;

  let msgLength = messages.length;
  let count = 0;

  messages.forEach(async message => {
    count += 1;
    const messageId = message._id;
    const users_read_broadcast_node = `/users_read_broadcast/${tripId}/${messageId}`;
    const ref = firebase.database().ref(users_read_broadcast_node);

    const found = await checkIfUserAlreadyRead(reader_id, tripId, messageId);
    // Check if curr user made the broadcast do not update if so
    //   const iSentBroadcast = message.user._id === user._id;

    const shouldBeUpdated = !found;

    if (shouldBeUpdated) {
      const read_receipt_key = ref.push().key;

      const payload = {
        name,
        reader_id,
        messageId,
        avatar,
        read_at: +new Date(),
      };

      updates[`${users_read_broadcast_node}/${read_receipt_key}`] = payload;
    }
    if (count === msgLength) {
      return firebase
        .database()
        .ref()
        .update(updates);
    }
  });
};

export const handleImageUpload = async imageObj => {
  const validOptions = {
    max_size_per_image: 10, //
    max_no_of_images: 1,
    total_images_size: 10,
  };

  const result = validateImages(imageObj, validOptions);
  if (result.error) {
    throw new Error(result.message);
  }

  const refNode = `/user_assets/${imageObj.filename}`;

  const imageUrl = await uploadFileToFirebase(imageObj, refNode);

  return imageUrl;
};

export const getInputProp = (userPermissions, userSubPermissions) => {
  // const {userPermissions, userSubPermissions} = this.props;
  let editable = false;
  let textInputPlaceholder = 'You need permission to send a message here';

  if (userPermissions.includes('leader')) {
    editable = true;
    textInputPlaceholder = 'Broadcast a message...';
  } else if (userPermissions.includes('chapperone')) {
    if (userSubPermissions.includes('broadcast_messages')) {
      editable = true;
      textInputPlaceholder = 'Broadcast a message...';
    }
  }

  return {
    textInputProps: {editable},
    textInputPlaceholder,
  };
};
