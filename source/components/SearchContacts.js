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
  RefreshControl,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
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
import {Icon} from 'native-base';
import {getStatusBarHeight} from 'react-native-status-bar-height';


import {
  fetchAllContacts,
  contactSelected,
  unSelectAllContacts,
  addContactsToTrip,
} from '../actions/AppActions';
import {getTrip} from '../actions/TripActions';
import {Block, Button, Text, Badge, Loading} from '../UI';
import {theme} from '../constants';
import {capitalize} from '../resources/utils';

const statusBarHeight = getStatusBarHeight();

class ContactsList extends Component {
  state = {
    contacts: [],
    selectedValue: '',
    contact: {avatar: ''},
    showContactPermissions: false,
    searchText: '',
    searching: false,
  };

  cache = {};

  componentDidMount() {
    /* Only make a call if the contacts is empty, note that a request is made in Mainscreen
    and it should alreact populate this.props.contact.*/
    this.handleGetContacts();
  }

  componentWillUnmount() {
    this.props.unSelectAllContacts();
  }

  handleGetContacts = async () => {
    const {_id: trip_id, trip_leader} = this.props.trip;
    if (typeof trip_leader === 'string') {
      // Make a request to get trip before fetching contacts
      this.props.getTrip(trip_id);
    }
    // This will only be defined when GET to trips/:id succeeded with the trip_leader populated
    const organisationId = this.props.trip.trip_leader.organisation;
    if (organisationId) {
      const params = {
        notAdded: true,
        trip_id,
      };
      this.props.fetchAllContacts(organisationId, params);
    }
  };
  static getDerivedStateFromProps(nextProps, prevState) {
    // Return null to prevent updating state with props when user is searching
    if (prevState.searchText === '') {
      if (nextProps.contacts !== prevState.contacts) {
        return {contacts: nextProps.contacts};
      } else {
        return null;
      }
    } else return null;
  }

  cancelText = () => {
    this.setState({searchText: ''});
  };

  handleSearch = text => {
    const cpyOfContactsState = [...this.state.contacts];
    const searchText = text.toLowerCase();
    let result = this.cache[searchText];

    if (!result) {
      result = cpyOfContactsState.filter(el => {
        const usersname = `${el.first_name} ${el.last_name}`.toLowerCase();

        return usersname.includes(searchText);
      });

      // Use memoization to improve performance
      this.cache[searchText] = result;
    }

    this.setState({contacts: result, searchText: text});
  };

