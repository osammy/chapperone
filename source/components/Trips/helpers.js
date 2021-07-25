import {Platform} from 'react-native';
import firebase from 'firebase';
import Share from 'react-native-share';

import {capitalize} from '../../resources/utils';

export const sendBroadcastInTrip = (messages, tripId) => {
  if (!Array.isArray(messages)) {
    messages = [messages];
  }

  const {text, createdAt, user, _id: messageId} = messages[0];
  const broadcastNode = `/broadcasts/${tripId}`;
  const broadcastConvoNode = `/broadcasts_conversation/${tripId}`;

  const msgKey = firebase
    .database()
    .ref(broadcastNode)
    .push().key;

  const payload = {
    _id: messageId,
    firebase_key: msgKey,
    text: text,
    type: 'broadcast',
    user,
    createdAt: +createdAt,
    status: 'delivered', // e.g delivered, received
  };

  const lastBroadcastConversationMsg = {
    sender_id: user._id,
    msgId: messageId,
    name: capitalize(user.name),
    createdAt: +createdAt,
    message: text,
  };

  const updates = {};
  updates[`${broadcastNode}/${msgKey}`] = payload;
  updates[`${broadcastConvoNode}`] = lastBroadcastConversationMsg;

  return firebase
    .database()
    .ref()
    .update(updates);
};

export const handleShare = trip => {
  // const url =
  // 'https://play.google.com/store/apps/details?id=com.gochapperone.Chapperone&hl=en';
  const url = 'https://www.gochapperone.com';
  const title = 'Join Trip';
  const subject = 'Joining a new trip on Chapperone';
  // const message = `Join my trip, enter trip code ${
  //   this.props.trip.join_code
  // } to join.`;
  const message = `Use this code ${
    trip?.join_code
  } in the app to join the trip, ${
    trip?.name
  }.If you haven't already downloaded the app, click on the links below to get the app for free\n
  iPhone: https://apps.apple.com/ng/app/chapperone/id1370892664\n
  Android: https://play.google.com/store/apps/details?id=com.gochapperone.Chapperone&hl=en\n
  For more information about the app, visit www.gochapperone.com
  Happy field tripping!`;
  const icon = ''; //base64 encoded string
  const options = Platform.select({
    ios: {
      activityItemSources: [
        {
          // For sharing url with custom title.
          placeholderItem: {type: 'url', content: url},
          item: {
            default: {type: 'url', content: url},
          },
          subject: {
            default: subject,
            email: 'ali@gochapperone.com',
          },
          linkMetadata: {originalUrl: url, url, title},
        },
        {
          // For sharing text.
          placeholderItem: {type: 'text', content: message},
          item: {
            default: {
              type: 'text',
              content: message,
              email: 'ali@gochapperone.com',
            },
            message: null, // Specify no text to share via Messages app.
          },
          linkMetadata: {
            // For showing app icon on share preview.
            title: message,
          },
        },
        {
          // For using custom icon instead of default text icon at share preview when sharing with message.
          placeholderItem: {
            type: 'url',
            content: icon,
          },
          item: {
            default: {
              type: 'text',
              content: '',
              subject: subject,
              email: 'ali@gochapperone.com',
            },
          },
          linkMetadata: {
            title: message,
            icon: icon,
          },
        },
      ],
    },
    default: {
      title,
      email: 'ali@gochapperone.com',
      subject,
      message,
    },
  });

  Share.open(options)
    .then(r => {
      console.log(r);
    })
    .catch(err => {
      console.log(err);
    });
};
