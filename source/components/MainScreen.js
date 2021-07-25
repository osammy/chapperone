/* eslint-disable curly */
/* eslint-disable prettier/prettier */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

import {TabView, SceneMap} from 'react-native-tab-view';
import {Actions} from 'react-native-router-flux';
import Animated from 'react-native-reanimated';
// import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import firebase from 'firebase';

import TabBarMenu from './TabBarMenu';
import ChatScene from './ChatScene';
import StatusScane from './StatusScane';
import CallScane from './CallScane';
import ContactsList from './ContactsList/ContactsList';
import Emergency from './Emergency/Emergency';
import Trip from './Trips/Trip';
import {theme} from '../constants';
import {connect} from 'react-redux';
import {
  fetchParticipants,
  resetListChatReducer,
  resetContactsReducer,
  resetBroadcastChats,
  resetListConversationReducer,
  fetchLastBroadcastMessage,
  changeTripsUnreadNotification,
  // unSelectAllContacts,
  // addContactsToTrip,
} from '../actions/AppActions';
import {fetchLastChapperoneGroupMessage} from '../actions/ChapperoneChatActions';
import {
  getTrip,
  addPermssions,
  addSubPermssions,
  addTrip,
} from '../actions/TripActions';
import MoreMenu from './MoreMenu';
import {Badge} from '../UI';
import {
  getUserFromAsyncStorage,
  removeAllFirebaseListeners,
  addFirebaseListerDetails,
} from '../resources/utils';
import {getLocalChats} from '../db/controllers/ChatsController';
import emitter from '../globals/events';

const {width, height} = Dimensions.get('window');
const initialLayout = {
  height: 0,
  width: Dimensions.get('window').width,
};

class MainScreen extends Component {
  constructor(props) {
    super(props);
    const index = this.props.route ? this.props.route : 0;
    this.state = {
      index,
      loading: this.props.chatNotifTriggered,
      tripId: this.props.trip._id,
      indicateMessageUnread: this.props.indicateMessageUnread,
      routes: [
        {key: 'first', title: 'INFO'},
        {key: 'second', title: 'MESSAGING'},
        {key: 'third', title: 'PEOPLE'},
        {key: 'fourth', title: 'EMERGENCY'},
      ],
      unread: false,
      user: {},
    };
  }

