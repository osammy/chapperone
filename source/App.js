import React, {useState, useEffect} from 'react';
import {
  Alert,
  Linking,
  Platform,
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware, compose} from 'redux';
import firebase from 'firebase';
import ReduxThunk from 'redux-thunk';
import messaging from '@react-native-firebase/messaging';
import {Notification} from 'react-native-in-app-message';
import {Actions} from 'react-native-router-flux';
import {
  closeChatsRealm,
  deleteAllRealm,
} from './db/controllers/ChatsController';
import {
  postToLocalNotifications,
  closeNotificationsRealm,
  migrateNotifications,
} from './db/controllers/NotificationsController';
import {getUserFromAsyncStorage} from './resources/utils';

import Routes from './Routes';
import reducers from './reducers/index';
import {config} from './resources/FirebaseSettings';
import {Button, Card} from './UI';
import {check} from 'react-native-permissions';
import {theme, keys} from './constants';
import {TouchableOpacity} from 'react-native-gesture-handler';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function App(props) {
  useEffect(() => {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      handlePermissions();
    } catch (e) {
      console.log(e);
    }
  }, []);

  const customNotification = React.useRef();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [data, setData] = useState({});

  const isIos = () => Platform.OS === 'ios';
  const allowProvisional = async () => {
    await messaging().requestPermission({
      provisional: true,
    });
  };

  const CustomComponent = localNotif => {
    return (
      <View style={[styles.container, styles.card, styles.shadow]}>
        <View style={styles.topContent}>
          <View style={{flex: 2}}>
            <Image style={styles.avatar} source={{uri: localNotif.avatar}} />
          </View>
          <View style={{flex: 8}}>
            <Text bold>{localNotif.title || 'New Message!'}</Text>
            <Text gray>{localNotif.message || 'You got a new message'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderNotification = () => {
    const IS_IOS = Platform.OS === 'ios';

    return (
      <Notification
        onPress={() => null}
        ref={customNotification}
        textColor={'#ccc'}
        autohide={true}
        // blurAmount={80}
        showKnob={false}
        customComponent={<CustomComponent {...data} />}
      />
    );
  };

  const click = () => {
    customNotification.current?.show();
  };

  async function handlePermissions() {
    try {
      const authorizationStatus = await messaging().hasPermission();
      if (
        authorizationStatus === messaging.AuthorizationStatus.NOT_DETERMINED
      ) {
        const newAuthorizationStatus = await messaging().requestPermission();
        if (
          newAuthorizationStatus !== messaging.AuthorizationStatus.AUTHORIZED
        ) {
          Alert.alert(
            'Enable Notifications',
            'To use this app to the full, you will need to enable notifications, you can do that later from settings',
            [
              {
                text: 'Settings',
                onPress: () => Linking.openSettings(),
              },
              {
                text: 'Proceed',
                onPress: () => {},
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        }
      } else if (authorizationStatus === messaging.AuthorizationStatus.DENIED) {
        Alert.alert(
          'Notifications is disabled',
          'To use this app to the full, you will need to enable notifications, you can do that later from settings',
          [
            {
              text: 'Enable',
              onPress: Linking.openSettings,
            },
            {
              text: 'Proceed',
              onPress: allowProvisional, //for ios 12+ silently allows permision in notif area
              style: 'cancel',
            },
          ],
          {cancelable: false},
        );
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <Provider
      store={createStore(
        reducers,
        // {},
        composeEnhancers(applyMiddleware(ReduxThunk)),
      )}>
      {/* <Button style={{marginTop: 50}} onPress={click}>
        <Text>clicker</Text>
      </Button> */}
      <Routes click={click} customNotification={customNotification} />
      {renderNotification()}
    </Provider>
  );
}

const styles = StyleSheet.create({
  cardTop: {
    paddingTop: 20,
    // paddingHorizontal:5
  },
  pad: {
    padding: 15,
  },
  container: {
    width: '100%',
  },
  topContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: theme.sizes.radius,
    padding: theme.sizes.base + 4,
    // marginBottom: theme.sizes.base,
  },
  shadow: {
    shadowColor: theme.colors.black,
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 13,
  },
  avatar: {
    width: theme.sizes.padding * 2,
    height: theme.sizes.padding * 2,
    borderRadius: theme.sizes.padding,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    flex: 1,
    width: '100%',
    right: 0,
    left: 0,
    marginTop: 30,
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
});
