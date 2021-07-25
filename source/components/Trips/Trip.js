/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-did-mount-set-state */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import {connect} from 'react-redux';
import {RNToasty} from 'react-native-toasty';
import {Image as RNEImage} from 'react-native-elements';

import {Block, Badge, Text} from '../../UI';
import {theme} from '../../constants';
import {formatTime} from '../../globals/formatDate';
import {postWithAuth} from '../../resources/controllers/data';
import {getUrl} from '../../resources/controllers/url';
import {
  getTrip,
  showModifyItineraryModal,
  addCpyOfTripItinerary,
} from '../../actions/TripActions';
import {
  capitalize,
  generateRandomStrings,
  getUserFromAsyncStorage,
  formatDate,
} from '../../resources/utils';
import {sendBroadcastInTrip} from './helpers';
import {
  TripHeader,
  Description,
  AlertButton,
  TripLeader,
  TripItinerary,
  Dots,
  BroadcastPrompt,
  EditTripItinerary,
  TripDates,
} from './components';

const {width} = Dimensions.get('window');

class Trip extends Component {
  scrollX = new Animated.Value(0);
  isIOS = Platform.OS === 'ios';

  state = {
    errors: [],
    user: {},
    charLimit: 180,
    itineraryErrors: [],
    date: new Date(),
    statusColor: 'transparent',
    barStyle: 'dark-content',
    showBroadcastPrompt: false,
    broadcastMessage: '',
    showEditTripModal: false,
    dateMode: this.isIOS ? 'datetime' : 'date',
    // trip: {
    //   images: [],
    //   trip_itinerary: [],
    //   trip_leader: {},
    // },
    isDatePickerVisible: false,
    currentClickedIndex: null,
    showDatepickerModal: false,
    showTimePicker: false, //only needed for android
    itineraryDate: new Date(),
    itineraryTime: new Date(),
  };

  openItineraryModal = () => {
    const {trip} = this.props;
    // Open itinerary Modal
    this.props.showModifyItineraryModal(true);

    if (trip.trip_itinerary && trip.trip_itinerary.length > 0) {
      // Add a copy of trip itinerary to state
      this.props.addCpyOfTripItinerary([...trip.trip_itinerary]);
    }
  };

  isChaperone = () => {
    return this.state.user?.role === 'teacher';
  };

  handleSendBroadcast = async () => {
    if (!this.isChaperone()) {
      return;
    }
    if (this.state.broadcastMessage === '') {
      return;
    }
    try {
      const userDetails = await getUserFromAsyncStorage();
      const {_id, avatar, first_name, last_name} = userDetails;
      const name = `${capitalize(first_name)} ${capitalize(last_name)}`;
      const user = {_id, avatar, name};

      const msgId = generateRandomStrings(16);
      const createdAt = new Date();
      const message = [
        {
          text: this.state.broadcastMessage,
          _id: msgId,
          user,
          createdAt,
        },
      ];

      const tripId = this.props.trip._id;

      await sendBroadcastInTrip(message, tripId);
      this.setState({broadcastMessage: '', showBroadcastPrompt: false});
      RNToasty.Normal({title: 'Broadcast Sent'});
      this.sendPushNotification(message, tripId);
    } catch (e) {
      Alert.alert(e.message || 'Message failed');
    }
  };