  handleContactSelect = contact => {
    const cpyOfContacts = [...this.props.contacts];
    const index = cpyOfContacts.findIndex(el => el._id === contact._id);
    if (index === -1) {
      RNToasty.Normal({
        title: e.message || "Couldn't fetch trip, Please check your connection",
      });
      return;
    }

    this.props.contactSelected(index);
  };

  
  renderItem = ({item}) => {
    let name = '';
    let role = '';
    let avatar = '';
    let badgeIdentifier = false;
    let badgeColor = theme.colors.primary;
    let handleClick;

    try {
      name = capitalize(item.first_name) + ' ' + capitalize(item.last_name);
      role = capitalize(item.role);
      avatar = item.avatar;

      if (item.permissions && item.permissions.length > 0) {
        // select the first alphabet of the first item in the permissinos array
        badgeIdentifier = capitalize(item.permissions[0][0]);
        if (badgeIdentifier === 'C') {
          badgeColor = theme.colors.accent;
        }
      }

      if (item.permissions && item.permissions.length > 0) {
        handleClick = this.props.highlight_mode
          ? () => this.handleContactSelect(item)
          : () =>
              Actions.chat({
                contact: item,
              });
      } else {
        handleClick = this.props.highlight_mode
          ? () => this.handleContactSelect(item)
          : () => this.confirmAddSingleUser(item);
          // : () => this.handleShowModal(item);
      }
    } catch (e) {
      return null;
    }

    const viewStyle = item.isSelect
      ? [styles.listItem, styles.highlight]
      : styles.listItem;

    return (
      <TouchableHighlight
        activeOpacity={0.6}
        underlayColor="#DDDDDD"
        onPress={handleClick}
        onLongPress={() => this.handleContactSelect(item)}>
        <View style={viewStyle}>
          <Image source={{uri: avatar}} style={styles.avatar} />
          <View style={styles.content}>
            <Block style={styles.chatTop} row space="between">
              <Text style={styles.chatName}>{name}</Text>
              {badgeIdentifier && (
                <Badge color={badgeColor} size={30}>
                  <Text color={theme.colors.white}>{badgeIdentifier}</Text>
                </Badge>
              )}
            </Block>
            <Block row space="between">
              <Text
                numberOfLines={1}
                color={theme.colors.gray}
                style={styles.lastMessage}>
                {role}
              </Text>
              {/* <Badge color={theme.colors.primary} size={20}>
                <Text color={theme.colors.white}>{badgeIdentifier}</Text>
              </Badge> */}
            </Block>
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  handleShowModal = contact => {
    this.setState({
      showContactPermissions: true,
      contact,
    });
  };

  handleCloseModal = () => {
    this.setState({
      showContactPermissions: false,
      contact: {avatar: ''},
    });
  };

  renderModal = () => {
    const {contact} = this.state;
    const save = () => {};

    return (
      <Modal
        animationType="slide"
        visible={this.state.showContactPermissions}
        onRequestClose={this.handleCloseModal}>
        <Block style={{flex: 0, paddingHorizontal: 15}} row space="between">
          <Button onPress={this.handleCloseModal}>
            <MaterialIcons
              name="clear"
              color={theme.colors.primary}
              size={theme.sizes.font * 2.5}
            />
          </Button>
          <Button style={styles.addBtn} onPress={save}>
            <Text color={theme.colors.white} bold>
              SAVE
            </Text>
          </Button>
        </Block>
        <Block
          padding={[theme.sizes.padding, theme.sizes.padding]}
          space="between">
          <Image source={{uri: contact.avatar}} style={styles.avatar} />
        </Block>
      </Modal>
    );
  };

  addUsersToTrip = () => {
    const contacts = this.state.contacts
      .filter(el => el.isSelect)
      .map(el => ({_id: el._id, role: el.role}));

    const tripId = this.props.trip._id;
    const data = {contacts};

    this.props.addContactsToTrip(tripId, data);
  };
  addSingleUserToTrip = contact => {
    const tripId = this.props.trip._id;
    const data = {contacts:[contact]};

    this.props.addContactsToTrip(tripId, data);
  }
  confirmAddSingleUser = (contact) => {
    Alert.alert(
      "Add Contact ?",
      "Are you sure you want to add contact to trip?",
      [
        {
          text: "Add to Trip",
          onPress: () => this.addSingleUserToTrip(contact)
        },
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
      ],
      { cancelable: false }
    );
  };

  render() {
    const {highlight_mode, loadingContacts} = this.props;
    const ios = Platform.OS !== 'ios';
    const backArrowIcon = ios ? 'keyboard-arrow-left' : 'keyboard-backspace';
    const backArrowSize = ios ? theme.sizes.font * 3 : theme.sizes.font * 2;

    let lengthOfSelected = 0;
    if (highlight_mode) {
      lengthOfSelected = this.props.contacts.filter(el => el.isSelect).length;
    }

    if (loadingContacts) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar
            backgroundColor={theme.colors.transparent}
            barStyle="dark-content"
          />
          <View style={styles.headerContainer}>
            <Block row space="between">
              <TouchableOpacity onPress={Actions.pop} style={styles.backArrow}>
                <Icon name="arrow-back" style={styles.backIconStyle} />
              </TouchableOpacity>
              {this.props.highlight_mode && (
                <Text color={theme.colors.primary} style={styles.numSelected}>
                  {lengthOfSelected}
                </Text>
              )}
            </Block>
            <Block style={{flex: 6}}>
              <TextInput
                style={styles.input}
                placeholder="Search Contacts"
                value={this.state.searchText}
                onChangeText={this.handleSearch}
              />
            </Block>

            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                style={{justifyContent: 'center'}}
                onPress={this.cancelText}>
                <MaterialIcons
                  name={highlight_mode ? 'add' : 'clear'}
                  color={theme.colors.primary}
                  size={theme.sizes.font * 2}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* end custom header */}
          <ScrollView contentContainerStyle={{padding: theme.sizes.padding}}>
            {[1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12].map(el => (
              <Placeholder
                key={`${el}`}
                Animation={Fade}
                Left={PlaceholderMedia}
                style={{marginBottom: 20}}
                // Right={PlaceholderMedia}
              >
                <PlaceholderLine width={80} />
                <PlaceholderLine width={20} />
              </Placeholder>
            ))}
          </ScrollView>
        </SafeAreaView>
      );
    }

