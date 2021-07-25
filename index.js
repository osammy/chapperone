/**
 * @format
 */

import {AppRegistry} from 'react-native';
// configure for local notifications
import PushNotification from 'react-native-push-notification';
// import App from './App';
import App from './source/App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import {onMessage} from './source/handlers/pushNotifications';
import emitter from './source/globals/events';
import database from '@react-native-firebase/database';

// resources/controllers/data/index
// Register background handler
// save chats when they come (CURRENTLY ONLY SAVE BROADCASTS)
messaging().setBackgroundMessageHandler(onMessage);

database().setPersistenceEnabled(false);

// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function(token) {
    console.log('TOKEN:', token);
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: async function(notification) {
    try {
      // console.log('NOTIFICATION:', notification);
      const {userInteraction, foreground} = notification;
      const payload = notification;
      const data = payload.data;
      const {contactId, tripId, page_to_open} = data;

      if (!userInteraction && foreground) {
        emitter.emit('NOTIFY_CHAT_TO_CLEAR', {contactId, tripId});
      }

      if (userInteraction && foreground) {
        emitter.emit('notification_clicked', {contactId, tripId});
      }
      // process the notification
      // (required) Called when a remote is received or opened, or local notification is opened
      //notification.finish(PushNotificationIOS.FetchResult.NoData);
    } catch (e) {
      console.log(e);
    }
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction: function(notification) {
    // console.log('ACTION:', notification.action);
    // console.log('NOTIFICATION PRESSED I GUESS:', notification);
    // process the action
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: function(err) {
    //console.error(err.message, err);
    console.log(err.message, err);
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: true,
});
//

AppRegistry.registerComponent(appName, () => App);

//enable persistence on frebase with this
// val database = FirebaseDatabase.getInstance()
// database.setPersistenceEnabled(true)
