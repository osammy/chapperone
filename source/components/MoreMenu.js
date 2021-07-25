/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-shadow */
import React, {useState} from 'react';
import {
  View,
  AsyncStorage,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import Popover from 'react-native-popover-view';
import {Popover, PopoverController} from 'react-native-modal-popover';

import {theme, keys} from '../constants';
import {Button} from '../UI';
import {connect} from 'react-redux';
import {
  resetListChatReducer,
  resetContactsReducer,
  resetListConversationReducer,
  resetBroadcastChats,
  resetNotificationsReducer,
} from '../actions/AppActions';
import {resetTripsReducer} from '../actions/TripActions';
import {
  deleteLocalChats,
  closeChatsRealm,
} from '../db/controllers/ChatsController';
import {deleteLocalNotifications} from '../db/controllers/NotificationsController';
import {getUrl} from '../resources/controllers/url';
import {putWithAuth} from '../resources/controllers/data';
import {getUniqueId} from 'react-native-device-info';
import {
  closeChatsListRealm,
  deleteLocalChatsList,
} from '../db/controllers/ChatsListController';
import {removeAllFirebaseListeners} from '../resources/utils';
import {RNToasty} from 'react-native-toasty';

function MoreMenu(props) {
  //   const handleTerms = closePopover => {
  //     closePopover();
  //     Actions.SignupScreen();
  //   };
  const [loadingLogout, setLoadingLogout] = useState(false);

  const handleSettings = closePopover => {
    closePopover();
    Actions.SettingsScreen();
  };
  // This
  function disableDeviceActiveState(deviceId) {
    const baseUrl = getUrl('devices');
    const url = `${baseUrl}/device/${deviceId}/inactive`;
    return putWithAuth(url);
  }

  const handleTerms = closePopover => {
    closePopover();
    Actions.Terms();
  };

  const handleLogout = async closePopover => {
    const {
      resetListChatReducer,
      resetContactsReducer,
      resetTripsReducer,
      resetListConversationReducer,
      resetBroadcastChats,
      resetNotificationsReducer,
    } = props;

    try {
      setLoadingLogout(true);
      try {
        await deleteLocalChats();
        await deleteLocalChatsList();
        await deleteLocalNotifications();
      } catch (e) {
        RNToasty.Normal({title: e.message});
      }
      closeChatsRealm();
      closeChatsListRealm();
      const deviceId = await getUniqueId();

      // set device active property to false in database
      await disableDeviceActiveState(deviceId);
      setLoadingLogout(false);
      await AsyncStorage.removeItem(keys.TOKEN_KEY);
      await removeAllFirebaseListeners();
      closePopover();

      Actions.reset('LoginScreen');
      //reset states
      resetListConversationReducer();
      resetListChatReducer();
      resetContactsReducer();
      resetTripsReducer();
      resetBroadcastChats();
      resetNotificationsReducer();
    } catch (e) {
      console.log(e);
      setLoadingLogout(false);
      RNToasty.Normal({title: e.message});
    }
  };
  return (
    <View>
      <PopoverController>
        {({
          openPopover,
          closePopover,
          popoverVisible,
          setPopoverAnchor,
          popoverAnchorRect,
        }) => (
          <React.Fragment>
            <TouchableOpacity
              style={{paddingLeft: 10}}
              title="More Options!"
              ref={setPopoverAnchor}
              onPress={openPopover}>
              <MaterialIcons
                name="more-vert"
                color={props.color ? props.color : theme.colors.white}
                size={theme.sizes.font * 2}
                // style={{paddingRight: 10}}
              />
            </TouchableOpacity>

            <Popover
              contentStyle={[styles.content, styles.shadow]}
              placement="bottom"
              arrowStyle={styles.arrow}
              backgroundStyle={styles.background}
              visible={popoverVisible}
              onClose={closePopover}
              fromRect={popoverAnchorRect}
              supportedOrientations={['portrait', 'landscape']}>
              {/* <Button
                style={styles.popoverItem}
                onPress={() => handleSettings(closePopover)}
                title="Logout">
                <Text style={styles.popoverItemText}>Trip Archives</Text>
              </Button> */}
              <Button
                style={styles.popoverItem}
                onPress={() => handleTerms(closePopover)}
                title="Terms Of Service">
                <Text style={styles.popoverItemText}>Terms of service</Text>
              </Button>
              {/* <Button
                style={styles.popoverItem}
                onPress={() => console.log('terms of service should display')}
                title="Logout">
                <Text style={styles.popoverItemText}>Privacy Policy</Text>
              </Button> */}
              <Button
                style={styles.popoverItem}
                onPress={() => handleSettings(closePopover)}
                title="Settings">
                <Text style={styles.popoverItemText}>Settings</Text>
              </Button>

              <Button
                style={[styles.popoverItem, styles.spaceBetween]}
                onPress={() => handleLogout(closePopover)}
                title="Logout"
                disabled={loadingLogout}>
                <Text style={styles.popoverItemText}>Logout</Text>
                {loadingLogout && (
                  <Text>
                    <ActivityIndicator
                      style={styles.activity}
                      color="gray"
                      size="small"
                    />
                  </Text>
                )}
              </Button>
            </Popover>
          </React.Fragment>
        )}
      </PopoverController>
    </View>
  );
}

export default connect(
  null,
  {
    resetListChatReducer,
    resetContactsReducer,
    resetTripsReducer,
    resetBroadcastChats,
    resetListConversationReducer,
    resetNotificationsReducer,
  },
)(MoreMenu);

const styles = StyleSheet.create({
  popoverItem: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    marginVertical: 0,
    color: 'black',
  },
  content: {
    paddingVertical: 0,
    paddingLeft: 15,
    paddingRight: 86,
    top: -44,
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
    marginVertical: 0,
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
  spaceBetween: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activity: {
    width: 20,
    height: 20,
  },
});
