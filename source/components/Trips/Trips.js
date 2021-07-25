/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  View,
  RefreshControl,
  Modal,
  Keyboard,
  FlatList,
  Platform,
} from 'react-native';

import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import {RNToasty} from 'react-native-toasty';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import CreateTrip from '../CreateTrip/CreateTrip';
import {theme} from '../../constants';
import {Text, Input, Prompt, Loading} from '../../UI';
import {getMyTrips, addTrip, prependTrip} from '../../actions/TripActions';
import {
  getLocalNotifications,
  closeNotificationsRealm,
} from '../../db/controllers/NotificationsController';
import {changeTripsBroadcastUnreadNotification} from '../../actions/AppActions';
import {handleError, getUserFromAsyncStorage} from '../../resources/utils';
import {postWithAuth} from '../../resources/controllers/data';
import {getUrl} from '../../resources/controllers/url';
import {TripCard, Header, LoadingTrips} from './components';

const StatusBarHeight = getStatusBarHeight();

class Trips extends Component {
  constructor(props) {
    super(props);

    this.state = {
      trips: [],
      showPrompt: false,
      showToast: false,
      errors: [],
      join_code: '',
      stillLoading: true,
      showCreateTripModal: false,
      showLoader: false,
      user: {},
      activeNotification: false,
    };

    this.charLimit = 200;
  }

  async componentDidMount() {
    try {
      const unread = await getLocalNotifications(`read = ${false} limit(1)`);
      if (unread.length > 0) {
        this.props.changeTripsBroadcastUnreadNotification(true);
      } else {
        this.props.changeTripsBroadcastUnreadNotification(false);
      }

      closeNotificationsRealm();
      this.props.getMyTrips();
      const user = await getUserFromAsyncStorage();
      this.setState({user});
    } catch (e) {
      closeNotificationsRealm();
      handleError(e);
    }
  }

  renderModal = () => {
    return (
      <Modal
        animationType="slide"
        visible={this.state.showCreateTripModal}
        onRequestClose={() => this.setState({showCreateTripModal: false})}>
        <CreateTrip
          isDisplayedInModal
          closeModal={() => this.setState({showCreateTripModal: false})}
          // addToTrips={this.props.addToTrips}
          addToTrips={this.props.prependTrip}
        />
      </Modal>
    );
  };

  _onRefresh = () => {
    this.props.getMyTrips();
  };

  joinTrip = async () => {
    try {
      const {join_code} = this.state;
      const errors = [];
      if (!join_code || join_code === '') {
        errors.push('join_code');
      }

      if (errors.length > 0) {
        this.setState({
          errors,
        });
        return;
      }

      this.setState({showLoader: true});
      const baseUrl = getUrl('trips');
      const {_id: user_id, role} = await getUserFromAsyncStorage();
      const url = `${baseUrl}/join/${join_code}`;
      const body = {
        user_id,
        role,
      };
      const {data: tripData} = await postWithAuth(url, body);
      Keyboard.dismiss();
      const trip = tripData.data;
      this.props.prependTrip(trip);
      this.setState({showLoader: false, join_code: '', showPrompt: false});
      RNToasty.Normal({
        title: 'Added succesfully to trip',
      });
    } catch (e) {
      handleError(e);
      console.log(e);
      this.setState({showLoader: false});
    }
  };

  renderJoinCode = () => {
    const {errors, showPrompt} = this.state;
    const okBtnText = 'JOIN TRIP';

    const cancelBtn = () => this.setState({showPrompt: false, errors: []});

    const hasErrors = key => (errors.includes(key) ? styles.hasErrors : null);
    if (!showPrompt) {
      return null;
    }
    return (
      <Prompt
        showPrompt={showPrompt}
        cancelBtn={cancelBtn}
        okBtnText={okBtnText}
        okBtn={this.joinTrip}
        overlay>
        <Text>JOIN TRIP</Text>
        <Input
          label="Trip Code"
          error={hasErrors('join_code')}
          style={[styles.input, hasErrors('join_code')]}
          // defaultValue={this.state.school_name}
          onChangeText={text => this.setState({join_code: text})}
        />
      </Prompt>
    );
  };

  handleTripClick = item => {
    this.props.addTrip(item);
    Actions.MainScreen();
  };

  renderItem = ({item, index}) => {
    let source = {uri: item.images[0]};
    if (!source || source === '') {
      source = require('../../assets/assets/images/noimage.png');
    }
    return (
      <TripCard
        handleTripClick={this.handleTripClick}
        source={source}
        item={item}
      />
    );
  };
  showCreateTripModal = () => {
    this.setState({showCreateTripModal: true});
  };
  handlePromptShow = () => this.setState({showPrompt: true});
  handleAddBtnClick = async () => {
    const user = await getUserFromAsyncStorage();
    if (user?.role !== 'teacher') {
      this.handlePromptShow();
    } else {
      Alert.alert(
        'Add or Join',
        'Create a trip or join a trip.',
        [
          {
            text: 'Join',
            onPress: this.handlePromptShow,
          },
          {
            text: 'Create',
            onPress: this.showCreateTripModal,
            style: 'cancel',
          },
        ],
        {cancelable: true},
      );
    }
  };

  renderHeader = () => {
    return (
      <Header
        activeNotification={this.state.activeNotification}
        handleAddBtnClick={this.handleAddBtnClick}
        superAdmin={this.state.user.superAdmin}
        indicateBroadcastUnread={this.props.indicateBroadcastUnread}
      />
    );
  };

  render() {
    const {trips, loadingTrips} = this.props;
    if (loadingTrips) {
      return (
        <LoadingTrips
          activeNotification={this.state.activeNotification}
          handleAddBtnClick={this.handleAddBtnClick}
          superAdmin={this.state.user.superAdmin}
          indicateBroadcastUnread={this.props.indicateBroadcastUnread}
        />
      );
    }

    return (
      <View style={styles.topContainer}>
        <StatusBar
          backgroundColor={theme.colors.white}
          barStyle="dark-content"
        />
        {this.renderHeader()}
        {this.renderJoinCode()}
        <Loading show={this.state.showLoader} />
        {this.renderModal()}
        <FlatList
          data={trips}
          renderItem={this.renderItem}
          showsVerticalScrollIndicator
          keyExtractor={item => `${item._id}`}
          refreshControl={
            <RefreshControl
              tintColor={theme.colors.primary} // ios only
              colors={[theme.colors.primary]}
              refreshing={this.props.loadingTrips}
              onRefresh={this._onRefresh}
            />
          }
        />
      </View>
    );
  }
}
const mapStateToProps = state => {
  return {
    trips: state.TripReducer.trips,
    loadingTrips: state.TripReducer.loadingTrips,
    trip: state.TripReducer.trip,
    indicateBroadcastUnread: state.NotificationsReducer.indicateBroadcastUnread,
  };
};

export default connect(
  mapStateToProps,
  {getMyTrips, addTrip, prependTrip, changeTripsBroadcastUnreadNotification},
)(Trips);

const styles = StyleSheet.create({
  topContainer: {
    ...Platform.select({
      ios: {
        marginTop: StatusBarHeight,
      },
      android: {
        marginTop: 0,
      },
    }),
  },
  container: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.gray2,
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

  input: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  hasErrors: {
    borderBottomColor: theme.colors.accent,
    borderBottomWidth: 2,
  },
});
