/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import {Button, Block, Input, Text} from '../UI';
import {theme} from '../constants';
import {SafeAreaView} from 'react-navigation';
import {getUrl} from '../resources/controllers/url';
import {post} from '../resources/controllers/data';
import {handleError} from '../resources/utils';

const statusBarHeight = getStatusBarHeight();

export default class SetNewPassword extends Component {
  state = {
    password: '',
    passwordRetype: '',
    errors: [],
    loading: false,
  };

  handleSet = async () => {
    const {password, passwordRetype} = this.state;
    const errors = [];

    Keyboard.dismiss();
    this.setState({loading: true});

    try {
      // check with backend API or with some static data
      if (password === '') errors.push('password');
      if (passwordRetype === '') errors.push('passwordRetype');

      if (password !== passwordRetype) {
        errors.push('passwordRetype');
        errors.push('password');
      }

      if (errors.length > 0) {
        let errMsg = `Please provide a valid ${errors[0]}`;
        if (errors.includes('password') && errors.includes('passwordRetype')) {
          errMsg = 'Please make sure your password match!';
        }
        this.setState({
          errors,
          loading: false,
          errMsg,
        });
        return;
      }

      this.setState({errors, loading: false});
      const url = getUrl('users');
      const body = {
        resetCode: this.props.reset.resetCode,
        password,
        email: this.props.reset.email,
      };

      console.log(body);
      await post(`${url}/passwordChange`, body);
      Alert.alert(
        'Success',
        'Your password has been changed succesfully, proceed to login.',
        [
          {
            text: 'Proceed',
            onPress: Actions.LoginScreen,
            style: 'cancel',
          },
          //   {
          //     text: 'Proceed',
          //     onPress: () => null,
          //     style: 'cancel',
          //   },
        ],
        {cancelable: false},
      );
    } catch (e) {
      handleError(e);
    }
  };

  render() {
    const {loading, errors} = this.state;
    const hasErrors = key => (errors.includes(key) ? styles.hasErrors : null);

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#15ccab" barStyle="light-content" />
        <Text h1 bold color={theme.colors.gray}>
          Forgot Password
        </Text>
        <Block middle>
          <Input
            secure
            label="Password"
            error={hasErrors('email')}
            style={[styles.input, hasErrors('email')]}
            defaultValue={this.state.password}
            onChangeText={text => this.setState({password: text})}
          />
          <Input
            secure
            label="Retype Password"
            error={hasErrors('passwordRetype')}
            style={[styles.input, hasErrors('passwordRetype')]}
            defaultValue={this.state.passwordRetype}
            onChangeText={text => this.setState({passwordRetype: text})}
          />
          <Button gradient ripple onPress={() => this.handleSet()}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text bold white center>
                Send new password
              </Text>
            )}
          </Button>

          <Button onPress={() => Actions.LoginScreen()}>
            <Text gray caption center style={{textDecorationLine: 'underline'}}>
              Back to Login
            </Text>
          </Button>
        </Block>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.sizes.base * 2,
    ...Platform.select({
      ios: {
        marginTop: statusBarHeight,
      },
    }),
  },
  forgot: {
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
});
