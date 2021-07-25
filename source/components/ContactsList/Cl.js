/* eslint-disable curly */
/* eslint-disable no-undef */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {Actions} from 'react-native-router-flux';
import {
  View,
  FlatList,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  Modal,
  RefreshControl,
  StatusBar,
  ScrollView,
  SafeAreaView,
  TextInput,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {RNToasty} from 'react-native-toasty';
import {connect} from 'react-redux';
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade,
} from 'rn-placeholder';
import {Button as Btn, Text as Txt, Icon, Picker} from 'native-base';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import {
  fetchParticipants,
  participantSelected,
  unSelectAllParticipants,
  updateParticipantPermissions,
} from '../../actions/AppActions';
import {Block, Button, Text, Card, Badge} from '../../UI';
import {theme} from '../../constants';
import {
  capitalize,
  getUserFromAsyncStorage,
  formatFullDateTime,
  handleError,
} from '../../resources/utils';
import {closeChatsRealm} from '../../db/controllers/ChatsController';
import {getUrl} from '../../resources/controllers/url';
import {putWithAuth} from '../../resources/controllers/data';
import {
  ListItem,
  LoadingPage,
  Header,
  ParticipantModalView,
  ParticipantsList,
} from './components';

const statusBarHeight = getStatusBarHeight();
const {width} = Dimensions.get('window');

class ContactsList extends Component {
  constructor(props) {
    super(props);

    // this.SUB_PERMISSIONS = [
    //   {
    //     label: 'Access Add Member',
    //     value: 'add_member',
    //   },
    //   {
    //     label: 'Access Add Chaperone',
    //     value: 'add_chaperone',
    //   },
    //   {
    //     label: 'Access Broadcast',
    //     value: 'access_broadcast',
    //   },
    // ];

    this.state = {
      participants: this.props.participants,
      selectedValue: '',
      participant: {avatar: '', sub_permissions: []},
      showParticipantPermissions: false,
      searchText: '',
      searchList: false,
      user: {},
      permissions: [],
      sub_permissions: [],
      loadingUpdatePermissions: false,
      permissionsSelectedValue: '',
    };

    this.textInputRef = React.createRef();
    this.cache = {};
    getUserFromAsyncStorage().then(user => {
      if (user) this.user = user;
    });
  }

  componentWillUnmount() {
    // close chats realm on leaving component
    closeChatsRealm();
  }

  updatePermissions = async () => {
    try {
      const {
        participant: {permissions, sub_permissions, _id},
      } = this.state;
      const {trip} = this.props;

      const baseUrl = getUrl('participants');
      const url = `${baseUrl}/${_id}/trips/${trip._id}/permissions`;

      this.setState({loadingUpdatePermissions: true});

      const body = {permissions, sub_permissions};

      const payload = {_id, ...body};

      await putWithAuth(url, body);

      this.props.updateParticipantPermissions(payload);
      this.setState({loadingUpdatePermissions: false});
      const showToast =
        Platform.OS === 'android' ? RNToasty.Success : RNToasty.Normal;
      showToast({title: 'Success Updated!'});
    } catch (e) {
      handleError(e);
      this.setState({loadingUpdatePermissions: false});
    }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    // Return null to prevent updating state with props when user is searching
    if (prevState.searchText === '') {
      if (nextProps.participants !== prevState.participants) {
        return {participants: nextProps.participants};
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  async componentDidMount() {
    this.setState({user: await getUserFromAsyncStorage()});
    console.log(this.props.trip);
  }

  onPermissionsValueChange = value => {
    if (value === '') return;

    const {participant} = this.state;
    const permissions = [value];

    this.setState({
      participant: {...participant, permissions},
      permissionsSelectedValue: value,
    });
  };

  onValueChange = value => {
    if (value === '') return;
    const {participant} = this.state;

    if (!participant.permissions.includes('chapperone')) {
      RNToasty.Normal({
        title: 'You can only add sub permissions to chapperones',
      });
      return;
    }

    const found = participant.sub_permissions.find(e => e === value);
    if (found) {
      RNToasty.Normal({title: 'This permission already exists'});
      return;
    }

    const sub_permissions = participant.sub_permissions.concat(value);

    this.setState({participant: {...participant, sub_permissions}});
  };

  handleParticipantSelect = participant => {
    const cpyOfParticipants = [...this.props.participants];
    const index = cpyOfParticipants.findIndex(el => el._id === participant._id);
    if (index === -1) {
      RNToasty.Normal({
        title: e.message || "Couldn't fetch trip, Please check your connection",
      });
      return;
    }

    this.props.participantSelected(index);
  };

  handleItemClick = item => {
    // if modal is open
    this.handleCloseModal();
    if (this.user._id === item.user_id._id) {
      RNToasty.Normal({
        title: 'You cannot message yourself!',
      });
      return;
    }
    Actions.chat({
      participant: item,
      user: this.user,
    });
  };

  handleShowModal = participant => {
    this.setState({
      showParticipantPermissions: true,
      participant,
      permissionsSelectedValue: participant.permissions[0],
    });
  };

  handleSearch = text => {
    const searchText = text.toLowerCase();
    let result = this.cache[searchText];

    if (!result) {
      result = this.state.participants.filter(el => {
        const usersname = `${el.user_id.first_name} ${
          el.user_id.last_name
        }`.toLowerCase();
        return usersname.includes(searchText);
      });
      // Use memoization to improve performance
      this.cache[searchText] = result;
    }

    this.setState({participants: result, searchText: text});
  };

  handleCloseModal = () => {
    this.setState({
      showParticipantPermissions: false,
      participant: {avatar: '', sub_permissions: []},
    });
  };

  _onRefresh = () => {
    const {_id} = this.props.trip;
    //Get trip contacts
    const params = {populateUserId: true};
    this.props.fetchParticipants(_id, params);
  };

  messageParticipant = () => {
    const item = this.state.participant;
    this.handleItemClick(item);
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Header user={this.state.user} handleSearch={this.handleSearch} />
        <View style={styles.headerText}>
          <Text center primary bold size={16}>
            PARTICIPANTS
          </Text>
        </View>

        <ParticipantsList
          participants={this.props.participants}
          handleShowModal={this.handleShowModal}
          handleCloseModal={this.handleCloseModal}
          user={this.state.user}
          handleParticipantSelect={this.handleParticipantSelect}
        />
        <ParticipantModalView
          user={this.state.user}
          trip={this.props.trip}
          participant={this.state.participant}
          handleCloseModal={this.handleCloseModal}
          showParticipantPermissions={this.state.showParticipantPermissions}
        />
      </SafeAreaView>
    );
  }
}
mapStateToProps = state => {
  return {
    participants: state.ListContactsReducer.participants,
    loadingParticipants: state.ListContactsReducer.loadingParticipants,
    trip: state.TripReducer.trip,
    failedToLoadParticipants:
      state.ListContactsReducer.failedToLoadParticipants,
    highlight_mode: state.ListContactsReducer.highlight_mode,
  };
};

export default connect(
  mapStateToProps,
  {
    fetchParticipants,
    participantSelected,
    unSelectAllParticipants,
    updateParticipantPermissions,
  },
)(ContactsList);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    // justifyContent: 'center',
  },
  headerText: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
});
