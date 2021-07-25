/* eslint-disable curly */
import {Platform} from 'react-native';
import pushNotifications from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import {postWithAuth} from '../resources/controllers/data';
import {postToLocalNotifications} from '../db/controllers/NotificationsController';
import {getUserFromAsyncStorage} from '../resources/utils';
import {getUrl} from '../resources/controllers/url';
import {getUniqueId} from 'react-native-device-info';
import emitter from '../globals/events';

function saveUserDevice(user, deviceId, fcmToken) {
  return new Promise((resolve, reject) => {
    const devices = {
      user,
      deviceId,
      fcmToken,
      active: true,
    };
    const url = getUrl('devices');

    postWithAuth(url, devices)
      .then(resp => {
        const {data: device} = resp;
        resolve(device.data);
      })
      .catch(reject);
  });
}

function getBadgeCount() {
  return new Promise((resolve, reject) => {
    pushNotifications.getApplicationIconBadgeNumber(num => {
      resolve(num);
    });
  });
}
export const onMessage = async remoteMessage => {
  try {
    if (Platform.OS === 'ios') {
      const currCount = await getBadgeCount();
      pushNotifications.setApplicationIconBadgeNumber(currCount + 1);
      // const newCount = await getBadgeCount();
      // console.log('new Count ' + newCount);
    }
    // setTimeout(() => {
    //   console.log('called emiiter of event');
    //   emitter.emit('notif');
    // }, 2000);
    const payload = remoteMessage.data;
    let notification = remoteMessage.data.notification;
    const {page_to_open} = payload;
    const {tripId: trip_id, _id} = payload;
    let type, user, createdAt, sender_id, receiver_id;

    // Set New notification dot on message icon
    const notifDetails = {};
    notifDetails[trip_id] = true;
    switch (page_to_open) {
      case 'trip_broadcast':
        type = page_to_open;
        user = JSON.parse(payload.user);
        createdAt = Number(payload.createdAt); // convert fron string to number
        const {_id: currUserId} = await getUserFromAsyncStorage();
        // Add to notifications
        sender_id = user._id;
        receiver_id = payload.receiver_id ? payload.receiver_id : currUserId;
        const linkId = trip_id ? trip_id : '';

        const read = sender_id === currUserId ? true : false;
        if (typeof notification === 'string') {
          notification = JSON.parse(notification);
        }
        if (!notification) {
          try {
            notification = {
              title: `Broadcast from ${user.name}`,
              body: payload.text,
            };
          } catch (e) {
            notification = {
              title: 'New Broadcast Message from',
              body: 'Message body not available',
            };
          }
        }

        await postToLocalNotifications({
          _id,
          type,
          title: notification.title,
          sender_id,
          receiver_id,
          read,
          text: notification.body,
          linkTo: `/trip/${linkId}`,
          linkId,
          createdAt,
        });
        break;
      case 'trip':
        // this.props.changeTripsUnreadNotification(notifDetails);
        break;
    }
  } catch (e) {
    console.log(e);
    // Fail silently
  }
};

export const onTokenRefresh = async fcmToken => {
  try {
    // Process your token as required
    const {_id: userId} = getUserFromAsyncStorage();
    const deviceId = await getUniqueId();
    const updateToken = fcmToken && userId && deviceId;

    if (updateToken) saveUserDevice(userId, deviceId, fcmToken);
  } catch (e) {}
};
