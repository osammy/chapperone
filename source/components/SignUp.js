/* eslint-disable no-catch-shadow */
/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Alert,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  TouchableHighlight,
  TextInput,
  FlatList,
  Platform,
  Modal,
  StatusBar,
  SafeAreaView,
  ScrollView,
  View,
  Dimensions,
} from 'react-native';
import _ from 'lodash';
import {Icon, Picker} from 'native-base';
import {getUniqueId} from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import jwt_Decode from 'jwt-decode';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {Actions} from 'react-native-router-flux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {getStatusBarHeight} from 'react-native-status-bar-height';

import {Button, Block, Input, Text, Card, Header} from '../UI';
import {subYears} from '../resources/utils/dateUtils';
import {theme} from '../constants';
import {getUrl} from '../resources/controllers/url';
import {get, post} from '../resources/controllers/data/index';
import {
  validateEmail,
  setUserToken,
  handleError,
  formatDate,
} from '../resources/utils';
import {postWithAuth} from '../resources/controllers/data';
import {TouchableOpacity} from 'react-native-gesture-handler';

const {width} = Dimensions.get('window');
const statusBarHeight = getStatusBarHeight();

class SignUp extends Component {
  state = {
    email: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    role: '',
    organisation: '', //This represents the id of the organsiation
    organisationName: '',
    date: new Date(),
    showAddSchool: false,
    errors: [],
    organisations: [],
    loading: false,
    loadingSignUp: false,
    query: '',
    dob: new Date(),
    data: [],
    errMsg: '',
    //
    value: '',
    isLoading: false,
    showDatepickerModal: false,
    dateText: 'Enter Date',
    loadingGetOrg: false,
    showOrganisationModal: false,
  };

  ROLES = [
    {
      _id: 1,
      label: 'chaperone',
      value: 'teacher',
    },
    {
      _id: 2,
      label: 'student / parent',
      value: 'student',
    },
  ];

  onValueChange(value) {
    this.setState({role: value});
  }

  saveUserDevice = (user, deviceId, fcmToken) => {
    return new Promise((resolve, reject) => {
      const devices = {
        user,
        deviceId,
        fcmToken,
        active: true,
      };
      const url = getUrl('devices');
      postWithAuth(url, devices)
        .then(resp => {
          const {data: device} = resp;
          resolve(device.data);
        })
        .catch(reject);
    });
  };

  _onChangeText(text) {
    this.setState({isLoading: true, value: text});

    get(getUrl('organisations')).then(result => {
      // Process list of suggestions

      this.setState({isLoading: false});
    });
  }

  getAge(dob) {
    var diff_ms = Date.now() - dob.getTime();
    var age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  }

  handleSignUp = async () => {
    const {
      email,
      username,
      password,
      dob,
      organisation,
      first_name,
      last_name,
      role,
    } = this.state;

    const errors = [];

    Keyboard.dismiss();
    this.setState({loadingSignUp: true});

    // check with backend API or with some static data

    if (!first_name) {
      errors.push('first_name');
    }

    if (!last_name) {
      errors.push('last_name');
    }

    if (!email) {
      errors.push('email');
    }

    if (!validateEmail(email)) {
      if (!errors.includes('email')) {
        errors.push('email');
      }
    }

    if (!username) {
      errors.push('username');
    }
    if (!password) {
      errors.push('password');
    }

    if (!organisation) {
      errors.push('organization');
    }

    if (errors.length > 0) {
      this.setState({
        errors,
        loadingSignUp: false,
        errMsg: `Please provide a valid ${errors[0]}`,
      });
      return;
    }

    const data = {
      first_name,
      last_name,
      email,
      username,
      password,
      dob,
      organisation,
      role,
    };

    try {
      const url = getUrl('users');
      const registerUrl = `${url}/register`;
      const {data: token} = await post(registerUrl, data);
      await setUserToken(token);
      const {_id: userId} = jwt_Decode(token);
      const deviceId = await getUniqueId();
      const fcmToken = await messaging().getToken();
      await this.saveUserDevice(userId, deviceId, fcmToken);
      Actions.TripsScreen();
    } catch (e) {
      handleError(e);
      this.setState({loadingSignUp: false});
    }
  };

