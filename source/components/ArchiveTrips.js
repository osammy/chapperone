/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  ScrollView,
  Alert,
  StatusBar,
  Dimensions,
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Keyboard,
  FlatList,
} from 'react-native';
import {Image} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade,
} from 'rn-placeholder';
import {Actions} from 'react-native-router-flux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {connect} from 'react-redux';
import {Icon} from 'native-base';

import CreateTrip from './CreateTrip';
import MoreMenu from './MoreMenu';
import {theme} from '../constants';
import {
  Block,
  Text,
  Card,
  Input,
  Prompt,
  Header,
  Badge,
  Button,
  Loading,
} from '../UI';
import {getMyTrips, addTrip, prependTrip} from '../actions/TripActions';
import {
  getLocalNotifications,
  closeNotificationsRealm,
} from '../db/controllers/NotificationsController';
import {changeTripsBroadcastUnreadNotification} from '../actions/AppActions';
import {
  handleError,
  getUserFromAsyncStorage,
  formatDate,
} from '../resources/utils';
import {postWithAuth} from '../resources/controllers/data';
import {getUrl} from '../resources/controllers/url';
import {RNToasty} from 'react-native-toasty';

const {width} = Dimensions.get('window');

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
      console.log('load')
      const unread = await getLocalNotifications(`read = ${false} limit(1)`);
      if (unread.length > 0) this.props.changeTripsBroadcastUnreadNotification(true);
      else this.props.changeTripsBroadcastUnreadNotification(false);

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
      this.setState({showLoader: false});
    }
  };

  renderJoinCode = () => {
    const {errors, showPrompt} = this.state;
    const okBtnText = 'JOIN TRIP';

    const cancelBtn = () => this.setState({showPrompt: false, errors: []});

    const hasErrors = key => (errors.includes(key) ? styles.hasErrors : null);
    if (!showPrompt) return null;
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

  renderItem({item, index}) {
    let source = {uri: item.images[0]};
    if (!source || source === '') {
      source = require('../assets/assets/images/noimage.png');
    }

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => this.handleTripClick(item)}>
        <Card shadow>
          <Block>
            {/* <ImageBackground
              style={[styles.destination, styles.shadow]}
              imageStyle={{borderRadius: theme.sizes.radius}}
              source={{uri: item.images[0] || ''}}
            /> */}
            <Image
              style={[styles.destination]}
              imageStyle={{borderRadius: theme.sizes.radius}}
              source={source}
            />
            <Block
              margin={[10, 0, 0, 0]}
              padding={[0, 5, 0, 5]}
              row
              space="between">
              <Text size={13} gray2>
                <Badge color={theme.colors.primary} size={5} />
                {formatDate(item.start_date)}
              </Text>
              <Text gray2>
                <Badge color={theme.colors.accent} size={5} />{' '}
                {formatDate(item.end_date)}
              </Text>
            </Block>
            <Block margin={[theme.sizes.margin / 4, theme.sizes.margin / 4]}>
              <Text
                style={styles.marginVertical}
                h2
                semibold
                colors={theme.colors.gray}>
                {item.name}
              </Text>
              <Text color={theme.colors.gray}>
                {item.description.split('').slice(0, this.charLimit)}
                {item.description.length > this.charLimit && (
                  <Text color={theme.colors.gray2}>...</Text>
                )}
              </Text>
              {/* <Text style={styles.marginTop} color={theme.colors.gray} bold>
                340 participants
              </Text> */}
            </Block>
          </Block>
        </Card>
      </TouchableOpacity>
    );
  }
