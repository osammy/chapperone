/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  View,
  AsyncStorage,
  StyleSheet,
  ActivityIndicator,
  Platform,
  AppState,
} from 'react-native';
import {Router, Scene, Actions} from 'react-native-router-flux';
import messaging from '@react-native-firebase/messaging';
import {connect} from 'react-redux';
import PushNotification from 'react-native-push-notification';

import {theme, keys} from './constants';
import {addTrip} from './actions/TripActions';
import {Loading, Text, Button} from './UI';

import More from './components/MoreMenu';
import MainScreen from './components/MainScreen';
import WelcomeScreen from './components/WelcomeScreen';
import AddContactScreen from './components/AddContactScreen';
import Chat from './components/Chat/Chat';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Forgot from './components/Forgot';
import Settings from './components/Settings';
import Trip from './components/Trips/Trip';
import SignUp from './components/SignUp';

import CreateTrip from './components/CreateTrip/CreateTrip';
import Trips from './components/Trips/Trips';

import SearchContacts from './components/SearchContacts';
import BroadcastChats from './components/Broadcasts/BroadcastChats';
import BroadcastSeenList from './components/Broadcasts/BroadcastSeenList';
import ChapperoneSeenList from './components/ChapperonesChat/ChapperoneSeenList';
import Notifications from './components/Notifications';
import Terms from './components/Terms';
import PasswordReset from './components/PasswordReset';
import EditTrip from './components/EditTrip';
import SetNewPassword from './components/SetNewPassword';
import CreateOrganisation from './components/CreateOrganisation';
import Submissions from './components/Submissions';
import ChapperoneGroupChat from './components/ChapperonesChat/ChapperoneGroupChat';
//Handler
import {onTokenRefresh, onMessage} from './handlers/pushNotifications';
import {handleError, getUserFromAsyncStorage} from './resources/utils';
import {getUrl} from './resources/controllers/url';
import {getWithAuth} from './resources/controllers/data';
import {postToLocalNotifications} from './db/controllers/NotificationsController';
import {
  changeTripsBroadcastUnreadNotification,
  changeTripsUnreadNotification,
  changeTripBroadcastUnreadNotification,
} from './actions/AppActions';
import emitter from './globals/events';

