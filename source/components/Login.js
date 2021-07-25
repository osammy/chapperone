/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  StatusBar,
  Image,
  View,
} from 'react-native';
import jwt_decode from 'jwt-decode';
import messaging from '@react-native-firebase/messaging';

import {Button, Block, Input, Text} from '../UI';
import {theme} from '../constants';
import {Actions} from 'react-native-router-flux';
import {getUrl} from '../resources/controllers/url';
import {post, postWithAuth} from '../resources/controllers/data/index';
import {setUserToken, handleError} from '../resources/utils';
import {connect} from 'react-redux';
import {saveUser} from '../actions/AuthActions';
import {getUniqueId} from 'react-native-device-info';

class Login extends Component {
  // state = {
  //   email: 'o@g.com',
  //   username: 'o',
  //   password: 'o',
  //   errors: [],
  //   loading: false,
  // };

  state = {
    email: '',
    username: '',
    password: '',
    errors: [],
    loading: false,
  };

  upsertDevice = (deviceId, user, fcmToken, active) => {
    const body = {deviceId, user, fcmToken, active};
    const url = getUrl('devices');
    return postWithAuth(url, body);
  };

  handleLogin = async () => {
    const {email, username, password} = this.state;
    const errors = [];
    // console.log('await messaging().getToken()');

    // Actions.SettingsScreen();

    Keyboard.dismiss();
    this.setState({loading: true});

    // check with backend API or with some static data
    // if (email === '') {
    //   errors.push('email');
    // }

    if (username === '') {
      errors.push('username');
    }
    if (password === '') {
      errors.push('password');
    }

    if (errors.length) {
      this.setState({errors, loading: false});
      return;
    }

    try {
      const data = {username, password};
      const url = getUrl('users');
      const loginUrl = `${url}/login`;

      const {data: token} = await post(loginUrl, data);
      const user = jwt_decode(token);
      // Save user as a prop in state management
      this.props.saveUser(user);
      // store user token to asyncstorage
      await setUserToken(token);
      const deviceId = await getUniqueId();

      try {
        const fcmToken = await messaging().getToken();
        const userId = user._id;
        const active = true; // set device to active
        /**
         * This creates this device if it doesnt exists, if it does it updates it
         * When user clears data for instance, i noticed the FCM token changed
         * Hence its important to check for it upon login and set active
         */
        await this.upsertDevice(deviceId, userId, fcmToken, active);
      } catch (e) {
        // Fail silently
      }

      Actions.TripsScreen();
    } catch (e) {
      console.log(e);
      this.setState({loading: false});
      handleError(e);
    }
  };

  render() {
    const {loading, errors} = this.state;
    const hasErrors = key => (errors.includes(key) ? styles.hasErrors : null);
    return (
      <Block padding={[0, theme.sizes.base * 2]}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={styles.iconContainer}>
          <Image
            source={require('../assets/icon_set/icon_n_text_500px.jpg')}
            resizeMode="contain"
            style={styles.icon}
          />
        </View>

        <Block padding={[theme.sizes.base * 10, 0]}>
          <Input
            placeholder="Username or Email"
            error={hasErrors('username')}
            style={[styles.input, hasErrors('username')]}
            defaultValue={this.state.username}
            onChangeText={text => this.setState({username: text})}
          />
          <Input
            placeholder="Passsword"
            error={hasErrors('password')}
            style={[styles.input, hasErrors('password')]}
            defaultValue={this.state.password}
            onChangeText={text => this.setState({password: text})}
            secure
          />
          <Button ripple gradient onPress={this.handleLogin}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text bold white center>
                Login
              </Text>
            )}
          </Button>
          <Text gray center middle>
            OR
          </Text>

          <Button
            ripple
            style={styles.card}
            onPress={() => Actions.SignupScreen()}>
            <Text center semibold white>
              Signup
            </Text>
          </Button>

          <Button onPress={() => Actions.forgotScreen()}>
            <Text gray caption center style={{textDecorationLine: 'underline'}}>
              Forgot your password?
            </Text>
          </Button>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  login: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hasErrors: {
    borderBottomColor: theme.colors.accent,
  },
  // icon: {
  //   width: 100,
  //   height: 100,
  // },
  icon: {
    width: 250,
    height: 250,
  },
  iconContainer: {
    flex: 0.3,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 50,
  },
  card: {
    shadowColor: theme.colors.gray2,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: theme.colors.accent,
    // marginHorizontal: theme.sizes.margin / 4,
    // marginVertical: theme.sizes.margin / 6,
    // height: 450,
  },
});

export default connect(
  null,
  {saveUser},
)(Login);