    return (
      <Block style={styles.container}>
        <Loading
          show={this.props.loadingAddContacts}
          loadingText="Adding Contacts..."
        />
        {this.renderModal()}
        {/* //start custom header */}
        <View style={styles.headerContainer}>
          <Block row space="between">
            <TouchableOpacity
              onPress={() => Actions.pop()}
              style={styles.backArrow}>
              <Icon name="arrow-back" style={styles.backIconStyle} />
            </TouchableOpacity>
            {this.props.highlight_mode && (
              <Text color={theme.colors.primary} style={styles.numSelected}>
                {lengthOfSelected}
              </Text>
            )}
          </Block>
          <Block style={{flex: 6}}>
            <TextInput
              style={styles.input}
              placeholder="Search Contacts"
              value={this.state.searchText}
              onChangeText={this.handleSearch}
            />
          </Block>

          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{justifyContent: 'center'}}
              onPress={highlight_mode ? this.addUsersToTrip : this.cancelText}>
              <MaterialIcons
                name={highlight_mode ? 'add' : 'clear'}
                color={theme.colors.primary}
                size={theme.sizes.font * 2}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* end custom header */}
        <FlatList
          data={this.state.contacts}
          renderItem={this.renderItem}
          ItemSeparatorComponent={() => <View style={styles.line} />}
          keyExtractor={item => `${item._id}`}
          refreshControl={
            <RefreshControl
              colors={[theme.colors.primary]}
              refreshing={this.props.loadingContacts}
              onRefresh={this.handleGetContacts}
            />
          }
          // extraData={this.props}
        />
      </Block>
    );
  }
}
mapStateToProps = state => {
  return {
    contacts: state.ListContactsReducer.contacts,
    trip: state.TripReducer.trip,
    failedToLoadContacts: state.ListContactsReducer.failedToLoadContacts,
    loadingAddContacts: state.ListContactsReducer.loadingAddContacts,
    highlight_mode: state.ListContactsReducer.highlight_mode,
    loadingContacts: state.ListContactsReducer.loadingContacts,
  };
};

export default connect(
  mapStateToProps,
  {
    getTrip,
    fetchAllContacts,
    contactSelected,
    unSelectAllContacts,
    addContactsToTrip,
  },
)(ContactsList);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      ios: {
        marginTop: statusBarHeight,
      }
    })
    // justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatarNorm: {
    width: theme.sizes.padding * 2,
    height: theme.sizes.padding * 2,
    borderRadius: theme.sizes.padding,
  },
  addBtn: {
    flex: 0.3,
    backgroundColor: theme.colors.primary,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  //
  listItem: {
    flex: 1,
    flexDirection: 'row',
    padding: 15,
  },
  avatar: {width: 60, height: 60, borderRadius: 30},
  chatTop: {width: '100%', margin: 0, padding: 0},
  chatName: {fontSize: 15, fontWeight: 'bold'},
  content: {
    marginLeft: 15,
    flex: 1,
    borderColor: theme.colors.gray2,
  },
  lastMessage: {fontSize: 13, width: '93%'},
  highlight: {
    backgroundColor: 'rgba(188, 204, 212, 0.2)',
  },
  line: {
    height: 0.5,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0)',
  },
  round: {
    width: theme.sizes.padding * 3,
    height: theme.sizes.padding * 3,
    borderRadius: theme.sizes.padding * 1.5,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderWidth: 0.2,
    borderColor: theme.colors.gray2,
    margin: 0,
    paddingVertical: 5,
    paddingHorizontal: theme.sizes.horizontal,
  },
  numSelected: {
    flex: 1,
    marginTop: 11,
    marginLeft: 25,
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    // borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.black,
    // borderRadius: theme.sizes.radius,
    fontSize: theme.sizes.font,
    // fontWeight: '500',
    color: theme.colors.black,
    width: '100%',
    ...Platform.select({
      ios: {
        marginTop: 15,
      }
    })
    // height: theme.sizes.base * 3,
  },
  backArrow: {
    height: 50,
    justifyContent: 'center',
    marginLeft: 0,
  },
  backIconStyle: {
    color: theme.colors.primary,
    fontSize: 24,
    paddingRight: 15,
  },
});