class Routes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logged: false,
      loading: true,
      loadingNotificationClickRoute: false,
      isVisible: false,
    };

    this.appState = AppState.currentState;
  }

  // getCount = () => {
  //   this.count = 0;
  // };
  // incrementCount = () => {
  //   this.count += 1;
  // };

  _handleAppStateChange = async nextAppState => {
    // alert(this.appState);
    if (
      this.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      const badgeCount = await this.getBadgeCount();
      if (badgeCount !== 0) {
        PushNotification.setApplicationIconBadgeNumber(0);
      }
    }
    this.appState = nextAppState;
  };

  handleCustomEvent = data => {
    if (Actions.currentScene === 'MainScreen') {
      emitter.emit('CURRENT_ROUTE_MAINSCREEN', data);
    } else if (Actions.currentScene === 'chat') {
      emitter.emit('CURRENT_ROUTE_CHAT', data);
    } else {
      this.handleTrip(data);
    }
  };
  // handleTripClick = item => {
  //   this.props.addTrip(item);
  //   Actions.MainScreen();
  // };

  componentWillUnmount() {
    // Remove event emmitter
    emitter.removeListener('notification_clicked', this.handleCustomEvent);
    // Remove AppState Listener
    AppState.removeEventListener('change', this._handleAppStateChange);

    // Remove token refresh listener
    if (this.onTokenRefreshListener) {
      this.onTokenRefreshListener();
    }
    // PushNotificationIOS.removeEventListener(
    //   'notification',
    //   this.onRemoteNotification,
    // );
  }

  async componentDidMount() {
    emitter.on('notification_clicked', this.handleCustomEvent);
    // let currentRoute = Actions.currentRouter.currentRoute;
    // console.log(currentRoute);
    PushNotification.setApplicationIconBadgeNumber(0);

    if (Platform.OS === 'ios') {
      //Set platform badge to zero
      AppState.addEventListener('change', this._handleAppStateChange);
      // await PushNotificationIOS.setApplicationIconBadgeNumber(0);
    }
    // PushNotificationIOS.addEventListener(
    //   'notification',
    //   this.onRemoteNotification,
    // );
    const token = await AsyncStorage.getItem(keys.TOKEN_KEY);
    if (token != null) {
      this.setState({logged: true, loading: false});
    } else {
      this.setState({loading: false});
    }

    // // register a 'OnMessage handler for push notifications

    messaging().onMessage(async remoteMessage => {
      try {
        const payload = remoteMessage.data;
        // Set foreground local notification
        await this.sendLocalNotification(remoteMessage);

        //End
        let notification = remoteMessage.data.notification;
        const {page_to_open} = payload;
        const {tripId: trip_id, _id} = payload;
        let type, user, createdAt, sender_id, receiver_id;

        // Set New notification dot on message icon
        const notifDetails = {};
        notifDetails[trip_id] = true;
        switch (page_to_open) {
          case 'trip_broadcast':
            //THIS CHANGES THE NOTIF PER BROADCAST TRIP
            this.props.changeTripBroadcastUnreadNotification(notifDetails);
            // THIS CONTROLES THE BELL ICON IN THE TRIPS PAGE
            this.props.changeTripsBroadcastUnreadNotification(true);

            type = page_to_open;
            user = JSON.parse(payload.user);
            createdAt = Number(payload.createdAt); // convert fron string to number
            const {_id: currUserId} = await getUserFromAsyncStorage();
            // Add to notifications
            sender_id = user._id;
            receiver_id = payload.receiver_id
              ? payload.receiver_id
              : currUserId;
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

            const p = await postToLocalNotifications({
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
            this.props.changeTripsUnreadNotification(notifDetails);
            break;
        }
      } catch (e) {
        console.log(e);
        // Fail silently
      }
    });
    // // register a 'onTokenRefresh handler for push notifications
    this.onTokenRefreshListener = messaging().onTokenRefresh(onTokenRefresh);
    // // // Register handlers for when app is opened from notifications
    this.createNotificationOpenListeners();
  }

  getBadgeCount() {
    return new Promise((resolve, reject) => {
      PushNotification.getApplicationIconBadgeNumber(num => {
        resolve(num);
      });
    });
  }

  async sendLocalNotification(remoteMessage) {
    const {notification} = remoteMessage;
    const payload = remoteMessage.data;

    if (payload?._id) {
      const {_id, text, page_to_open, user, tripId, contactId} = payload;
      const loggedInUser = await getUserFromAsyncStorage();
      const sender = JSON.parse(user);
      if (loggedInUser?._id === sender?._id) {
        // Dont sent to the sender
        return;
      }

      let subText = '';
      if (page_to_open === 'trip') {
        subText = 'In Trip';
      } else if (page_to_open === 'trip_broadcast') {
        subText = 'Broadcast';
      } else if (page_to_open === 'chapperone_broadcast') {
        subText = 'Chapperones Group';
      }

      const options = {
        /* Android Only Properties */
        // channelId: soundName ? 'sound-channel-id' : 'default-channel-id',
        ticker: 'My Notification Ticker', // (optional)
        autoCancel: true, // (optional) default: true
        largeIcon: 'ic_launcher', // (optional) default: "ic_launcher"
        smallIcon: 'ic_launcher', // (optional) default: "ic_notification" with fallback for "ic_launcher"
        bigText: text, // (optional) default: "message" prop
        subText: subText, // (optional) default: none
        vibrate: false, // (optional) default: true
        // vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        tag: 'some_tag', // (optional) add tag to message
        group: 'group', // (optional) add group to message
        groupSummary: false, // (optional) set this notification to be the group summary for a group of notifications, default: false
        ongoing: false, // (optional) set whether this is an "ongoing" notification
        // actions: ['Yes', 'No'], // (Android only) See the doc for notification actions to know more
        invokeApp: true, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

        when: null, // (optionnal) Add a timestamp pertaining to the notification (usually the time the event occurred). For apps targeting Build.VERSION_CODES.N and above, this time is not shown anymore by default and must be opted into by using `showWhen`, default: null.
        usesChronometer: false, // (optional) Show the `when` field as a stopwatch. Instead of presenting `when` as a timestamp, the notification will show an automatically updating display of the minutes and seconds since when. Useful when showing an elapsed time (like an ongoing phone call), default: false.
        timeoutAfter: null, // (optional) Specifies a duration in milliseconds after which this notification should be canceled, if it is not already canceled, default: null

        /* iOS only properties */
        category: '', // (optional) default: empty string

        /* iOS and Android properties */
        id: this.lastId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
        title: notification?.title || sender?.name || 'New Message', // (optional)
        message: text, // (required)
        userInfo: {tripId, page_to_open, contactId}, // (optional) default: {} (using null throws a JSON value '<null>' error)
        playSound: false, // (optional) default: true
        soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        number: 10, // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
      };

      try {
        await PushNotification.localNotification(options);
      } catch (e) {
        console.log('falield to send');
        console.log(e);
        throw e;
      }
    }
  }

  // onRemoteNotification = notification => {
  //   const actionIdentifier = notification.getActionIdentifier();
  //   if (actionIdentifier === 'open') {
  //     // Perform action based on open action
  //     alert('notif open');
  //   }
  //   if (actionIdentifier === 'text') {
  //     // Text that of user input.
  //     const userText = notification.getUserText();
  //     // Perform action based on textinput action
  //   }
  // };

  handleTrip = async payload => {
    try {
      this.setState({loadingNotificationClickRoute: true});
      const {tripId} = payload;
      const url = `${getUrl('trips')}/${tripId}`;
      const {data: tripData} = await getWithAuth(url);
      this.setState({loadingNotificationClickRoute: false});
      //Add trip to redux store
      this.props.addTrip(tripData.data);
      Actions.MainScreen({route: 1});
    } catch (e) {
      this.setState({loadingNotificationClickRoute: false});
    }
  };

  createNotificationOpenListeners = () => {
    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log('in on notifOpen', JSON.stringify(remoteMessage));

      try {
        if (!remoteMessage) {
          return;
        }
        console.log('Notification caused app to open from background state:');
        // navigation.navigate(remoteMessage.data.type);
        const payload = remoteMessage.data;
        if (!payload) {
          return;
        }
        const {page_to_open} = payload;
        switch (page_to_open) {
          case 'trip':
            this.handleTrip(payload);
            break;

          case 'trip_broadcast':
            this.handleTrip(payload);
            break;
        }
      } catch (e) {
        this.setState({loadingNotificationClickRoute: false});
        handleError(e);
      }
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        console.log('in on get', JSON.stringify(remoteMessage));

        try {
          if (!remoteMessage) {
            return;
          }

          // navigation.navigate(remoteMessage.data.type);
          const payload = remoteMessage.data;
          if (!payload) {
            return;
          }
          const {page_to_open} = payload;
          switch (page_to_open) {
            case 'trip':
              this.handleTrip(payload);
              break;

            case 'trip_broadcast':
              this.handleTrip(payload);
              break;
          }
        } catch (e) {
          this.setState({loadingNotificationClickRoute: false});
          handleError(e);
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  renderAcessRoutes() {
    return <ActivityIndicator size={50} color={theme.colors.primary} />;
  }

  click() {
    console.log('hey');
  }

  render() {
    const {loading, loadingNotificationClickRoute} = this.state;
    if (loading) {
      return (
        <View style={[styles.container, styles.horizontal]}>
          {this.renderAcessRoutes()}
        </View>
      );
    }

    if (loadingNotificationClickRoute) {
      return (
        <Loading
          show={loadingNotificationClickRoute}
          loadingText="Loading Trip..."
        />
      );
    }

    return (
      <View style={{flex: 1}}>
        <Router
          navigationBarStyle={{backgroundColor: theme.colors.primary}}
          navBarButtonColor="#fff"
          renderRightButton={More}
          titleStyle={{color: 'white'}}>
          <Scene key="app">
            <Scene
              key="WelcomeScreen"
              component={Welcome}
              title="Welcome"
              hideNavBar={true}
              initial={!this.state.logged}
            />
            <Scene
              key="TripScreen"
              component={Trip}
              title="Trip"
              hideNavBar={true}
            />
            <Scene
              key="BroadcastMessages"
              component={BroadcastChats}
              title="Broadcast Messages"
              hideNavBar={true}
            />
            <Scene
              key="passwordReset"
              component={PasswordReset}
              title="Reset Password"
              hideNavBar={true}
            />
            <Scene
              key="SignupScreen"
              component={SignUp}
              title="SignUp"
              hideNavBar={true}
            />
            <Scene
              key="CreateTrip"
              title="Create Trip"
              component={CreateTrip}
              hideNavBar={true}
            />
            <Scene
              key="MainScreen"
              component={MainScreen}
              title="Main"
              hideNavBar={true}
            />
            <Scene
              key="TripsScreen"
              component={Trips}
              title="My Trips"
              hideNavBar={true}
              initial={this.state.logged}
            />
            <Scene
              key="BroadcastList"
              component={BroadcastSeenList}
              title="Broadcasts Read Receipts"
              hideNavBar={true}
            />
            <Scene
              key="ChapperoneReadList"
              component={ChapperoneSeenList}
              title="Chapperone Read Receipts"
              hideNavBar={true}
            />
            <Scene
              key="ChapperoneGroupChat"
              component={ChapperoneGroupChat}
              title="Chapperone Group Chats"
              hideNavBar={true}
            />
            <Scene
              key="SetNewPassword"
              component={SetNewPassword}
              title="Create New Password"
              hideNavBar={true}
            />
            <Scene
              key="Notifications"
              component={Notifications}
              title="Notifications"
              hideNavBar={true}
            />
            <Scene
              key="LoginScreen"
              component={Login}
              title="Login"
              initial={this.state.isInitial}
              hideNavBar={true}
            />
            <Scene
              key="EditTrip"
              component={EditTrip}
              title="Edit Trip"
              hideNavBar={true}
            />
            <Scene
              key="SettingsScreen"
              component={Settings}
              title="Settings"
              hideNavBar={true}
            />

            <Scene
              key="forgotScreen"
              component={Forgot}
              title="Forgot"
              hideNavBar={true}
            />
            <Scene
              key="welcomeScreen"
              component={WelcomeScreen}
              title="WelcomeScreen"
            />
            <Scene
              key="addContactScreen"
              component={AddContactScreen}
              title="Add Contact"
            />
            <Scene key="chat" component={Chat} title="Chat" hideNavBar={true} />
            <Scene
              key="SearchContacts"
              component={SearchContacts}
              title="Add contact"
              hideNavBar={true}
            />
            <Scene
              key="Terms"
              component={Terms}
              title="Add Terms"
              hideNavBar={true}
            />
            <Scene
              key="createOrganisation"
              component={CreateOrganisation}
              title="Create Organisation"
              hideNavBar={true}
            />
            <Scene
              key="submissions"
              component={Submissions}
              title="Submissions"
              hideNavBar={true}
            />
          </Scene>
        </Router>
      </View>
    );
  }
}

// const mapStateToProps = state => {
//   return {
//     trip: state.TripReducer.trip,
//   };
// };

export default connect(
  null,
  {
    addTrip,
    changeTripsBroadcastUnreadNotification,
    changeTripsUnreadNotification,
    changeTripBroadcastUnreadNotification,
  },
)(Routes);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  popoverItem: {
    backgroundColor: 'transparent',
    color: 'black',
  },
  app: {
    // ...StyleSheet.absoluteFillObject,
    // alignItems: 'center',
    // justifyContent: 'center',
    // backgroundColor: '#c2ffd2',
  },
  content: {
    paddingVertical: 12,
    paddingLeft: 15,
    paddingRight: 36,
    // backgroundColor: 'pink',
    borderRadius: 3,
  },
  arrow: {
    borderTopColor: 'pink',
    height: 0,
    opacity: 0,
  },
  background: {
    // backgroundColor: 'rgba(0, 0, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  popoverItemText: {
    // fontSize: 16,
    marginVertical: 10,
  },
  shadow: {
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginHorizontal: theme.sizes.margin / 4,
    marginVertical: theme.sizes.margin / 6,
    height: 450,
  },
  //
  customView: {
    backgroundColor: 'red',
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  customViewAndroid: {
    backgroundColor: 'red',
    width: '102%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