showCreateTripModal = () => {
  this.setState({showCreateTripModal: true});
}
handlePromptShow = () => this.setState({showPrompt: true});
handleAddBtnClick = async () => {
  const user = await getUserFromAsyncStorage();
  if(user.role === 'student') {
    this.handlePromptShow()
  } else {
    Alert.alert(
      'Add or Join',
      'Create a atrip or join a trip.',
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

}

  renderHeader = () => {
    return (
      <View style={[styles.headerContainer, styles.shadow]}>
        <Block middle>
          <Text h2 primary>
            Trips
          </Text>
        </Block>

        <View style={{flexDirection: 'row', marginRight: 10}}>
        {this.props.indicateBroadcastUnread && (
                <Badge
                  color={theme.colors.accent}
                  size={10}
                  style={styles.badge}
                />
              )}
          <Button
            style={{paddingHorizontal: 20}}
            onPress={Actions.Notifications}
            transparent>
            <Text>
              <MaterialIcons
                name="notifications-none"
                color={theme.colors.primary}
                size={theme.sizes.font * 2}
              />
            </Text>
          </Button>
          <Button
            style={{paddingHorizontal: 20}}
            onPress={this.handleAddBtnClick}
            transparent>
            <MaterialIcons
              name="add"
              color={theme.colors.primary}
              size={theme.sizes.font * 2}
            />
            <Text style={styles.dot}>
              {this.state.activeNotification && (
                <Badge size={10} color={theme.colors.accent} />
              )}
            </Text>
          </Button>
          <View style={{justifyContent: 'center'}}>
            <MoreMenu color={theme.colors.primary} />
          </View>
        </View>
      </View>
    );
  };

  render() {
    const {trips, loadingTrips} = this.props;

    const isTeacher = this.state.user.role === 'teacher';

    if (loadingTrips) {
      return (
        <SafeAreaView style={styles.flex}>
          <StatusBar
            backgroundColor={theme.colors.transparent}
            barStyle="dark-content"
          />
          {this.renderHeader()}
          <ScrollView contentContainerStyle={{padding: theme.sizes.padding}}>
            {[1, 2, 3, 4].map((el, index) => (
              <Placeholder
                style={[styles.container, {marginBottom: 30}]}
                key={`${index}`}
                Animation={Fade}>
                <PlaceholderMedia
                  width={100}
                  height={160}
                  style={{width: '100%', height: 200}}
                />
                <PlaceholderLine width={60} style={{marginVertical: 30}} />
                <PlaceholderLine width={100} />
                <PlaceholderLine width={100} style={{marginBottom: 30}} />
                <PlaceholderLine width={30} style={{marginBottom: 30}} />
              </Placeholder>
            ))}
          </ScrollView>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.flex}>
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
          renderItem={this.renderItem.bind(this)}
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
        {isTeacher && (
          <View>
            <Button
              ripple
              activeOpacity={0.5}
              onPress={this.showCreateTripModal}
              style={[styles.touchableOpacityStyle, styles.shadow]}>
              <LinearGradient
                style={styles.gradient}
                colors={['#01A79B', theme.colors.secondary]}>
                <MaterialIcons
                  name="train"
                  color={theme.colors.white}
                  size={theme.sizes.font * 2.5}
                />
              </LinearGradient>
            </Button>
          </View>
        )}
      </SafeAreaView>
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
  {getMyTrips, addTrip, prependTrip,changeTripsBroadcastUnreadNotification},
)(Trips);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.gray2,
  },
  destination: {
    // width: width - theme.sizes.padding * 2,
    height: width * 0.6,
    paddingHorizontal: theme.sizes.padding,
    paddingVertical: theme.sizes.padding * 0.66,
    borderRadius: theme.sizes.radius,
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
  marginVertical: {
    marginVertical: theme.sizes.margin / 2,
  },
  marginTop: {
    marginTop: theme.sizes.margin / 2,
  },
  floatingButtonStyle: {
    resizeMode: 'contain',
    width: 70,
    height: 70,
  },
  gradient: {
    flex: 1,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
  },
  touchableOpacityStyle: {
    position: 'absolute',
    flex: 1,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
  },
  input: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    backgroundColor: theme.colors.white,
    color: 'white',
  },
  hasErrors: {
    borderBottomColor: theme.colors.accent,
    borderBottomWidth: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: theme.colors.gray2,
    margin: 0,
    paddingVertical: 5,
    paddingHorizontal: theme.sizes.horizontal,
  },
  backArrow: {
    height: 50,
    justifyContent: 'center',
    marginLeft: 0,
  },
  backIconStyle: {
    color: theme.colors.primary,
    fontSize: 35,
    paddingRight: 15,
  },
  textStyle: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 15,
  },
  rightContents: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dot: {
    position: 'absolute',
    top: 5,
    left: -20,
  },
  badge: {
    position: 'absolute',
    top: 10,
    // left: 0,
    left: 40,
    zIndex: 10,
  },
});