  setDate = newDate => {
    this.setState({dob: newDate});
  };

  selectModalDate = (event, selectedDate) => {
    this.setState({dob: selectedDate});
    if (Platform.OS === 'android') {
      this.setState({showDatepickerModal: false});
      this.setDateModal();
    }
  };

  renderErrorMsg() {
    if (this.state.errMsg && this.state.errMsg !== '') {
      return (
        <Text center color={theme.colors.accent}>
          {this.state.errMsg}
        </Text>
      );
    }
  }

  setDateModal = () => {
    const age = this.getAge(this.state.dob);
    const MIN_REQ_AGE = 13;
    if (age < MIN_REQ_AGE) {
      Alert.alert(
        'You are not old enough',
        `You need to be ${MIN_REQ_AGE} and above to sign up.`,
      );
      return;
    }
    const dateText = formatDate(this.state.dob, '-', true);
    this.setState({showDatepickerModal: false, dateText});
  };
  renderDatePickerModal = () => {
    const {showDatepickerModal, dateText} = this.state;
    const isIos = Platform.OS === 'ios';
    if (isIos) {
      return (
        <Modal
          style={styles.datepickerModal}
          animationType="slide"
          visible={showDatepickerModal}
          onRequestClose={() => this.setState({showDatepickerModal: false})}>
          <View style={[styles.datepickerModal, {padding: 10}]}>
            <Button onPress={() => this.setState({showDatepickerModal: false})}>
              <MaterialIcons
                name="clear"
                color={theme.colors.primary}
                size={theme.sizes.font * 2.5}
              />
            </Button>
            <RNDateTimePicker
              style={styles.datepickerModal}
              testID="dateTimePicker"
              value={this.state.dob}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={this.selectModalDate}
            />
          </View>

          <Button ripple style={styles.setDateBtn} onPress={this.setDateModal}>
            <Text color={theme.colors.primary} size={20}>
              DONE
            </Text>
          </Button>
        </Modal>
      );
    } else {
      if (showDatepickerModal) {
        return (
          <RNDateTimePicker
            style={styles.datepickerModal}
            testID="dateTimePicker"
            value={this.state.dob}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={this.selectModalDate}
          />
        );
      }
      return null;
    }
  };

  handleSelectOrg(item) {
    const {_id: organisation, name: orgName} = item;
    this.setState({orgName, organisation, showOrganisationModal: false});
  }

  handleLongSelectOrg(item) {
    const {name, street_address, state} = item;
    const displayName = `${name}, ${street_address}, ${state}.`;
    Alert.alert('Organisation', displayName);
  }

  renderItem = ({item}) => {
    return (
      <TouchableHighlight
        activeOpacity={0.6}
        underlayColor="#DDDDDD"
        onPress={() => this.handleSelectOrg(item)}
        onLongPress={() => this.handleLongSelectOrg(item)}>
        <Card style={styles.suggestionContainer}>
          <Text
            numberOfLines={1}
            size={20}
            color={theme.colors.gray}
            style={styles.organisationsResult}>
            {item.name}, {item.street_address},{item.state}
          </Text>
        </Card>
      </TouchableHighlight>
    );
  };

  getOrganisation = organisationName => {
    this.setState({loadingGetOrg: true});
    get(`${getUrl('organisations')}?search=${organisationName}`)
      .then(response => {
        // console.log(response.data)
        this.setState({organisations: response.data, loadingGetOrg: false});
      })
      .catch(err => {
        this.setState({loadingGetOrg: false});
        console.log(err);
      });
  };

  getOrganisationDebounce = organisationName => {
    _.debounce(this.getOrganisation, 1000, {trailing: true})(organisationName);
  };

  getOrganisationThrottle = organisationName => {
    _.throttle(this.getOrganisation, 1000, {trailing: true})(organisationName);
  };

  handleTextChange = organisationName => {
    this.setState({organisationName});
    if (organisationName.length < 3) {
      return;
    }
    if (organisationName.length < 7) {
      this.getOrganisationDebounce(organisationName);
    } else {
      this.getOrganisationThrottle(organisationName);
    }
  };