  sendPushNotification = (message, tripId) => {
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

  handleChange = text => this.setState({broadcastMessage: text});

  async componentDidMount() {
    const user = await getUserFromAsyncStorage();
    this.setState({user});
  }

  showBroadcastPrompt = () => {
    this.setState({showBroadcastPrompt: true});
  };

  handleModalClose = () => {
    //Close Add itinerary modal
    this.props.showModifyItineraryModal(false);
    // Reset copyOfItineraryArray to an empty array
    this.props.addCpyOfTripItinerary([]);
  };

  handleConfirmDate = () => {
    const eventDate = formatDate(this.state.itineraryDate, '/', true);
    // set some time before changing state
    const {currentClickedIndex} = this.state;
    const buff = [...this.props.copyOfTripItinerary];
    if (this.isIOS) {
      let eventTime = formatTime(this.state.itineraryDate);
      buff[currentClickedIndex].time = eventTime;
      //close the modal if on ios
      this.setState({showDatepickerModal: false});
    }
    buff[currentClickedIndex].date = eventDate;
    this.props.addCpyOfTripItinerary(buff);
  };

  handleConfirmOnlyTime = () => {
    let eventTime = formatTime(this.state.itineraryTime);

    // set some time before changing state
    const {currentClickedIndex} = this.state;
    const buff = [...this.props.copyOfTripItinerary];
    buff[currentClickedIndex].time = eventTime;
    this.props.addCpyOfTripItinerary(buff);
  };

  setModalDate = (event, selectedDate) => {
    // We need the or statement here because if you click cancel 'selected Date is undefined
    // and the state of itinerary date will cahngeto undefined causig the datepicker to error out
    if (!selectedDate) {
      this.setState({showDatepickerModal: false});
      return;
    }
    const updates = {itineraryDate: selectedDate};

    if (this.isIOS) {
      this.setState(updates);
    } else {
      updates.showDatepickerModal = false;
      this.setState(updates, this.handleConfirmDate);
    }

    if (!this.isIOS) {
      updates.showDatepickerModal = false;
    }
    this.setState(updates);
  };

  setTime = (event, selectedTime) => {
    // We need the or statement here because if you click cancel 'selected Date is undefined
    // and the state of itinerary date will cahngeto undefined causig the datepicker to error out
    if (!selectedTime) {
      this.setState({showTimePicker: false});
      return;
    }
    this.setState(
      {itineraryTime: selectedTime, showTimePicker: false},
      this.handleConfirmOnlyTime,
    );
  };

  showDatePickerModal = index => {
    this.setState({
      showTimePicker: false,
      showDatepickerModal: true,
      currentClickedIndex: index,
    });
  };

  showTimePicker = index => {
    this.setState({
      showDatepickerModal: false,
      showTimePicker: true,
      currentClickedIndex: index,
      dateMode: 'time',
    });
  };

  openEditModal = () => {
    this.setState({showEditTripModal: true});
  };

  render() {
    const {trip} = this.props;

    return (
      <View style={{flex: 1}}>
        <TripHeader showEdit={this.isChaperone()} />
        <ScrollView>
          <BroadcastPrompt
            cancelBtn={() => this.setState({showBroadcastPrompt: false})}
            handleChange={this.handleChange}
            broadcastMessage={this.state.broadcastMessage}
            showBroadcastPrompt={this.state.showBroadcastPrompt}
            shouldShowInput={this.isChaperone()}
            handleSendBroadcast={this.handleSendBroadcast}
          />
          <EditTripItinerary
            showDatePickerModal={this.showDatePickerModal}
            showTimePicker={this.showTimePicker}
            openTimePicker={this.state.showTimePicker}
            handleConfirmDate={this.handleConfirmDate}
            setModalDate={this.setModalDate}
            showDatepickerModal={this.state.showDatepickerModal}
            itineraryDate={this.state.itineraryDate}
            onRequestClose={() => this.setState({showDatepickerModal: false})}
            handleModalClose={this.handleModalClose}
            showBroadcastPrompt={this.showBroadcastPrompt}
          />
          <View>
            <View>
              <ScrollView
                horizontal
                pagingEnabled
                scrollEnabled
                showsHorizontalScrollIndicator={false}
                decelerationRate={0}
                scrollEventThrottle={16}
                snapToAlignment="center"
                onScroll={Animated.event([
                  {nativeEvent: {contentOffset: {x: this.scrollX}}},
                ])}>
                {trip.images.length === 0 && (
                  <Image
                    source={require('../../assets/assets/images/noimage.png')}
                    resizeMode="cover"
                    style={{width, height: width}}
                  />
                )}
                {(trip.images || []).map((img, index) => (
                  <RNEImage
                    key={`${index}-${img}`}
                    source={{uri: img}}
                    resizeMode="cover"
                    style={{width, height: width}}
                  />
                ))}
              </ScrollView>
              <Dots trip={this.props.trip} scrollX={this.scrollX} />
              {!this.isIOS && (
                <AlertButton
                  showBroadcastPrompt={this.showBroadcastPrompt}
                  role={this.state.user?.role}
                />
              )}
            </View>
            {/* <View style={styles.flex}>
              <View style={[styles.flex, styles.contentHeader]} />
            </View> */}
            <Block margin={[20, 20, 0, 20]}>
              <TripDates
                start_date={trip.start_date}
                end_date={trip.end_date}
              />
            </Block>
            <Block padding={[20, 20]}>
              <TripLeader
                getTrip={this.props.getTrip}
                trip={this.props.trip}
                loadingTrip={this.props.loadingTrip}
                failedToLoadTrip={this.props.failedToLoadTrip}
                showBroadcastPrompt={this.showBroadcastPrompt}
                role={this.state.user?.role}
              />

              <Description
                trip={this.props.trip}
                isChaperone={this.isChaperone}
              />
              <TripItinerary
                openItineraryModal={this.openItineraryModal}
                trip={this.props.trip}
                role={this.state.user?.role}
              />
            </Block>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    trip: state.TripReducer.trip,
    loadingTrip: state.TripReducer.loadingTrip,
    loadingTripItineraryBtn: state.TripReducer.loadingTripItineraryBtn,
    showModifyItinerary: state.TripReducer.showModifyItinerary,
    copyOfTripItinerary: state.TripReducer.copyOfTripItinerary,
    failedToLoadTrip: state.TripReducer.failedToLoadTrip,
    userPermissions: state.TripReducer.userPermissions,
    userSubPermissions: state.TripReducer.userSubPermissions,
  };
};

export default connect(
  mapStateToProps,
  {
    getTrip,
    showModifyItineraryModal,
    addCpyOfTripItinerary,
    // unSelectAllContacts,
  },
)(Trip);

const styles = StyleSheet.create({
  flex: {
    flex: 0,
  },
  contentHeader: {
    // backgroundColor: 'transparent',
    padding: theme.sizes.padding,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.sizes.radius,
    borderTopRightRadius: theme.sizes.radius,
    marginTop: -theme.sizes.padding / 2,
  },
});
