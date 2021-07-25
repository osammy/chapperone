/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import {Icon} from 'native-base';
import {connect} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Actions} from 'react-native-router-flux';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import {addTrip} from '../actions/TripActions';
import {
  getBroadCastMsgs,
  changeTripsBroadcastUnreadNotification,
} from '../actions/AppActions';
import {Text, Badge, Loading} from '../UI';
import {theme} from '../constants';
import {
  formatFullDateTime,
  realmToOrdinaryData,
  getUserFromAsyncStorage,
} from '../resources/utils';
import {
  getLocalNotifications,
  updateLocalNotifications,
  deleteLocalNotifications,
} from '../db/controllers/NotificationsController';
import {getUrl} from '../resources/controllers/url';
import {getWithAuth} from '../resources/controllers/data';
const {width, height} = Dimensions.get('window');
const statusBarHeight = getStatusBarHeight();

function NotificationsComponent(props) {
  const [notifications, setNotifications] = useState([]);
  const [showLoading, setShowLoading] = useState(false);
  const [refreshNotifications, setRefreshNotifications] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    //   const message = props.messageId;
    setShowLoading(true);
    async function getNotifications() {
      const data = await getLocalNotifications();
      const plainArr = realmToOrdinaryData(data);
      setNotifications(plainArr);
      setShowLoading(false);
      const unread = await getLocalNotifications(`read = ${false} limit(1)`);
      if (unread.length > 0) props.changeTripsBroadcastUnreadNotification(true);
      else props.changeTripsBroadcastUnreadNotification(false);
    }

    try {
      getNotifications();
    } catch (e) {
      setShowLoading(false);
    }

    return async () => {
      const unread = await getLocalNotifications(`read = ${false} limit(1)`);
      props.changeTripsBroadcastUnreadNotification(unread.length > 0);
    };
  }, []);

  async function reloadNotifications() {
    try {
      setRefreshNotifications(true);
      const data = await getLocalNotifications();
      const plainArr = realmToOrdinaryData(data);
      setNotifications(plainArr);
      setRefreshNotifications(false);
    } catch (e) {
      setRefreshNotifications(false);
    }
  }

  const renderLoader = () => {
    if (showLoading) {
      return (
        <View style={styles.pageIndicator}>
          <Text>
            <ActivityIndicator
              style={{width: 40, height: 40}}
              size="large"
              color="#00ff00"
            />
          </Text>
        </View>
      );
    }
  };

  const handleClick = async item => {
    try {
      const {type, linkId, _id} = item;
      if (type === 'trip_broadcast') {
        setShowLoading(true);
        const url = `${getUrl('trips')}/${linkId}`;
        const {data: tripData} = await getWithAuth(url);
        //Add trip to redux store
        const trip = tripData.data;
        const tripId = trip._id;
        const user = await getUserFromAsyncStorage();
        const userId = user._id;
        props.addTrip(trip);
        // await props.getBroadCastMsgs(tripId, userId);
        setShowLoading(false);
        await updateLocalNotifications(`_id = "${_id}"`, {read: true});
        // Close realm
        Actions.MainScreen({route: 1});
      }
    } catch (e) {
      console.log(e);
      setShowLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteLocalNotifications();
      setDeleting(false);
      setNotifications([]);
    } catch (e) {
      console.log(e);
    }
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={Actions.pop} style={styles.backArrow}>
          <Icon name="arrow-back" style={styles.backIconStyle} />
        </TouchableOpacity>
        <Text style={styles.textStyle}>Notifications</Text>
        <TouchableOpacity
          style={{justifyContent: 'center'}}
          onPress={handleDelete}>
          <MaterialIcons
            name="delete"
            color={theme.colors.primary}
            size={theme.sizes.font * 1.8}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({item, index}) => {
    const color = item.read ? 'white' : theme.colors.accent;
    return (
      <TouchableHighlight
        underlayColor={theme.colors.lightAccent}
        onPress={() => handleClick(item)}>
        <View style={[styles.item, styles.spaceBetween]}>
          <View style={styles.badgeStyle}>
            <Badge color={color} size={5} />
          </View>
          <View style={{flex: 0.95}}>
            <Text gray bold numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.spaceBetween}>
              <Text style={{flex: 0.95}} numberOfLines={1}>
                {item.text}
              </Text>
              <Text gray>{formatFullDateTime(item.createdAt)}</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <View style={styles.flex}>
      <Loading show={deleting} loadingText="Deleting Notifications" />
      {renderLoader()}
      {renderHeader()}
      <View style={styles.container}>
        <FlatList
          data={notifications}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.line} />}
          keyExtractor={item => `${item._id}`}
          refreshControl={
            <RefreshControl
              colors={[theme.colors.primary]}
              refreshing={refreshNotifications}
              onRefresh={reloadNotifications}
            />
          }
        />
      </View>
    </View>
  );
}

const mapStateToProps = state => {
  return {
    indicateBroadcastUnread: state.NotificationsReducer.indicateBroadcastUnread,
  };
};

export default connect(
  mapStateToProps,
  {addTrip, getBroadCastMsgs, changeTripsBroadcastUnreadNotification},
)(NotificationsComponent);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 10,
    fontSize: 16,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2 * StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.gray,
  },
  line: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.gray2,
  },
  spaceBetween: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    padding: 10,
  },
  badgeStyle: {
    flex: 0.05,
    justifyContent: 'center',
  },
  pageIndicator: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    top: height / 2 - 20,
    left: width / 2 - 20,
  },
  //
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: theme.colors.gray2,
    margin: 0,
    paddingVertical: 5,
    paddingHorizontal: theme.sizes.horizontal,
    ...Platform.select({
      ios: {
        marginTop: statusBarHeight,
      },
    }),
    width: width,
  },
  backArrow: {
    height: 50,
    justifyContent: 'center',
    marginLeft: 0,
  },
  backIconStyle: {
    color: theme.colors.primary,
    fontSize: 30,
    paddingRight: 15,
  },
  textStyle: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 15,
  },
});