  renderGetOrg = () => {
    const {loadingGetOrg} = this.state;
    return (
      <Modal
        animationType="slide"
        visible={this.state.showOrganisationModal}
        onRequestClose={() => this.setState({showOrganisationModal: false})}>
        <SafeAreaView style={{flex: 1}}>
          <Button onPress={() => this.setState({showOrganisationModal: false})}>
            <MaterialIcons
              name="clear"
              color={theme.colors.primary}
              size={theme.sizes.font * 2.5}
            />
          </Button>
          <Button onPress={this.addSchool} style={styles.addSchool}>
            <Text>
              Can't find my School ?<Text primary> &nbsp;Add School</Text>
            </Text>
          </Button>

          <View style={styles.autoCompContainer}>
            <TextInput
              placeholder="Name of Organisation"
              style={[styles.autoCompStyle]}
              value={this.state.organisationName}
              onChangeText={this.handleTextChange}
            />
            {loadingGetOrg && (
              <ActivityIndicator color={theme.colors.primary} size="small" />
            )}
          </View>
          <FlatList
            data={this.state.organisations}
            renderItem={this.renderItem}
            ItemSeparatorComponent={() => <View style={styles.line} />}
            keyExtractor={item => `${item._id}`}
            style={{marginBottom: 30}}
            // extraData={this.props}
          />
        </SafeAreaView>
      </Modal>
    );
  };

  leftItems = [
    {
      iconName: 'arrow-back',
      showCondition: true,
      onPress: Actions.pop,
      style: {color: theme.colors.primary},
    },
  ];

  addSchool = () => {
    console.log('clicked');
    this.setState({showOrganisationModal: false});

    setTimeout(() => {
      Actions.createOrganisation();
    }, 500);
  };

  render() {
    const {loadingSignUp, errors} = this.state;
    const hasErrors = key => (errors.includes(key) ? styles.hasErrors : null);

    return (
      <ScrollView style={{flex: 1}}>
        <Header title="Sign Up" leftItems={this.leftItems} />
        {this.renderGetOrg()}
        <Block>
          {this.renderErrorMsg()}
          <Block padding={[0, theme.sizes.base]}>
            <View style={styles.spaceBetween}>
              <Input
                email
                label="Firstname"
                autoCapitalize="words"
                error={hasErrors('first_name')}
                style={[styles.inputBtw, hasErrors('first_name')]}
                value={this.state.first_name}
                onChangeText={text => this.setState({first_name: text})}
              />
              <Input
                email
                label="Lastname"
                autoCapitalize="words"
                error={hasErrors('last_name')}
                style={[styles.inputBtw, hasErrors('last_name')]}
                value={this.state.last_name}
                onChangeText={text => this.setState({last_name: text})}
              />
            </View>
            <View style={styles.spaceBetween}>
              <Input
                email
                label="Email"
                error={hasErrors('email')}
                style={[styles.inputBtw, hasErrors('email')]}
                value={this.state.email}
                onChangeText={text => this.setState({email: text})}
              />
              <Input
                label="Username"
                error={hasErrors('username')}
                style={[styles.inputBtw, hasErrors('username')]}
                value={this.state.username}
                onChangeText={text => this.setState({username: text})}
              />
            </View>
            <Input
              secure
              label="Password"
              error={hasErrors('password')}
              style={[styles.input, hasErrors('password')]}
              value={this.state.password}
              onChangeText={text => this.setState({password: text})}
            />
            <View style={styles.bottomBorder}>
              <Text gray2 semibold>
                D.O.B
              </Text>
              <Button
                style={styles.mimicInputField}
                onPress={() => this.setState({showDatepickerModal: true})}>
                <Text
                  color={
                    this.state.dateText === 'Enter Date'
                      ? theme.colors.gray2
                      : 'black'
                  }>
                  {this.state.dateText}
                </Text>
              </Button>
            </View>
            {this.renderDatePickerModal()}
            <View style={[styles.pickerContainer, hasErrors('role')]}>
              <Picker
                mode="dropdown"
                iosHeader="Select your Role"
                iosIcon={<Icon name="arrow-down" />}
                placeholder="Select Role"
                textStyle={{
                  color:
                    this.state.role === ''
                      ? theme.colors.gray
                      : theme.colors.black,
                }}
                selectedValue={this.state.role}
                onValueChange={this.onValueChange.bind(this)}>
                <Picker.Item label="Select Role" value="" />
                {this.ROLES.map(org => (
                  <Picker.Item
                    key={org._id}
                    label={org.label}
                    value={org.value}
                  />
                ))}
              </Picker>
            </View>
            <View>
              <TouchableHighlight
                activeOpacity={0.3}
                underlayColor="#eee"
                onPress={() => this.setState({showOrganisationModal: true})}
                onLongPress={() => null}>
                <View style={styles.orgField}>
                  <Text size={18} gray>
                    Select Organization
                  </Text>
                  <Text style={[styles.orgDisplay, hasErrors('organization')]}>
                    {this.state.orgName}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>
          </Block>
          <View style={styles.flexCenter}>
            <Button
              ripple
              style={{width: '100%'}}
              gradient
              onPress={this.handleSignUp}>
              {loadingSignUp ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text bold white center>
                  Sign Up
                </Text>
              )}
            </Button>
          </View>

          <Button onPress={() => Actions.LoginScreen()}>
            <Text
              gray
              caption
              center
              // style={[styles.bottomBtn, {textDecorationLine: 'underline'}]}
            >
              Back to Login
            </Text>
          </Button>
        </Block>
      </ScrollView>
    );
  }
}

