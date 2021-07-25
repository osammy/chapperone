/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Platform,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import {Button, Block, Input, Text, Loading} from '../UI';
import {theme} from '../constants';
import {get} from '../resources/controllers/data';
import {getUrl} from '../resources/controllers/url';
import {handleError} from '../resources/utils';

const statusBarHeight = getStatusBarHeight();

export default class Forgot extends Component {
  state = {
    email: '',
    errors: [],
    loading: false,
    errMsg: '',
  };

  handleSendResetCode = async () => {
    const {email} = this.state;
    const errors = [];

    Keyboard.dismiss();
    this.setState({loading: true});

    // check with backend API or with some static data
    if (email === '') {
      errors.push('email');
    }

    if (errors.length > 0) {
      this.setState({
        errors,
        loading: false,
        errMsg: `Please provide a valid ${errors[0]}`,
      });
      return;
    }

    try {
      const url = getUrl('users');
      await get(`${url}/forgotPassword/${email}`);
      this.setState({errors, loading: false});
      setTimeout(() => {
        Actions.passwordReset({reset: {email}});
      });
    } catch (e) {
      this.setState({loading: false});
      handleError(e);
    }
  };

  render() {
    const {loading, errors} = this.state;
    const hasErrors = key => (errors.includes(key) ? styles.hasErrors : null);

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#15ccab" barStyle="light-content" />
        <Loading
          show={this.state.loading}
          loadingText="Sending a password code"
        />
        <Text h1 bold color={theme.colors.gray}>
          Forgot Password
        </Text>
        <Block middle>
          <Text center accent>
            {this.state.errMsg}
          </Text>
          <Input
            label="Email"
            error={hasErrors('email')}
            style={[styles.input, hasErrors('email')]}
            defaultValue={this.state.email}
            onChangeText={text => this.setState({email: text})}
          />
          <Button gradient ripple onPress={() => this.handleSendResetCode()}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text bold white center>
                Send me a reset
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
        // marginTop: statusBarHeight,
        borderWidth: 1,
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