  // performace tweek
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.index !== nextState.index) return true;
    if (this.props.indicateMessageUnread !== nextState.indicateMessageUnread)
      return true;
    if (nextProps.trip._id === nextState.tripId) return false;
    // Note it defaults to returning true
  }

  _handleCustomEvent = data => {
    const {tripId} = data;
    if (this.props.trip._id !== tripId) {
      const clickedTrip = this.props.trips.find(el => el._id === tripId);
      if (!clickedTrip) {
        return;
      }
      this.props.addTrip(clickedTrip);
      Actions.MainScreen();
    }
    // move to the messaging tab if not already there
    if (this.state.index !== 1) {
      this.setState({index: 1});
    }
  };

  handleNavigationViaNotif(data) {
    const {tripId} = data;
    if (this.props.trip._id !== tripId) {
      const clickedTrip = this.props.trips.find(el => el._id === tripId);
      if (!clickedTrip) {
        return;
      }
      this.props.addTrip(clickedTrip);
      Actions.MainScreen();
    }
    // move to the messaging tab if not already there
    if (this.state.index !== 1) {
      this.setState({index: 1});
    }
    _handleCustomEvent;
  }

  componentWillUnmount() {
    // Remove custom listener
    emitter.removeListener('CURRENT_ROUTE_MAINSCREEN', this._handleCustomEvent);

    this.props.resetListChatReducer();
    this.props.resetContactsReducer();
    this.props.resetContactsReducer();
    this.props.resetBroadcastChats();
    this.props.resetListConversationReducer();
    // remove listener
    removeAllFirebaseListeners();
  }

  async componentDidMount() {
    const {chatNotifTriggered, data} = this.props;
    if (chatNotifTriggered) {
      this.props.addTrip(data);
      if (this.state.index !== 1) {
        this.setState({index: 1});
      }
      this.setState({loading: false});
    }
    emitter.on('CURRENT_ROUTE_MAINSCREEN', this._handleCustomEvent);
    const {_id: tripId} = this.props.trip;
    this.props.getTrip(tripId);
    // Get users trip permissions
    const user = await getUserFromAsyncStorage();
    const {_id: userId} = user;
    // const permRefUrl = `/permissions/${tripId}/${userId}`;
    // this.permissionsRef = firebase.database().ref(permRefUrl);
    // this.permissionsRef.on('value', snap => {
    //   if (!snap.exists()) return;
    //   const permissions = Object.keys(snap.val());
    //   this.props.addPermssions(permissions);
    // });
    //Get users' trip sub permissions
    // const subRefUrl = `/sub_permissions/${tripId}/${userId}`;
    // this.subPermRef = firebase.database().ref(subRefUrl);
    // this.subPermRef.on('value', snapShot => {
    //   if (!snapShot.exists()) return;

    //   const subPermissions = Object.keys(snapShot.val());
    //   this.props.addSubPermssions(subPermissions);
    // });

    // Get Brodcast last message
    const broadcastLastMsgRefUrl = `/broadcasts_conversation/${tripId}`;
    this.broadcastLastMsgRef = firebase.database().ref(broadcastLastMsgRefUrl);
    this.props.fetchLastBroadcastMessage(this.broadcastLastMsgRef, tripId);
    //store all listeners data
    const listenersData = [
      // {
      //   from: 'sub_permissions',
      //   refUrl: subRefUrl,
      // },
      // {
      //   from: 'permissions',
      //   refUrl: permRefUrl,
      // },
      {
        from: 'broadcast_conversations',
        refUrl: broadcastLastMsgRefUrl,
      },
    ];
    // GET CHAPPERONE GROUP LAST MESSAGE
    if (user?.role === 'teacher') {
      const chapperoneGroupLastMsgRefUrl = `/chapperones_broadcasts_conversation/${tripId}`;
      this.chapperonesGrouptLastMsgRef = firebase
        .database()
        .ref(chapperoneGroupLastMsgRefUrl);

      this.props.fetchLastChapperoneGroupMessage(
        this.chapperonesGrouptLastMsgRef,
        tripId,
      );

      listenersData.push({
        from: 'chapperones_broadcast_conversations',
        refUrl: chapperoneGroupLastMsgRefUrl,
      });
    }

    //Get trip contacts
    const params = {populateUserId: true};
    this.props.fetchParticipants(tripId, params);

    addFirebaseListerDetails(listenersData);
    // get localchats to populate badge for unread
    const unreadQuery = `trip_id = "${tripId}" AND type = "receive" AND status != "received" limit(1)`;
    const receivedChats = await getLocalChats(unreadQuery);

    if (receivedChats.length > 0) {
      //this.setState({unread: true});
      const notifDetails = {};
      notifDetails[tripId] = true;
      this.props.changeTripsUnreadNotification(notifDetails);
    }
  }

  _handleIndexChange = index => this.setState({index});
  _renderHeader = props => {
    return (
      <TabBarMenu
        labelStyle={{fontWeight: 'bold'}}
        {...props}
        // renderBadge={props => (
        //   <Badge {...props} color={theme.colors.white} size={20}>
        //     <Text color={theme.colors.primary} bold>
        //       2
        //     </Text>
        //   </Badge>
        // )}
      />
    );
  };

  _renderTabBar = props => {
    const inputRange = props.navigationState.routes.map((x, i) => i);
    const activeStyle = index => {
      if (index === this.state.index) {
        return {borderBottomWidth: 2, borderBottomColor: theme.colors.primary};
      }

      return {};
    };

    return (
      <View style={styles.tabBar}>
        {props.navigationState.routes.map((route, i) => {
          const color = Animated.color(
            Animated.round(
              Animated.interpolate(props.position, {
                inputRange,
                outputRange: inputRange.map(inputIndex =>
                  inputIndex === i ? 255 : 0,
                ),
              }),
            ),
            0,
            0,
          );

          let iconName;

          switch (i) {
            case 0:
              iconName = 'list';
              break;
            case 1:
              iconName = 'mail-outline';
              break;
            case 2:
              iconName = 'people-outline';
              break;
            case 3:
              iconName = 'error-outline';
              break;
            default:
              iconName = 'list';
          }

          // const showBadge = i === 1 && this.state.unread;
          const showBadge =
            i === 1 &&
            (this.props.indicateMessageUnread[this.props.trip._id] ||
              this.props.indicateTripBroadcastUnread[this.props.trip._id]);
          const tabActive = i === this.state.index;

          return (
            <TouchableOpacity
              key={i}
              style={[styles.tabItem, activeStyle(i)]}
              onPress={() => this.setState({index: i})}>
              {/* <Animated.Text style={{color}}>{route.title}</Animated.Text> */}
              <Animated.Text style={{color}}>
                <MaterialIcons
                  name={iconName}
                  size={30}
                  style={{fontWeight: 'lighter'}}
                  color={tabActive ? theme.colors.primary : theme.colors.gray}
                />
              </Animated.Text>
              {showBadge && (
                <Badge
                  color={theme.colors.accent}
                  size={10}
                  style={styles.badge}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  _renderScene = SceneMap({
    first: Trip,
    second: ChatScene,
    third: ContactsList,
    fourth: Emergency,
  });

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.state.loading && (
          <View style={styles.loaderStyle}>
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
        <TabView
          style={styles.container}
          navigationState={this.state}
          renderScene={this._renderScene}
          renderTabBar={this._renderTabBar}
          // renderHeader={this._renderHeader}
          onIndexChange={this._handleIndexChange}
          initialLayout={initialLayout}
          swipeEnabled={true}
          tabBarPosition="bottom"
        />
      </SafeAreaView>
    );
  }
}
mapStateToProps = state => {
  return {
    // contacts: state.ListContactsReducer.contacts,
    indicateMessageUnread: state.NotificationsReducer.indicateMessageUnread,
    indicateTripBroadcastUnread:
      state.NotificationsReducer.indicateTripBroadcastUnread,
    trip: state.TripReducer.trip,
    trips: state.TripReducer.trips,
  };
};

// export default MainScreen;

export default connect(
  mapStateToProps,
  {
    getTrip,
    addTrip,
    fetchParticipants,
    resetListChatReducer,
    fetchLastBroadcastMessage,
    fetchLastChapperoneGroupMessage,
    resetContactsReducer,
    resetBroadcastChats,
    resetListConversationReducer,
    addPermssions,
    addSubPermssions,
    changeTripsUnreadNotification,
  },
)(MainScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: 'Montserrat-Bold',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.primary,
    margin: 0,
  },
  numSelected: {
    flex: 1,
    marginTop: 11,
    marginLeft: 25,
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: theme.colors.white,
    color: 'white',
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 0,
  },
  badge: {
    position: 'absolute',
    top: 0,
    // left: 0,
    right: 45,
  },
  loaderStyle: {
    position: 'absolute',
    height: height,
    width: width,
    // backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',

    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