export default SignUp;

const styles = StyleSheet.create({
  signup: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputBtw: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: (width - 2 * theme.sizes.base) / 2,
  },
  ...Platform.select({
    android: {
      autocompleteContainer: {
        flex: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1,
      },
    },
    ios: {
      autocompleteContainer: {
        backgroundColor: '#ffffff',
        borderWidth: 0,
      },
    },
  }),
  onlyBottomBorder: {
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0.5,
  },
  flexEnd: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    textAlign: 'right',
  },
  btns: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: 120,
  },
  options: {
    borderWidth: 0,
    borderColor: theme.colors.gray,
    shadowColor: theme.colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.gray2,
  },
  bottomFixed: {
    // position: 'absolute',
    // bottom: 20,
    // width: 350,
    // left: (width - 350) * 0.5,
    // backgroundColor: '#eee'
  },
  flexCenter: {
    marginTop: 10,
    marginHorizontal: theme.sizes.base,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomBtn: {
    width: 300,
  },
  hasErrors: {
    borderBottomColor: theme.colors.accent,
    borderBottomWidth: 2,
  },
  pickerContainer: {
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 30,
  },
  bottomBorder: {
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexItem: {
    flexBasis: 1,
  },
  // new auto complete styles
  autocompletesContainer: {
    paddingTop: 0,
    zIndex: 1,
    width: '100%',
    paddingHorizontal: 8,
  },
  autoInput: {
    width: '100%',
    color: 'black',
    borderWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.gray2,
  },
  overlayStyle: {
    backgroundColor: 'black',
  },
  rolePickerStyle: {
    color: theme.colors.gray2,
  },
  pickerStyle: {
    borderWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  plus: {
    position: 'absolute',
    left: 15,
    top: 10,
  },
  datepickerModal: {
    flex: 1,
    marginTop: statusBarHeight,
    marginLeft: (width - 375) / 2, // makeshift cos of some issues with datepicker
  },

  //end auto complete tyles
  setDateBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: statusBarHeight * 2,
  },
  autoCompContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: 30,
    width: '100%',
    margin: 0,

    // width: (width - 2 * theme.sizes.base) / 2,
  },
  autoCompStyle: {
    borderRadius: 0,
    borderWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 0,
    fontSize: 20,
    // borderBottomColor: theme.colors.gray2,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // width: (width - 2 * theme.sizes.base) / 2,
  },
  organisationsResult: {
    // padding: 5,
    fontSize: 16,
  },
  line: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    borderBottomColor: 'rgba(255,255,255,0)',
  },
  suggestionContainer: {
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  orgDisplay: {
    color: theme.colors.black,
    fontWeight: '500',
    // borderBottomColor: theme.colors.gray2,
    paddingVertical: 20,
    // width: '100%',
  },
  orgField: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.gray2,
    paddingTop: 10,
    width: '100%',
  },
  addSchool: {
    paddingHorizontal: 10,
    height: 20,
    margin: 0,
  },
});
